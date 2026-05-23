import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getIscrizioneById,
  getIscrizioneInBozzaPerGenitore,
  getTitoliPagamento,
  calcTariffa,
} from "@/lib/airtable-portale";
import { Button } from "@/components/ui/button";
import WizardNuovaIscrizione, {
  type TariffaInfo,
} from "@/components/portale/iscrizioni/WizardNuovaIscrizione";

interface PageProps {
  searchParams: Promise<{ bambino?: string; iscrizione?: string }>;
}

export default async function NuovaIscrizionePage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const sp = await searchParams;
  const bambini = await getBambiniByGenitore(genitore.id);
  const annoCorrente = new Date().getFullYear();

  if (bambini.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-ink mb-3">Aggiungi prima un figlio</h1>
        <p className="text-ink-muted mb-6">
          Per creare un&apos;iscrizione ti serve almeno un figlio registrato.
        </p>
        <Button asChild variant="primary" size="md">
          <Link href="/portale/figli/nuovo">Aggiungi figlio</Link>
        </Button>
      </div>
    );
  }

  // Resume esplicito: ?iscrizione=recXXX
  if (sp.iscrizione) {
    const iscrizione = await getIscrizioneById(sp.iscrizione);
    if (!iscrizione) notFound();
    if (!iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) notFound();
    // Se già COMPLETA, vai al dettaglio (nessun motivo di ri-fare il wizard)
    if (iscrizione.fields.STATO_ISCRIZIONE === "COMPLETA") {
      redirect(`/portale/iscrizioni/${iscrizione.id}`);
    }

    const resumeBambinoId = iscrizione.fields.TABELLA_BAMBINI?.[0];
    const [titoli, tariffaResult] = await Promise.all([
      getTitoliPagamento(iscrizione.id),
      calcTariffa(genitore.id, annoCorrente, undefined, resumeBambinoId),
    ]);
    const tariffaInfo = tariffaResult ? toTariffaInfo(tariffaResult) : null;

    return (
      <Layout>
        <WizardNuovaIscrizione
          bambini={bambini}
          anno={annoCorrente}
          initialIscrizione={iscrizione}
          initialTitoli={titoli}
          initialTariffa={tariffaInfo}
        />
      </Layout>
    );
  }

  // Resume implicito: bozza esistente
  const bozza = await getIscrizioneInBozzaPerGenitore(genitore.id, annoCorrente);
  if (bozza) {
    const nomeBambino = bozza.fields["NOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? "tuo figlio";
    return (
      <Layout>
        <div className="bg-sun-100 border border-sun-500/30 rounded-[var(--radius-xl)] p-5 flex items-start gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-ink shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">
              Hai un&apos;iscrizione in corso per {nomeBambino}.
            </p>
            <p className="text-sm text-ink-muted mt-0.5">
              Riprendi da dove avevi lasciato per completarla.
            </p>
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href={`/portale/iscrizioni/nuova?iscrizione=${bozza.id}`}>
              Riprendi
            </Link>
          </Button>
        </div>
        <WizardNuovaIscrizione
          bambini={bambini}
          bambinoIniziale={sp.bambino}
          anno={annoCorrente}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <WizardNuovaIscrizione
        bambini={bambini}
        bambinoIniziale={sp.bambino}
        anno={annoCorrente}
      />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-2xl font-bold text-ink mb-2 text-center">Nuova iscrizione</h1>
      <p className="text-ink-muted text-center mb-8">
        6 step per iscrivere tuo figlio alla scuola.
      </p>
      {children}
    </div>
  );
}

function toTariffaInfo(result: NonNullable<Awaited<ReturnType<typeof calcTariffa>>>): TariffaInfo {
  const t = result.tariffa.fields;
  return {
    tariffaId: result.tariffa.id,
    quarter: result.quarter,
    anno: result.anno,
    importoIscrizione: t.IMPORTO_ISCRIZIONE,
    importoRata: t.IMPORTO_RATA,
    importoKit: t.IMPORTO_KIT_SCUOLA,
    numeroRate: t.NUMERO_RATE,
    quotaTotaleAnno: t.QUOTA_TOTALE_ANNO,
    scontoFamiglia: result.scontoFamiglia,
    scontoImporto: result.scontoImporto,
    importoTotale: result.importoTotale,
    ordineIscrizioneGenitore: result.ordineIscrizioneGenitore,
    descrizione: t.DESCRIZIONE_TARIFFA,
    scadenzaRate: t.SCADENZA_RATE,
    regolamentoUrl: t.REGOLAMENTO?.[0]?.url ?? null,
    regolamentoFilename: t.REGOLAMENTO?.[0]?.filename ?? null,
  };
}

