import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import PortaleNavBar from "@/components/portale/PortaleNavBar";
import {
  getGenitoreByClerkId,
  getGenitoreByEmail,
  getMaestroByEmail,
  getMaestroByGenitoreId,
  linkMaestroToGenitore,
  createGenitore,
  updateGenitoreAuthUserId,
  type Ruolo,
} from "@/lib/airtable-portale";

export default async function PortaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    try {
      await syncGenitore(userId);
    } catch (err) {
      console.error("[portale-layout] sync error:", err);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-bg-soft">
      <PortaleNavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

async function syncGenitore(clerkUserId: string): Promise<void> {
  // Fast path: già linkato in Airtable. Verifichiamo comunque che il ruolo
  // Clerk publicMetadata sia allineato al RUOLO Airtable (l'utente potrebbe
  // essere stato promosso/declassato, o si è passati a un base diverso).
  const existing = await getGenitoreByClerkId(clerkUserId);
  if (existing) {
    const ruoloExisting = existing.fields.RUOLO ?? "GENITORE";
    await syncClerkRole(clerkUserId, ruoloExisting);
    if (ruoloExisting === "ISTRUTTORE") {
      const email = existing.fields.EMAIL_GENITORE;
      if (email) {
        await syncMaestroLinkedToGenitore(existing.id, email);
      }
    }
    return;
  }

  const user = await currentUser();
  if (!user) return;

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  let ruolo: Ruolo = "GENITORE";
  let genitoreRecordId: string | undefined;

  const byEmail = await getGenitoreByEmail(email);
  if (byEmail) {
    // Email già in Airtable (pre-registrata o registrata via email/pwd) ma senza AUTH_USER_ID
    await updateGenitoreAuthUserId(byEmail.id, clerkUserId);
    ruolo = byEmail.fields.RUOLO ?? "GENITORE";
    genitoreRecordId = byEmail.id;
  } else {
    // Nuovo utente (es. Google OAuth con email non registrata)
    const created = await createGenitore({
      NOME_GENITORE: user.firstName ?? "",
      COGNOME_GENITORE: user.lastName ?? "",
      EMAIL_GENITORE: email,
      AUTH_USER_ID: clerkUserId,
      RUOLO: "GENITORE",
      FLAG_PRIVACY: false,
    });
    genitoreRecordId = created.id;
  }

  await syncClerkRole(clerkUserId, ruolo);
  if (ruolo === "ISTRUTTORE" && genitoreRecordId) {
    await syncMaestroLinkedToGenitore(genitoreRecordId, email);
  }
  console.log("[portale-layout] sync:", email, "→ ruolo:", ruolo);
}

/**
 * Lazy sync EVO-006: linka il record TABELLA_MAESTRI corrispondente
 * (via email match) al genitore esistente, se non già linkato.
 * Non bloccante: se l'email non risulta in TABELLA_MAESTRI, logga warning
 * e la dashboard mostra banner "Account maestro non collegato".
 */
async function syncMaestroLinkedToGenitore(
  genitoreRecordId: string,
  email: string,
): Promise<void> {
  try {
    const existing = await getMaestroByGenitoreId(genitoreRecordId);
    if (existing) return;

    const byEmail = await getMaestroByEmail(email);
    if (!byEmail) {
      console.warn(
        `[portale-layout] ISTRUTTORE ${email} non trovato in TABELLA_MAESTRI — contattare admin`,
      );
      return;
    }
    await linkMaestroToGenitore(byEmail.id, genitoreRecordId);
    console.log("[portale-layout] maestro linked:", email, "→", byEmail.id);
  } catch (err) {
    console.warn("[portale-layout] maestro sync failed (non-blocking):", err);
  }
}

/**
 * Aggiorna Clerk publicMetadata.role se diverso dal ruolo Airtable.
 * Evita scritture inutili (e quindi invalidazione della sessione) quando già allineato.
 */
async function syncClerkRole(clerkUserId: string, ruolo: Ruolo): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const currentRole = user.publicMetadata?.role;
  if (currentRole === ruolo) return;
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: ruolo },
  });
  console.log("[portale-layout] clerk role sync:", clerkUserId, currentRole, "→", ruolo);
}
