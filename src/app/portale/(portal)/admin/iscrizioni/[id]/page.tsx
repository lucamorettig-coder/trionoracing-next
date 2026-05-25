import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-admin";
import { getIscrizioneByIdAdmin } from "@/lib/airtable-admin";
import { getTitoliPagamento } from "@/lib/airtable-portale";
import { DettaglioIscrizioneAdmin } from "@/components/admin/iscrizioni/DettaglioIscrizioneAdmin";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { console.error("[admin/iscrizioni/id]", err); return fallback; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const iscrizione = await safe(() => getIscrizioneByIdAdmin(id), null);
  if (!iscrizione) notFound();
  const titoli = await safe(() => getTitoliPagamento(id), []);
  return <DettaglioIscrizioneAdmin iscrizione={iscrizione} titoli={titoli} />;
}
