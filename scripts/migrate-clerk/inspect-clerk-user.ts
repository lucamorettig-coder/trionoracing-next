/**
 * EVO-008 — Diagnostic tool: ispeziona lo stato di un utente Clerk per email.
 *
 * Utile quando l'import script dice "skipped-clerk-exists" ma l'utente non
 * riesce a fare login (banned/locked/OAuth-only/email non verificata), oppure
 * per verificare che un utente migrato esista con password abilitata.
 *
 * NB: usa la CLERK_SECRET_KEY caricata da .env.local. Per ispezionare
 * l'istanza PRODUCTION passa la key sk_live_ inline:
 *   CLERK_SECRET_KEY=sk_live_... npx tsx scripts/migrate-clerk/inspect-clerk-user.ts <email>
 *
 * Sola lettura: non scrive nulla.
 */
import { createClerkClient } from "@clerk/backend";
import { loadLocalEnv, requireEnv } from "./lib/env";

loadLocalEnv();

const email = process.argv[2]?.toLowerCase();
if (!email) {
  console.error("Usage: tsx inspect-clerk-user.ts <email>");
  process.exit(1);
}

(async () => {
  const clerk = createClerkClient({ secretKey: requireEnv("CLERK_SECRET_KEY") });

  console.log(`\n→ Inspect Clerk user for email: ${email}\n`);
  const list = await clerk.users.getUserList({ emailAddress: [email] });
  const arr = (
    Array.isArray(list) ? list : (list as { data: unknown[] }).data
  ) as Array<Record<string, unknown>>;

  console.log(`Found ${arr.length} user(s).\n`);

  for (const u of arr) {
    const emailAddresses = (u.emailAddresses ?? []) as Array<{
      id: string;
      emailAddress: string;
      verification?: { status?: string; strategy?: string };
    }>;
    const externalAccounts = (u.externalAccounts ?? []) as Array<{
      provider?: string;
      emailAddress?: string;
      verification?: { status?: string };
    }>;

    console.log(
      JSON.stringify(
        {
          id: u.id,
          externalId: u.externalId,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          banned: u.banned,
          locked: u.locked,
          lockoutExpiresInSeconds: u.lockoutExpiresInSeconds,
          lastSignInAt: u.lastSignInAt,
          passwordEnabled: u.passwordEnabled,
          twoFactorEnabled: u.twoFactorEnabled,
          primaryEmailAddressId: u.primaryEmailAddressId,
          emailAddresses: emailAddresses.map((e) => ({
            id: e.id,
            emailAddress: e.emailAddress,
            verificationStatus: e.verification?.status,
            verificationStrategy: e.verification?.strategy,
            isPrimary: e.id === u.primaryEmailAddressId,
          })),
          externalAccounts: externalAccounts.map((a) => ({
            provider: a.provider,
            emailAddress: a.emailAddress,
            verificationStatus: a.verification?.status,
          })),
          publicMetadata: u.publicMetadata,
        },
        null,
        2,
      ),
    );
    console.log("---");
  }
})().catch((err) => {
  console.error("❌ Errore:", err);
  process.exit(1);
});
