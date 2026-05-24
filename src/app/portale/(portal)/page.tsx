import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGenitoreByClerkId, getBambiniByGenitore, getIscrizioniByGenitore, getTitoliByGenitore } from "@/lib/airtable-portale";
import DashboardGenitore from "@/components/portale/dashboard/DashboardGenitore";

export default async function PortalePage() {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.role as string) ?? "GENITORE";

  if (role === "ADMIN") redirect("/portale/admin");
  if (role === "ISTRUTTORE") redirect("/portale/lezioni");

  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const [bambini, iscrizioni, { titoli }] = await Promise.all([
    getBambiniByGenitore(genitore.id),
    getIscrizioniByGenitore(genitore.id),
    getTitoliByGenitore(genitore.id),
  ]);

  return <DashboardGenitore genitore={genitore} bambini={bambini} iscrizioni={iscrizioni} titoli={titoli} />;
}
