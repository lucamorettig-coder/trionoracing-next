/**
 * EVO-008 — Import utenti Supabase → Clerk conservando le credenziali.
 *
 * Legge il dump prodotto da export-supabase-users.ts e crea gli utenti Clerk con
 * `passwordHasher: 'bcrypt'` + `passwordDigest` (l'hash Supabase originale), così
 * gli utenti entrano con la stessa email+password. Tagga poi Airtable
 * (LEGACY_SUPABASE_ID + DATA_MIGRAZIONE). Il webhook Clerk `user.created` si
 * triggera in cascade dalla createUser e setta AUTH_USER_ID per email-match.
 *
 * Uso:
 *   npx tsx scripts/migrate-clerk/import-clerk-users.ts [opzioni]
 *
 * Opzioni:
 *   --dry-run            Nessuna scrittura su Clerk/Airtable. Stampa cosa farebbe.
 *   --limit N            Processa al massimo N utenti (pilot).
 *   --input <path>       Usa questo dump invece dell'ultimo in output/.
 *   --email <email>      Processa solo l'utente con questa email (pilot mirato).
 *
 * Env (.env.local): CLERK_SECRET_KEY, AIRTABLE_BASE_ID, AIRTABLE_TOKEN
 */

import { createClerkClient } from "@clerk/backend";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadLocalEnv, requireEnv } from "./lib/env";
import { tagGenitoreAsMigrated, getRoleFromAirtable } from "./lib/airtable-tag";
import type { ExportedUser } from "./export-supabase-users";

loadLocalEnv();

const OUTPUT_DIR = join(process.cwd(), "scripts", "migrate-clerk", "output");
const BCRYPT_RE = /^\$2[aby]\$/;

// ── CLI parsing ──
function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = {
    dryRun: false,
    limit: undefined as number | undefined,
    input: undefined as string | undefined,
    email: undefined as string | undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--limit") opts.limit = parseInt(argv[++i], 10);
    else if (a === "--input") opts.input = argv[++i];
    else if (a === "--email") opts.email = argv[++i]?.toLowerCase();
  }
  return opts;
}

function resolveInputPath(input?: string): string {
  if (input) return input;
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.startsWith("supabase-users-") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    console.error(
      "❌ Nessun dump trovato in output/. Esegui prima export-supabase-users.ts (o passa --input).",
    );
    process.exit(1);
  }
  return join(OUTPUT_DIR, files[files.length - 1]);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Esegue fn con retry exponential backoff su 429 (max 5 tentativi, cap 30s). */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let delay = 1000;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt <= 5) {
        console.warn(`   ⏳ 429 su ${label}, retry ${attempt}/5 tra ${delay}ms…`);
        await sleep(delay);
        delay = Math.min(delay * 2, 30000);
        continue;
      }
      throw err;
    }
  }
}

type Status =
  | "created"
  | "skipped-clerk-exists"
  | "skipped-no-hash"
  | "skipped-bad-hash"
  | "skipped-no-email"
  | "error";

interface UserResult {
  email: string;
  status: Status;
  clerkId?: string;
  banned?: boolean;
  tagged: boolean;
  tagReason?: string;
  error?: string;
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const secretKey = requireEnv("CLERK_SECRET_KEY");
  // getRoleFromAirtable / tagGenitoreAsMigrated validano AIRTABLE_* a runtime.

  const clerk = createClerkClient({ secretKey });

  const inputPath = resolveInputPath(opts.input);
  let users: ExportedUser[] = JSON.parse(readFileSync(inputPath, "utf8"));

  if (opts.email) users = users.filter((u) => u.email === opts.email);
  if (opts.limit !== undefined) users = users.slice(0, opts.limit);

  console.log(`\n→ Import ${users.length} utenti da ${inputPath}`);
  console.log(
    `   modalità: ${opts.dryRun ? "DRY-RUN (nessuna scrittura)" : "LIVE"}\n`,
  );

  const results: UserResult[] = [];
  const processed = new Set<string>();
  let count = 0;

  for (const u of users) {
    count++;
    const email = (u.email ?? "").toLowerCase();
    const prefix = `[${count}/${users.length}] ${email || u.id}`;

    if (!email) {
      results.push({ email: u.id, status: "skipped-no-email", tagged: false });
      console.log(`${prefix} → skip (no email)`);
      continue;
    }
    if (processed.has(email)) {
      console.log(`${prefix} → skip (duplicato nello stesso run)`);
      continue;
    }
    processed.add(email);

    try {
      // 1. Pre-check Clerk: utente già esistente?
      const list = await withRetry(
        () => clerk.users.getUserList({ emailAddress: [email] }),
        "getUserList",
      );
      const existing = Array.isArray(list)
        ? list
        : (list as { data: unknown[] }).data;

      // 2. Ruolo da Airtable (per publicMetadata.role — evita JWT staleness)
      const role = await getRoleFromAirtable(email);

      if (existing.length > 0) {
        // Utente nativo o già importato → tag Airtable per tracciabilità.
        const tag = await tagGenitoreAsMigrated(email, u.id, opts.dryRun);
        results.push({
          email,
          status: "skipped-clerk-exists",
          tagged: tag.tagged,
          tagReason: tag.reason,
        });
        console.log(`${prefix} → skip (già su Clerk), tagged=${tag.tagged}`);
        continue;
      }

      // 3. Validazione hash bcrypt
      const hash = u.encrypted_password;
      if (!hash) {
        results.push({ email, status: "skipped-no-hash", tagged: false });
        console.log(`${prefix} → skip (hash mancante)`);
        continue;
      }
      if (!BCRYPT_RE.test(hash)) {
        results.push({ email, status: "skipped-bad-hash", tagged: false });
        console.log(`${prefix} → skip (hash non bcrypt: ${hash.slice(0, 6)}…)`);
        continue;
      }

      const isBanned = !!u.banned_until && new Date(u.banned_until).getTime() > Date.now();

      if (opts.dryRun) {
        const tag = await tagGenitoreAsMigrated(email, u.id, true);
        results.push({
          email,
          status: "created",
          banned: isBanned,
          tagged: false,
          tagReason: tag.reason,
        });
        console.log(
          `${prefix} → [dry-run] creerebbe utente (role=${role}, banned=${isBanned}, airtable=${tag.reason})`,
        );
        continue;
      }

      // 4. Crea utente Clerk con hash bcrypt conservato
      const newUser = await withRetry(
        () =>
          clerk.users.createUser({
            emailAddress: [email],
            passwordDigest: hash,
            passwordHasher: "bcrypt",
            externalId: u.id,
            publicMetadata: {
              migratedFromSupabase: true,
              migrationDate: new Date().toISOString(),
              role,
            },
          }),
        "createUser",
      );

      // 5. Banna se era banned su Supabase
      if (isBanned) {
        await withRetry(() => clerk.users.banUser(newUser.id), "banUser");
      }

      // 6. Tag Airtable
      const tag = await tagGenitoreAsMigrated(email, u.id, false);

      results.push({
        email,
        status: "created",
        clerkId: newUser.id,
        banned: isBanned,
        tagged: tag.tagged,
        tagReason: tag.reason,
      });
      console.log(
        `${prefix} → creato ${newUser.id} (role=${role}, banned=${isBanned}, tagged=${tag.tagged})`,
      );

      // 7. Rate limiting: Clerk ~20 req/s, Airtable 5 req/s
      await sleep(100);
      if (count % 10 === 0) await sleep(200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ email, status: "error", tagged: false, error: msg });
      console.error(`${prefix} → ERRORE: ${msg}`);
    }
  }

  // ── Report finale ──
  const summary: Record<Status, number> = {
    created: 0,
    "skipped-clerk-exists": 0,
    "skipped-no-hash": 0,
    "skipped-bad-hash": 0,
    "skipped-no-email": 0,
    error: 0,
  };
  for (const r of results) summary[r.status]++;

  console.log("\n──────── REPORT IMPORT ────────");
  console.log(`Modalità:             ${opts.dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`Processati:           ${results.length}`);
  console.log(`Creati:               ${summary.created}`);
  console.log(`Skip (già su Clerk):  ${summary["skipped-clerk-exists"]}`);
  console.log(`Skip (hash mancante): ${summary["skipped-no-hash"]}`);
  console.log(`Skip (hash non bcrypt): ${summary["skipped-bad-hash"]}`);
  console.log(`Skip (no email):      ${summary["skipped-no-email"]}`);
  console.log(`Errori:               ${summary.error}`);
  console.log("───────────────────────────────");

  if (!opts.dryRun) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = join(OUTPUT_DIR, `migration-report-${stamp}.json`);
    writeFileSync(
      reportPath,
      JSON.stringify({ summary, results }, null, 2),
      "utf8",
    );
    console.log(`\n✅ Report scritto: ${reportPath}\n`);
  } else {
    console.log("\n(dry-run: nessun report JSON scritto)\n");
  }
}

main().catch((err) => {
  console.error("❌ Errore inatteso:", err);
  process.exit(1);
});
