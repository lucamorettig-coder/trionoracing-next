"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Bambino } from "@/lib/airtable-portale";
import StepperWizard from "./StepperWizard";
import StepScegliFiglio from "./steps/StepScegliFiglio";
import StepVerificaRequisiti from "./steps/StepVerificaRequisiti";
import StepRiepilogoTariffa from "./steps/StepRiepilogoTariffa";
import StepConferma from "./steps/StepConferma";

const STEPS = ["Scegli figlio", "Verifica requisiti", "Tariffa", "Conferma"];

interface Props {
  bambini: Bambino[];
  bambinoIniziale?: string;
  anno: number;
}

export interface TariffaInfo {
  tariffaId: string;
  quarter: "Q1" | "Q2" | "Q3";
  anno: number;
  importoIscrizione: number;
  importoRata: number;
  numeroRate: number;
  quotaTotaleAnno: number;
  scontoFamiglia: boolean;
  scontoImporto: number;
  importoTotale: number;
  ordineIscrizioneGenitore: number;
  descrizione?: string;
  scadenzaRate?: string;
}

export default function WizardNuovaIscrizione({ bambini, bambinoIniziale, anno }: Props) {
  // Se 1 figlio o param `bambino`, skip step 1
  const onlyOne = bambini.length === 1;
  const preselected = onlyOne
    ? bambini[0].id
    : bambinoIniziale && bambini.find((b) => b.id === bambinoIniziale)
      ? bambinoIniziale
      : null;

  const [step, setStep] = useState<number>(preselected ? 2 : 1);
  const [bambinoId, setBambinoId] = useState<string | null>(preselected);
  const [tariffa, setTariffa] = useState<TariffaInfo | null>(null);
  const [accettato, setAccettato] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const bambino = bambini.find((b) => b.id === bambinoId) ?? null;

  function back() {
    setError(null);
    if (step === 2 && preselected) return; // niente back se è skipped
    setStep((s) => Math.max(1, s - 1));
  }
  function next() {
    setError(null);
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  async function handleSubmit() {
    if (!bambinoId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portale/iscrizioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bambinoId, anno }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante la creazione.");
        setSubmitting(false);
        return;
      }
      router.push(`/portale/iscrizioni/${data.id}?just-created=true`);
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <StepperWizard steps={STEPS} currentStep={step} />

      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 lg:p-8">
        {step === 1 && (
          <StepScegliFiglio
            bambini={bambini}
            selectedId={bambinoId}
            onSelect={(id) => setBambinoId(id)}
          />
        )}
        {step === 2 && bambino && <StepVerificaRequisiti bambino={bambino} />}
        {step === 3 && bambino && (
          <StepRiepilogoTariffa
            bambino={bambino}
            anno={anno}
            tariffa={tariffa}
            onTariffaLoaded={setTariffa}
          />
        )}
        {step === 4 && bambino && tariffa && (
          <StepConferma
            bambino={bambino}
            tariffa={tariffa}
            accettato={accettato}
            onAccettatoChange={setAccettato}
            error={error}
            submitting={submitting}
          />
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-3">
        {step > 1 && !(step === 2 && preselected) ? (
          <Button variant="ghost" size="md" onClick={back} disabled={submitting}>
            ← Indietro
          </Button>
        ) : (
          <Link
            href="/portale/iscrizioni"
            className="text-sm text-ink-muted hover:text-ink underline"
          >
            Annulla
          </Link>
        )}

        {step < STEPS.length ? (
          <Button
            variant="primary"
            size="md"
            onClick={next}
            disabled={
              (step === 1 && !bambinoId) ||
              (step === 2 && !canProceedRequisiti(bambino)) ||
              (step === 3 && !tariffa)
            }
          >
            Continua
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!accettato || submitting}
          >
            {submitting ? "Creazione in corso…" : "Crea iscrizione"}
          </Button>
        )}
      </div>
    </div>
  );
}

function canProceedRequisiti(bambino: Bambino | null): boolean {
  if (!bambino) return false;
  const hasCert =
    !!bambino.fields.CERTIFICATO_MEDICO_FILE?.length &&
    bambino.fields.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!bambino.fields.FOTO_BAMBINO?.length;
  return hasCert && hasFoto;
}
