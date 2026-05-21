import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import PortaleNavBar from "@/components/portale/PortaleNavBar";
import {
  getGenitoreByClerkId,
  getGenitoreByEmail,
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
  // Fast path: already synced
  const existing = await getGenitoreByClerkId(clerkUserId);
  if (existing) return;

  const user = await currentUser();
  if (!user) return;

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  let ruolo: Ruolo = "GENITORE";

  const byEmail = await getGenitoreByEmail(email);
  if (byEmail) {
    // Email già in Airtable (pre-registrata o registrata via email/pwd) ma senza AUTH_USER_ID
    await updateGenitoreAuthUserId(byEmail.id, clerkUserId);
    ruolo = byEmail.fields.RUOLO ?? "GENITORE";
  } else {
    // Nuovo utente (es. Google OAuth con email non registrata)
    await createGenitore({
      NOME_GENITORE: user.firstName ?? "",
      COGNOME_GENITORE: user.lastName ?? "",
      EMAIL_GENITORE: email,
      AUTH_USER_ID: clerkUserId,
      RUOLO: "GENITORE",
      FLAG_PRIVACY: false,
    });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: ruolo },
  });

  console.log("[portale-layout] sync:", email, "→ ruolo:", ruolo);
}
