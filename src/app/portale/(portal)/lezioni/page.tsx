import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getLezioniByMaestro,
  getAllMaestriAttivi,
  type Maestro,
} from "@/lib/airtable-portale";
import { groupLezioniByMese, meseChiaveLabel } from "@/lib/portale-utils";
import CardLezione from "@/components/portale/lezioni/CardLezione";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";

export const metadata = {
  title: "Le mie lezioni · Portale Triono Racing",
};

interface SearchParams {
  searchParams: Promise<{ anno?: string; mese?: string; success?: string }>;
}

export default async function LezioniPage({ searchParams }: SearchParams) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <SezioneMaestroNonCollegato />
      </div>
    );
  }

  const sp = await searchParams;
  const now = new Date();
  const anno = sp.anno ? parseInt(sp.anno, 10) : now.getFullYear();
  const mese = sp.mese ? parseInt(sp.mese, 10) : undefined;
  const success = sp.success;

  // Lezioni anno corrente (raggruppate poi per mese). Se filtro mese, lo
  // applichiamo nella query stessa.
  const [lezioni, maestri] = await Promise.all([
    getLezioniByMaestro(maestro.id, anno, mese),
    getAllMaestriAttivi(),
  ]);
  const maestriById: Record<string, Maestro> = Object.fromEntries(
    maestri.map((m) => [m.id, m]),
  );

  const grouped = groupLezioniByMese(lezioni);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
            Area maestro
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1">
            Le mie lezioni
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {lezioni.length} {lezioni.length === 1 ? "lezione" : "lezioni"} registrate{" "}
            {mese ? `(filtro: ${meseChiaveLabel(`${anno}-${String(mese).padStart(2, "0")}`)})` : `nel ${anno}`}.
          </p>
        </div>
        <Button asChild variant="primary" size="md">
          <Link href="/portale/lezioni/nuova">
            <Plus className="w-4 h-4" />
            Carica presenza
          </Link>
        </Button>
      </header>

      {success && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-grass-100 bg-grass-50 text-grass-700 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Presenza salvata con successo.</p>
        </div>
      )}

      {grouped.size === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border-2 border-dashed border-line rounded-[var(--radius-xl)]">
          <BookOpen className="w-10 h-10 text-ink-muted" aria-hidden />
          <p className="text-base font-semibold text-ink">Nessuna lezione registrata</p>
          <p className="text-sm text-ink-muted max-w-md">
            Inizia registrando la tua prima lezione: data, bambini presenti e
            argomento.
          </p>
          <Button asChild variant="primary" size="md" className="mt-2">
            <Link href="/portale/lezioni/nuova">
              <Plus className="w-4 h-4" />
              Carica presenza
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([chiave, lezioniMese]) => (
            <section key={chiave}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted font-mono mb-3">
                {meseChiaveLabel(chiave)} · {lezioniMese.length}{" "}
                {lezioniMese.length === 1 ? "lezione" : "lezioni"}
              </h2>
              <div className="space-y-3">
                {lezioniMese.map((l) => (
                  <CardLezione key={l.id} lezione={l} maestriById={maestriById} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
