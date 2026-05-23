"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import StepHeader from "../StepHeader";

const PRIVACY_TEXT = `
Ai sensi del Regolamento UE 2016/679 (GDPR), il sottoscritto genitore esercente la responsabilità genitoriale autorizza il trattamento dei dati personali del minore per finalità connesse all'attività della scuola di ciclismo Triono Racing (gestione iscrizioni, tesseramento FCI, comunicazioni operative, foto/video delle attività). I dati sono conservati per la durata dell'iscrizione e per gli obblighi di legge. Titolare del trattamento: ASD Triono Racing.
`.trim();

interface Props {
  step: number;
  total: number;
  iscrizione: Iscrizione;
  onSigned: () => void;
}

export default function StepPrivacy({ step, total, iscrizione, onSigned }: Props) {
  const router = useRouter();
  const alreadySigned = !!iscrizione.fields.PRIVACY_MINORE;
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function firma() {
    if (!accepted || alreadySigned) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/portale/iscrizioni/${iscrizione.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: true }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Errore durante il salvataggio");
        return;
      }
      router.refresh();
      onSigned();
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="Privacy minore"
        description="Leggi l'informativa privacy e firma il consenso al trattamento dei dati personali del minore. La firma è digitale: ti basta accettare e cliccare Firma."
        accent="grass"
      />

      {alreadySigned && (
        <div className="mb-4 p-3 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
          <p className="text-sm text-grass-700 font-semibold">
            Già firmata
            {iscrizione.fields.DATA_FIRMA_PRIVACY ? ` il ${formatDateIT(iscrizione.fields.DATA_FIRMA_PRIVACY)}` : ""}
          </p>
        </div>
      )}

      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5">
        <div className="max-h-60 overflow-y-auto p-3 bg-bg-soft border border-line rounded-[var(--radius-md)] text-sm text-ink leading-relaxed whitespace-pre-line">
          {PRIVACY_TEXT}
        </div>

        {!alreadySigned && (
          <>
            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-line text-navy-700 focus:ring-navy-700/20 shrink-0"
              />
              <span className="text-sm text-ink">Ho letto e accetto l&apos;informativa privacy.</span>
            </label>

            <div className="mt-4 flex justify-end">
              <Button variant="primary" size="md" onClick={firma} disabled={!accepted || saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Firma…
                  </>
                ) : (
                  "Firma"
                )}
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-sm text-flag-700">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}
