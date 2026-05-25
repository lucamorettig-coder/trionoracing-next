import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-admin";
import { getBambinoByIdAdmin, getIscrizioniByBambino } from "@/lib/airtable-admin";
import { DettaglioBambinoAdmin } from "@/components/admin/bambini/DettaglioBambinoAdmin";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { console.error("[admin/bambini/id]", err); return fallback; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const bambino = await safe(() => getBambinoByIdAdmin(id), null);
  if (!bambino) notFound();
  const iscrizioni = await safe(() => getIscrizioniByBambino(id), []);
  return <DettaglioBambinoAdmin bambino={bambino} iscrizioni={iscrizioni} />;
}
