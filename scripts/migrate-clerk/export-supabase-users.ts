/**
 * EVO-008 — Export utenti Supabase Auth → JSON locale (via SQL diretto).
 *
 * Legge `auth.users` dal Postgres del progetto Supabase legacy e scrive un dump
 * JSON in scripts/migrate-clerk/output/. Il dump è consumato da
 * import-clerk-users.ts. NON effettua scritture (sola lettura).
 *
 * Perché SQL diretto e non l'Admin SDK: `supabase.auth.admin.listUsers()` NON
 * espone `encrypted_password` (campo riservato di GoTrue). Per migrare le
 * credenziali a Clerk con `passwordHasher: 'bcrypt'` serve l'hash originale,
 * leggibile solo via SQL su `auth.users`.
 *
 * Uso:
 *   npx tsx scripts/migrate-clerk/export-supabase-users.ts
 *
 * Env richiesta (.env.local): SUPABASE_DB_URL
 *   Connection string del Postgres legacy. La trovi in:
 *   Supabase Dashboard → Project Settings → Database → Connection string → URI.
 *   Forma (direct):  postgresql://postgres:<PWD>@db.<ref>.supabase.co:5432/postgres
 *   Forma (pooler):  postgresql://postgres.<ref>:<PWD>@aws-0-<region>.pooler.supabase.com:6543/postgres
 *   La password è quella del DB (NON il service_role key).
 */

import postgres from "postgres";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLocalEnv, requireEnv } from "./lib/env";

loadLocalEnv();

const OUTPUT_DIR = join(process.cwd(), "scripts", "migrate-clerk", "output");

/** Forma normalizzata di un utente esportato (consumata da import-clerk-users.ts). */
export interface ExportedUser {
  id: string;
  email: string;
  encrypted_password: string | null;
  created_at: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  banned_until: string | null;
}

/** Riga grezza di auth.users come la restituisce il driver postgres. */
interface AuthUserRow {
  id: string;
  email: string | null;
  encrypted_password: string | null;
  created_at: Date | null;
  raw_user_meta_data: Record<string, unknown> | null;
  banned_until: Date | null;
}

function toIso(d: Date | null): string | null {
  return d ? new Date(d).toISOString() : null;
}

async function main(): Promise<void> {
  const dbUrl = requireEnv("SUPABASE_DB_URL");

  // `prepare: false` per compatibilità col transaction pooler (porta 6543);
  // `ssl: 'require'` perché Supabase accetta solo connessioni TLS; `max: 1`
  // perché è uno script one-shot e una sola connessione basta.
  const sql = postgres(dbUrl, { ssl: "require", prepare: false, max: 1 });

  console.log("→ Export utenti Supabase Auth (SQL diretto su auth.users)…");

  try {
    const rows = await sql<AuthUserRow[]>`
      SELECT
        id::text           AS id,
        LOWER(email)       AS email,
        encrypted_password AS encrypted_password,
        created_at         AS created_at,
        raw_user_meta_data AS raw_user_meta_data,
        banned_until       AS banned_until
      FROM auth.users
      WHERE email IS NOT NULL
      ORDER BY created_at ASC
    `;

    const users: ExportedUser[] = rows.map((r) => ({
      id: r.id,
      email: (r.email ?? "").toLowerCase(),
      encrypted_password: r.encrypted_password ?? null,
      created_at: toIso(r.created_at),
      raw_user_meta_data: r.raw_user_meta_data ?? null,
      banned_until: toIso(r.banned_until),
    }));

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
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("❌ Errore inatteso:", err);
  process.exit(1);
});
