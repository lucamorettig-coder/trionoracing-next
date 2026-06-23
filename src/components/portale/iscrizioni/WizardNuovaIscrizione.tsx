"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Bambino,
  Genitore,
  Iscrizione,
  TipoCorso,
  TitoloPagamento,
} from "@/lib/airtable-portale";
import StepperWizard from "./StepperWizard";
import StepDatiGenitore from "./steps/StepDatiGenitore";
import StepScegliFiglio from "./steps/StepScegliFiglio";
import StepVerificaRequisiti from "./steps/StepVerificaRequisiti";
import StepScegliCorso from "./steps/StepScegliCorso";
import StepRiepilogoTariffa from "./steps/StepRiepilogoTariffa";
import StepPrivacy from "./steps/StepPrivacy";
import StepRegolamento from "./steps/StepRegolamento";
import StepSommario from "./steps/StepSommario";
import {
  datiAnagraficiFromGenitore,
  validateDatiAnagrafici,
  isDatiAnagraficiValido,
  type DatiAnagraficiValues,
  type DatiAnagraficiErrors,
} from "@/components/portale/DatiAnagraficiGenitoreFields";

/**
 * Chiavi step del wizard. La sequenza è dinamica: lo step "datiGenitore" è
 * presente solo quando il profilo del genitore è incompleto (EVO-029).
 * Tutta la logica confronta le CHIAVI, non gli indici, così inserire uno step
 * in testa non rompe gli offset.
 */
type StepKey =
  | "datiGenitore"
  | "figlio"
  | "requisiti"
  | "corso"
  | "tariffa"
  | "privacy"
  | "regolamento"
  | "sommario";

const STEP_LABELS: Record<StepKey, string> = {
  datiGenitore: "I tuoi dati",
  figlio: "Figlio",
  requisiti: "Requisiti",
  corso: "Corso",
  tariffa: "Tariffa",
  privacy: "Privacy",
  regolamento: "Regolamento",
  sommario: "Sommario",
};

const CORE_KEYS: StepKey[] = [
  "figlio",
  "requisiti",
  "corso",
  "tariffa",
  "privacy",
  "regolamento",
  "sommario",
];

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
  genitore: Genitore;
  /** True se il profilo anagrafico del genitore è completo: salta lo step "I tuoi dati". */
  profiloCompleto: boolean;
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

function computeResumeKey(iscrizione: Iscrizione): StepKey {
  if (!iscrizione.fields.PRIVACY_MINORE) return "privacy";
  if (
    !iscrizione.fields.FLAG_REGOLAMENTO ||
    !iscrizione.fields.REGOLAMENTO_FIRMATO?.length
  )
    return "regolamento";
  return "sommario";
}

export default function WizardNuovaIscrizione({
  genitore,
  profiloCompleto,
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

  // Sequenza step: "datiGenitore" in testa solo se il profilo è incompleto.
  const stepKeys: StepKey[] = profiloCompleto
    ? CORE_KEYS
    : ["datiGenitore", ...CORE_KEYS];
  const total = stepKeys.length;
  const idxOf = (k: StepKey) => stepKeys.indexOf(k) + 1; // 1-based

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

  const [step, setStep] = useState<number>(() => {
    if (initialIscrizione) return idxOf(computeResumeKey(initialIscrizione));
    if (!profiloCompleto) return idxOf("datiGenitore");
    return preselected ? idxOf("requisiti") : idxOf("figlio");
  });
  const currentKey = stepKeys[step - 1];

  const [bambinoId, setBambinoId] = useState<string | null>(preselected);
  // In resume mode il corso è derivato dalla tariffa collegata (initialTariffa.tipoCorso).
  const [corso, setCorso] = useState<TipoCorso | null>(initialTariffa?.tipoCorso ?? null);
  const [tariffa, setTariffa] = useState<TariffaInfo | null>(initialTariffa);
  const [iscrizione, setIscrizione] = useState<Iscrizione | null>(initialIscrizione);
  const [titoli] = useState<TitoloPagamento[]>(initialTitoli);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step "I tuoi dati" (EVO-029): stato dei campi anagrafici + errori inline.
  const [dati, setDati] = useState<DatiAnagraficiValues>(() =>
    datiAnagraficiFromGenitore(genitore.fields),
  );
  const [datiErrors, setDatiErrors] = useState<DatiAnagraficiErrors>({});
  const [savingDati, setSavingDati] = useState(false);

  const bambino = bambini.find((b) => b.id === bambinoId) ?? null;
  const busy = creating || savingDati;

  function setDatiField(field: keyof DatiAnagraficiValues, value: string) {
    setDati((d) => ({ ...d, [field]: value }));
    setDatiErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

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
    if (currentKey === "sommario" && iscrizione && titoli.length === 0) {
      loadTitoli();
    }
  }, [currentKey, iscrizione, titoli.length, loadTitoli]);

  function back() {
    setError(null);
    // Una volta creata l'iscrizione, non si può tornare prima di "privacy"
    // (corso e tariffa sono ormai bloccati sull'iscrizione creata).
    if (iscrizione && step <= idxOf("privacy")) return;
    setStep((s) => Math.max(1, s - 1));
  }

  /** Salva i dati anagrafici del genitore (PATCH profilo). Ritorna true se ok. */
  async function saveDatiGenitore(): Promise<boolean> {
    const errs = validateDatiAnagrafici(dati);
    if (Object.keys(errs).length > 0) {
      setDatiErrors(errs);
      return false;
    }
    setSavingDati(true);
    try {
      const res = await fetch("/api/portale/profilo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dati),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Errore durante il salvataggio dei dati.");
        setSavingDati(false);
        return false;
      }
      setSavingDati(false);
      return true;
    } catch {
      setError("Errore di rete. Riprova.");
      setSavingDati(false);
      return false;
    }
  }

  async function goNext() {
    setError(null);

    // Step "I tuoi dati": valida + salva il profilo, poi avanza.
    if (currentKey === "datiGenitore") {
      const ok = await saveDatiGenitore();
      if (!ok) return;
      setStep((s) => Math.min(total, s + 1));
      return;
    }

    // Step "Figlio": blocca se il bambino selezionato è già iscritto per l'anno corrente
    if (currentKey === "figlio" && bambinoId && bambiniIscrittiAnno?.has(bambinoId)) {
      setError("Questo figlio è già iscritto per l'anno corrente.");
      return;
    }

    // Step "Tariffa" → CREATE iscrizione
    if (currentKey === "tariffa" && !iscrizione) {
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

    setStep((s) => Math.min(total, s + 1));
  }

  const showBack = step > 1 && !(iscrizione && step <= idxOf("privacy"));
  const showSaveExit = !!iscrizione && step < total;

  return (
    <div className="space-y-8">
      <StepperWizard steps={stepKeys.map((k) => STEP_LABELS[k])} currentStep={step} />

      <div className="rounded-[var(--radius-xl)] p-0 sm:bg-white sm:border sm:border-line sm:shadow-[var(--shadow-sm)] sm:p-6 lg:p-8">
        {currentKey === "datiGenitore" && (
          <StepDatiGenitore
            step={step}
            total={total}
            values={dati}
            errors={datiErrors}
            onChange={setDatiField}
            saving={savingDati}
          />
        )}
        {currentKey === "figlio" && (
          <StepScegliFiglio
            step={step}
            total={total}
            bambini={bambini}
            selectedId={bambinoId}
            onSelect={setBambinoId}
            bambiniIscrittiAnno={bambiniIscrittiAnno}
          />
        )}
        {currentKey === "requisiti" && bambino && (
          <StepVerificaRequisiti step={step} total={total} bambino={bambino} />
        )}
        {currentKey === "corso" && (
          <StepScegliCorso
            step={step}
            total={total}
            anno={anno}
            options={corsiOptions}
            selected={corso}
            onSelect={selectCorso}
          />
        )}
        {currentKey === "tariffa" && bambino && corso && (
          <StepRiepilogoTariffa
            step={step}
            total={total}
            bambino={bambino}
            anno={anno}
            corso={corso}
            tariffa={tariffa}
            onTariffaLoaded={setTariffa}
          />
        )}
        {currentKey === "privacy" && iscrizione && (
          <StepPrivacy
            step={step}
            total={total}
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
        {currentKey === "regolamento" && iscrizione && (
          <StepRegolamento
            step={step}
            total={total}
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
        {currentKey === "sommario" && iscrizione && bambino && tariffa && (
          <StepSommario
            step={step}
            total={total}
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
            <Button variant="ghost" size="md" onClick={back} disabled={busy}>
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

        {step < total ? (
          <Button
            variant="primary"
            size="md"
            onClick={goNext}
            disabled={busy || isNextDisabled({ currentKey, bambinoId, bambino, corso, tariffa, iscrizione, dati, bambiniIscrittiAnno })}
          >
            {savingDati ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvataggio…
              </>
            ) : creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creazione…
              </>
            ) : currentKey === "tariffa" && !iscrizione ? (
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
  currentKey: StepKey;
  bambinoId: string | null;
  bambino: Bambino | null;
  corso: TipoCorso | null;
  tariffa: TariffaInfo | null;
  iscrizione: Iscrizione | null;
  dati: DatiAnagraficiValues;
  bambiniIscrittiAnno?: Map<string, string>;
}): boolean {
  const { currentKey, bambinoId, bambino, corso, tariffa, iscrizione, dati, bambiniIscrittiAnno } = args;
  switch (currentKey) {
    case "datiGenitore":
      return !isDatiAnagraficiValido(dati);
    case "figlio":
      return !bambinoId || !!(bambinoId && bambiniIscrittiAnno?.has(bambinoId));
    case "requisiti":
      return !canProceedRequisiti(bambino);
    case "corso":
      return !corso;
    case "tariffa":
      return !tariffa;
    case "privacy":
      return !iscrizione?.fields.PRIVACY_MINORE;
    case "regolamento":
      return (
        !iscrizione?.fields.FLAG_REGOLAMENTO ||
        !iscrizione?.fields.REGOLAMENTO_FIRMATO?.length
      );
    default:
      return false;
  }
}

function canProceedRequisiti(bambino: Bambino | null): boolean {
  if (!bambino) return false;
  const hasCert =
    !!bambino.fields.CERTIFICATO_MEDICO_FILE?.length &&
    bambino.fields.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!bambino.fields.FOTO_BAMBINO?.length;
  return hasCert && hasFoto;
}
