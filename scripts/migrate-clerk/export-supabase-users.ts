/**
 * EVO-008 — Export utenti Supabase Auth → JSON locale.
 *
 * Legge `auth.users` dal progetto Supabase legacy via service_role e scrive un
 * dump JSON in scripts/migrate-clerk/output/. Il dump è consumato da
 * import-clerk-users.ts. NON effettua scritture su Supabase (sola lettura).
 *
 * Uso:
 *   npx tsx scripts/migrate-clerk/export-supabase-users.ts
 *
 * Env richieste (.env.local): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLocalEnv, requireEnv } from "./lib/env";

loadLocalEnv();

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const OUTPUT_DIR = join(process.cwd(), "scripts", "migrate-clerk", "output");

/** Forma normalizzata di un utente esportato. */
export interface ExportedUser {
  id: string;
  email: string;
  encrypted_password: string | null;
  created_at: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  banned_until: string | null;
}

async function main(): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("→ Export utenti Supabase Auth…");

  const users: ExportedUser[] = [];
  let page = 1;
  const perPage = 1000;

  // listUsers pagina finché ritorna meno di perPage
  // (Supabase Admin API: GoTrue paginazione 1-based).
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("❌ Errore listUsers:", error.message);
      process.exit(1);
    }
    const batch = data?.users ?? [];
    for (const u of batch) {
      // encrypted_password non è esposto dall'Admin SDK tipizzato → cast.
      const raw = u as unknown as Record<string, unknown>;
      users.push({
        id: u.id,
        email: (u.email ?? "").toLowerCase(),
        encrypted_password: (raw.encrypted_password as string | undefined) ?? null,
        created_at: u.created_at ?? null,
        raw_user_meta_data: (u.user_metadata as Record<string, unknown>) ?? null,
        banned_until: (raw.banned_until as string | undefined) ?? null,
      });
    }
    if (batch.length < perPage) break;
    page += 1;
  }

  // ── Report anomalie (non bloccanti) ──
  const senzaHash = users.filter((u) => !u.encrypted_password);
  const senzaEmail = users.filter((u) => !u.email);
  const now = Date.now();
  const banned = users.filter(
    (u) => u.banned_until && new Date(u.banned_until).getTime() > now,
  );

  const seen = new Map<string, number>();
  for (const u of users) seen.set(u.email, (seen.get(u.email) ?? 0) + 1);
  const duplicate = [...seen.entries()].filter(([email, n]) => email && n > 1);

  // ── Scrittura dump ──
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(OUTPUT_DIR, `supabase-users-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(users, null, 2), "utf8");

  console.log("\n──────── REPORT EXPORT ────────");
  console.log(`Utenti totali:        ${users.length}`);
  console.log(`Senza hash password:  ${senzaHash.length}`);
  console.log(`Senza email:          ${senzaEmail.length}`);
  console.log(`Banned (attivi):      ${banned.length}`);
  console.log(`Email duplicate:      ${duplicate.length}`);
  if (duplicate.length > 0) {
    for (const [email, n] of duplicate) console.log(`   • ${email} ×${n}`);
  }
  if (senzaHash.length > 0) {
    console.log("\n⚠️  Utenti senza hash (non importabili con password):");
    for (const u of senzaHash) console.log(`   • ${u.email || u.id}`);
  }
  console.log("───────────────────────────────");
  console.log(`\n✅ Dump scritto: ${outPath}\n`);
}

main().catch((err) => {
  console.error("❌ Errore inatteso:", err);
  process.exit(1);
});
