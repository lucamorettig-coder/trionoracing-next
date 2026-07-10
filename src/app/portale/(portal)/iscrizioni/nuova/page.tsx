import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getIscrizioneById,
  getIscrizioneInBozzaPerGenitore,
  getIscrizioniByGenitore,
  getTitoliPagamento,
  getTariffeVigenti,
  getTariffaById,
  getCurrentQuarter,
  calcTariffa,
  type Tariffa,
  type TipoCorso,
} from "@/lib/airtable-portale";
import { getStatoIscrizioneAnnoCorrente, isProfiloGenitoreCompleto } from "@/lib/portale-utils";
import { Button } from "@/components/ui/button";
import WizardNuovaIscrizione, {
  type TariffaInfo,
  type CorsoOption,
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
  const annoCorrente = new Date().getFullYear();

  const [bambini, iscrizioni, tariffeVigenti] = await Promise.all([
    getBambiniByGenitore(genitore.id),
    getIscrizioniByGenitore(genitore.id),
    getTariffeVigenti(annoCorrente),
  ]);

  // Opzioni corso con quote del quarter corrente (calcolate server-side, no fetch client).
  const corsiOptions = buildCorsiOptions(tariffeVigenti, getCurrentQuarter());

  // Gate EVO-030: lo step "I tuoi dati" compare solo se il profilo è incompleto.
  const profiloCompleto = isProfiloGenitoreCompleto(genitore);

  // Mappa bambinoId → iscrizioneId per bambini già iscritti nell'anno corrente
  const bambiniIscrittiAnno = new Map<string, string>(
    bambini
      .map((b) => {
        const r = getStatoIscrizioneAnnoCorrente(b.id, iscrizioni);
        return r.stato === 'iscritto' && r.iscrizioneId ? [b.id, r.iscrizioneId] as [string, string] : null;
      })
      .filter((x): x is [string, string] => x !== null),
  );

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
    // Se già COMPLETA o SOSPESA (era già completa, sospesa per pagamento scaduto),
    // vai al dettaglio (nessun motivo di ri-fare il wizard)
    if (
      iscrizione.fields.STATO_ISCRIZIONE === "COMPLETA" ||
      iscrizione.fields.STATO_ISCRIZIONE === "SOSPESA"
    ) {
      redirect(`/portale/iscrizioni/${iscrizione.id}`);
    }

    const resumeBambinoId = iscrizione.fields.TABELLA_BAMBINI?.[0];
    const linkedTariffaId = iscrizione.fields.TABELLA_TARIFFE?.[0];
    // Il corso si DERIVA dalla tariffa collegata all'iscrizione, non si ricalcola
    // (default MTB-BDC). calcTariffa serve solo per lo sconto famiglia: gli passiamo
    // il corso derivato così la tariffa resta coerente con quella scelta (EVO-026).
    const [titoli, linkedTariffa] = await Promise.all([
      getTitoliPagamento(iscrizione.id),
      linkedTariffaId ? getTariffaById(linkedTariffaId) : Promise.resolve(null),
    ]);
    const corsoResume: TipoCorso = linkedTariffa?.fields.TIPO_CORSO ?? "MTB-BDC";
    const tariffaResult = await calcTariffa(
      genitore.id,
      annoCorrente,
      undefined,
      resumeBambinoId,
      corsoResume,
    );
    const tariffaInfo = tariffaResult ? toTariffaInfo(tariffaResult) : null;

    return (
      <Layout profiloCompleto={profiloCompleto}>
        <WizardNuovaIscrizione
          genitore={genitore}
          profiloCompleto={profiloCompleto}
          bambini={bambini}
          anno={annoCorrente}
          corsiOptions={corsiOptions}
          initialIscrizione={iscrizione}
          initialTitoli={titoli}
          initialTariffa={tariffaInfo}
          bambiniIscrittiAnno={bambiniIscrittiAnno}
        />
      </Layout>
    );
  }

  // Resume implicito: bozza esistente
  const bozza = await getIscrizioneInBozzaPerGenitore(genitore.id, annoCorrente);
  if (bozza) {
    const nomeBambino = bozza.fields["NOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? "tuo figlio";
    return (
      <Layout profiloCompleto={profiloCompleto}>
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
          genitore={genitore}
          profiloCompleto={profiloCompleto}
          bambini={bambini}
          bambinoIniziale={sp.bambino}
          anno={annoCorrente}
          corsiOptions={corsiOptions}
          bambiniIscrittiAnno={bambiniIscrittiAnno}
        />
      </Layout>
    );
  }

  return (
    <Layout profiloCompleto={profiloCompleto}>
      <WizardNuovaIscrizione
        genitore={genitore}
        profiloCompleto={profiloCompleto}
        bambini={bambini}
        bambinoIniziale={sp.bambino}
        anno={annoCorrente}
        corsiOptions={corsiOptions}
        bambiniIscrittiAnno={bambiniIscrittiAnno}
      />
    </Layout>
  );
}

function Layout({
  children,
  profiloCompleto,
}: {
  children: React.ReactNode;
  profiloCompleto: boolean;
}) {
  const totalSteps = profiloCompleto ? 7 : 8;
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-2xl font-bold text-ink mb-2 text-center">Nuova iscrizione</h1>
      <p className="text-ink-muted text-center mb-8">
        {totalSteps} step per iscrivere tuo figlio alla scuola.
      </p>
      {children}
    </div>
  );
}

/**
 * Costruisce le opzioni corso (con quota del quarter corrente + quota anno intero)
 * dalle tariffe vigenti dell'anno. I record senza TIPO_CORSO sono trattati come MTB-BDC.
 */
function buildCorsiOptions(
  tariffe: Tariffa[],
  quarterCorrente: "Q1" | "Q2" | "Q3",
): CorsoOption[] {
  const corsi: TipoCorso[] = ["MTB-BDC", "SOLO-MTB"];
  return corsi.map((corso) => {
    const forCorso = tariffe.filter((t) => (t.fields.TIPO_CORSO ?? "MTB-BDC") === corso);
    const corrente = forCorso.find((t) => t.fields.NOME_TARIFFA === quarterCorrente);
    const q1 = forCorso.find((t) => t.fields.NOME_TARIFFA === "Q1");
    return {
      corso,
      quarter: quarterCorrente,
      quotaQuarterCorrente: corrente?.fields.QUOTA_TOTALE_ANNO ?? null,
      quotaAnnoIntero: q1?.fields.QUOTA_TOTALE_ANNO ?? null,
      disponibile: !!corrente,
    };
  });
}

function toTariffaInfo(result: NonNullable<Awaited<ReturnType<typeof calcTariffa>>>): TariffaInfo {
  const t = result.tariffa.fields;
  return {
    tariffaId: result.tariffa.id,
    tipoCorso: t.TIPO_CORSO ?? "MTB-BDC",
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
    regolamentoUrl: t.REGOLAMENTO?.[0]?.url ?? null,
    regolamentoFilename: t.REGOLAMENTO?.[0]?.filename ?? null,
  };
}
