"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Bambino,
  Iscrizione,
  TipoCorso,
  TitoloPagamento,
} from "@/lib/airtable-portale";
import StepperWizard from "./StepperWizard";
import StepScegliFiglio from "./steps/StepScegliFiglio";
import StepVerificaRequisiti from "./steps/StepVerificaRequisiti";
import StepScegliCorso from "./steps/StepScegliCorso";
import StepRiepilogoTariffa from "./steps/StepRiepilogoTariffa";
import StepPrivacy from "./steps/StepPrivacy";
import StepRegolamento from "./steps/StepRegolamento";
import StepSommario from "./steps/StepSommario";

const STEPS = [
  "Figlio",
  "Requisiti",
  "Corso",
  "Tariffa",
  "Privacy",
  "Regolamento",
  "Sommario",
] as const;

export interface TariffaInfo {
  tariffaId: string;
  tipoCorso: TipoCorso;
  quarter: "Q1" | "Q2" | "Q3";
  anno: number;
  importoIscrizione: number;
  importoRata: number;
  importoKit?: number;
  numeroRate: number;
  quotaTotaleAnno: number;
  scontoFamiglia: boolean;
  scontoImporto: number;
  importoTotale: number;
  ordineIscrizioneGenitore: number;
  descrizione?: string;
  regolamentoUrl?: string | null;
  regolamentoFilename?: string | null;
}

/** Opzione corso per lo step "Scegli il corso" (quote calcolate server-side da getTariffeVigenti). */
export interface CorsoOption {
  corso: TipoCorso;
  /** Quarter corrente (per la nota "quota per iscrizioni {periodo}"). */
  quarter: "Q1" | "Q2" | "Q3";
  /** Quota del quarter corrente = ciò che il genitore paga iscrivendosi ora (null se nessuna tariffa attiva). */
  quotaQuarterCorrente: number | null;
  /** Quota anno intero (tariffa Q1) per la riga secondaria. */
  quotaAnnoIntero: number | null;
  /** Falso se non c'è una tariffa attiva per (corso, quarter corrente). */
  disponibile: boolean;
}

interface Props {
  bambini: Bambino[];
  bambinoIniziale?: string;
  anno: number;
  /** Opzioni corso con quote del quarter corrente (calcolate server-side). */
  corsiOptions: CorsoOption[];
  /** Iscrizione esistente in bozza da riprendere (resume mode). */
  initialIscrizione?: Iscrizione | null;
  /** Titoli pagamento pre-caricati (solo in resume mode al landing sommario). */
  initialTitoli?: TitoloPagamento[];
  /** Tariffa pre-caricata (solo in resume mode, evita fetch ridondante). */
  initialTariffa?: TariffaInfo | null;
  /** Mappa bambinoId → iscrizioneId per bambini già iscritti nell'anno corrente. */
  bambiniIscrittiAnno?: Map<string, string>;
}

function computeResumeStep(iscrizione: Iscrizione): number {
  if (!iscrizione.fields.PRIVACY_MINORE) return 5;
  if (
    !iscrizione.fields.FLAG_REGOLAMENTO ||
    !iscrizione.fields.REGOLAMENTO_FIRMATO?.length
  )
    return 6;
  return 7;
}

export default function WizardNuovaIscrizione({
  bambini,
  bambinoIniziale,
  anno,
  corsiOptions,
  initialIscrizione = null,
  initialTitoli = [],
  initialTariffa = null,
  bambiniIscrittiAnno,
}: Props) {
  const router = useRouter();

  // Bambini selezionabili (non già iscritti per l'anno corrente)
  const bambiniSelezionabili = bambiniIscrittiAnno
    ? bambini.filter((b) => !bambiniIscrittiAnno.has(b.id))
    : bambini;
  const onlyOne = bambiniSelezionabili.length === 1;

  // Resume mode: iscrizione già creata, vai allo step corretto + bambino pre-derivato
  const resumeBambinoId = initialIscrizione?.fields.TABELLA_BAMBINI?.[0] ?? null;
  const preselected = resumeBambinoId
    ?? (onlyOne
      ? bambiniSelezionabili[0].id
      : bambinoIniziale && bambini.find((b) => b.id === bambinoIniziale) && !bambiniIscrittiAnno?.has(bambinoIniziale)
        ? bambinoIniziale
        : null);

  const [step, setStep] = useState<number>(
    initialIscrizione ? computeResumeStep(initialIscrizione) : preselected ? 2 : 1,
  );
  const [bambinoId, setBambinoId] = useState<string | null>(preselected);
  // In resume mode il corso è derivato dalla tariffa collegata (initialTariffa.tipoCorso).
  const [corso, setCorso] = useState<TipoCorso | null>(initialTariffa?.tipoCorso ?? null);
  const [tariffa, setTariffa] = useState<TariffaInfo | null>(initialTariffa);
  const [iscrizione, setIscrizione] = useState<Iscrizione | null>(initialIscrizione);
  const [titoli] = useState<TitoloPagamento[]>(initialTitoli);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bambino = bambini.find((b) => b.id === bambinoId) ?? null;

  // Cambio corso (solo nel flusso di creazione): invalida la tariffa per forzarne il ricalcolo.
  function selectCorso(c: TipoCorso) {
    if (c !== corso) setTariffa(null);
    setCorso(c);
  }

  // Fetch titoli quando entro nello step sommario e non li ho ancora
  const loadTitoli = useCallback(async () => {
    if (!iscrizione) return;
    if (titoli.length > 0) return;
    try {
      // I titoli arrivano da Airtable via server: router.refresh ri-fa SSR di nuova/page.tsx
      // con i titoli aggiornati e remonta il wizard con initialTitoli popolato.
      router.refresh();
    } catch {
      /* noop */
    }
  }, [iscrizione, titoli.length, router]);

  useEffect(() => {
    if (step === 7 && iscrizione && titoli.length === 0) {
      loadTitoli();
    }
  }, [step, iscrizione, titoli.length, loadTitoli]);

  function back() {
    setError(null);
    // Una volta creata l'iscrizione (step >= 5), non si può tornare prima del 5
    // (corso e tariffa sono ormai bloccati sull'iscrizione creata).
    if (iscrizione && step <= 5) return;
    setStep((s) => Math.max(1, s - 1));
  }

  async function goNext() {
    setError(null);

    // Step 1: blocca se il bambino selezionato è già iscritto per l'anno corrente
    if (step === 1 && bambinoId && bambiniIscrittiAnno?.has(bambinoId)) {
      setError("Questo figlio è già iscritto per l'anno corrente.");
      return;
    }

    // Step 4 (Tariffa) → 5 = CREATE iscrizione
    if (step === 4 && !iscrizione) {
      if (!bambinoId || !corso) return;
      setCreating(true);
      try {
        const res = await fetch("/api/portale/iscrizioni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bambinoId, anno, corso }),
        });
        const data = await res.json();
        if (!res.ok) {
          // 409: già esiste un'iscrizione → riprendila (full reload per stato pulito)
          if (res.status === 409 && data.iscrizioneId) {
            window.location.href = `/portale/iscrizioni/nuova?iscrizione=${data.iscrizioneId}`;
            return;
          }
          setError(data.error ?? "Errore durante la creazione.");
          setCreating(false);
          return;
        }
        // Full reload: la nuova iscrizione + titoli vanno caricati via SSR e il
        // wizard deve remountare con initialIscrizione popolato.
        window.location.href = `/portale/iscrizioni/nuova?iscrizione=${data.id}`;
        return;
      } catch {
        setError("Errore di rete. Riprova.");
        setCreating(false);
        return;
      }
    }

    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  const showBack = step > 1 && !(iscrizione && step <= 5);
  const showSaveExit = !!iscrizione && step < STEPS.length;

  return (
    <div className="space-y-8">
      <StepperWizard steps={[...STEPS]} currentStep={step} />

      <div className="rounded-[var(--radius-xl)] p-0 sm:bg-white sm:border sm:border-line sm:shadow-[var(--shadow-sm)] sm:p-6 lg:p-8">
        {step === 1 && (
          <StepScegliFiglio
            step={1}
            total={STEPS.length}
            bambini={bambini}
            selectedId={bambinoId}
            onSelect={setBambinoId}
            bambiniIscrittiAnno={bambiniIscrittiAnno}
          />
        )}
        {step === 2 && bambino && (
          <StepVerificaRequisiti step={2} total={STEPS.length} bambino={bambino} />
        )}
        {step === 3 && (
          <StepScegliCorso
            step={3}
            total={STEPS.length}
            anno={anno}
            options={corsiOptions}
            selected={corso}
            onSelect={selectCorso}
          />
        )}
        {step === 4 && bambino && corso && (
          <StepRiepilogoTariffa
            step={4}
            total={STEPS.length}
            bambino={bambino}
            anno={anno}
            corso={corso}
            tariffa={tariffa}
            onTariffaLoaded={setTariffa}
          />
        )}
        {step === 5 && iscrizione && (
          <StepPrivacy
            step={5}
            total={STEPS.length}
            iscrizione={iscrizione}
            onSigned={() => {
              setIscrizione({
                ...iscrizione,
                fields: {
                  ...iscrizione.fields,
                  PRIVACY_MINORE: true,
                  DATA_FIRMA_PRIVACY: new Date().toISOString().slice(0, 10),
                },
              });
            }}
          />
        )}
        {step === 6 && iscrizione && (
          <StepRegolamento
            step={6}
            total={STEPS.length}
            iscrizione={iscrizione}
            regolamentoUrl={tariffa?.regolamentoUrl ?? null}
            regolamentoFilename={tariffa?.regolamentoFilename ?? null}
            onUploaded={({ url, filename }) => {
              setIscrizione({
                ...iscrizione,
                fields: {
                  ...iscrizione.fields,
                  FLAG_REGOLAMENTO: true,
                  REGOLAMENTO_FIRMATO: [
                    { id: "", url, filename, size: 0, type: "" },
                  ],
                  DATA_FIRMA_REGOLAMENTO: new Date().toISOString().slice(0, 10),
                },
              });
            }}
          />
        )}
        {step === 7 && iscrizione && bambino && tariffa && (
          <StepSommario
            step={7}
            total={STEPS.length}
            bambino={bambino}
            iscrizione={iscrizione}
            tariffa={tariffa}
            titoli={titoli}
          />
        )}

        {error && (
          <div className="mt-4 p-3 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-sm text-flag-700">
            {error}
          </div>
        )}
      </div>

      {/* Barra azioni */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button variant="ghost" size="md" onClick={back} disabled={creating}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Indietro
            </Button>
          ) : (
            <Link
              href="/portale/iscrizioni"
              className="text-sm text-ink-muted hover:text-ink underline"
            >
              Annulla
            </Link>
          )}
          {showSaveExit && (
            <Link
              href="/portale/iscrizioni"
              className="text-sm text-ink-muted hover:text-ink underline"
            >
              Salva ed esci
            </Link>
          )}
        </div>

        {step < STEPS.length ? (
          <Button
            variant="primary"
            size="md"
            onClick={goNext}
            disabled={isNextDisabled({ step, bambinoId, bambino, corso, tariffa, iscrizione, creating, bambiniIscrittiAnno })}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creazione…
              </>
            ) : step === 4 && !iscrizione ? (
              <>
                Crea iscrizione e continua
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Continua
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function isNextDisabled(args: {
  step: number;
  bambinoId: string | null;
  bambino: Bambino | null;
  corso: TipoCorso | null;
  tariffa: TariffaInfo | null;
  iscrizione: Iscrizione | null;
  creating: boolean;
  bambiniIscrittiAnno?: Map<string, string>;
}): boolean {
  const { step, bambinoId, bambino, corso, tariffa, iscrizione, creating, bambiniIscrittiAnno } = args;
  if (creating) return true;
  if (step === 1) return !bambinoId || !!(bambinoId && bambiniIscrittiAnno?.has(bambinoId));
  if (step === 2) return !canProceedRequisiti(bambino);
  if (step === 3) return !corso;
  if (step === 4) return !tariffa;
  if (step === 5) return !iscrizione?.fields.PRIVACY_MINORE;
  if (step === 6) {
    return (
      !iscrizione?.fields.FLAG_REGOLAMENTO ||
      !iscrizione?.fields.REGOLAMENTO_FIRMATO?.length
    );
  }
  return false;
}

function canProceedRequisiti(bambino: Bambino | null): boolean {
  if (!bambino) return false;
  const hasCert =
    !!bambino.fields.CERTIFICATO_MEDICO_FILE?.length &&
    bambino.fields.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!bambino.fields.FOTO_BAMBINO?.length;
  return hasCert && hasFoto;
}
