"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";

interface Props {
  iscrizione: Iscrizione;
}

const PRIVACY_TEXT = `
Ai sensi del Regolamento UE 2016/679 (GDPR), il sottoscritto genitore esercente la responsabilità genitoriale autorizza il trattamento dei dati personali del minore per finalità connesse all'attività della scuola di ciclismo Triono Racing (gestione iscrizioni, tesseramento FCI, comunicazioni operative, foto/video delle attività). I dati sono conservati per la durata dell'iscrizione e per gli obblighi di legge. Titolare del trattamento: ASD Triono Racing.
`.trim();

const REGOLAMENTO_TEXT = `
Iscrivendo il minore alla scuola di ciclismo Triono Racing, il genitore:
1. Accetta integralmente il regolamento della scuola.
2. Dichiara che il minore è in buone condizioni di salute (certificato medico in regola).
3. Si impegna al pagamento delle quote secondo il piano rate scelto.
4. Autorizza il trasporto del minore nei luoghi delle attività.
5. Solleva la scuola da responsabilità per danni causati dal minore.
Scarica il PDF del regolamento, firmalo e ricaricalo qui sotto.
`.trim();

export default function TabModulistica({ iscrizione }: Props) {
  const router = useRouter();
  const f = iscrizione.fields;
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [regoAccepted, setRegoAccepted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const privacyDone = !!f.PRIVACY_MINORE;
  const regolamentoFirmatoCaricato = !!f.REGOLAMENTO_FIRMATO?.length;
  const regolamentoDone = !!f.FLAG_REGOLAMENTO && regolamentoFirmatoCaricato;

  async function firmaPrivacy() {
    if (!privacyAccepted) return;
    setError(null);
    setPrivacySaving(true);
    try {
      const res = await fetch(`/api/portale/iscrizioni/${iscrizione.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: true }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Errore durante il salvataggio");
      } else {
        router.refresh();
      }
    } catch {
      setError("Errore di rete");
    } finally {
      setPrivacySaving(false);
    }
  }

  async function uploadRegolamento(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/portale/iscrizioni/${iscrizione.id}/regolamento`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Errore durante l'upload");
      } else {
        router.refresh();
      }
    } catch {
      setError("Errore di rete");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-sm text-flag-700">
          {error}
        </div>
      )}

      {/* Privacy */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-ink">Privacy minore</h3>
          {privacyDone && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-grass-700">
              <CheckCircle2 className="w-4 h-4" />
              Firmata{f.DATA_FIRMA_PRIVACY ? ` il ${formatDateIT(f.DATA_FIRMA_PRIVACY)}` : ""}
            </span>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto p-3 bg-bg-soft border border-line rounded-[var(--radius-md)] text-sm text-ink leading-relaxed whitespace-pre-line">
          {PRIVACY_TEXT}
        </div>
        {!privacyDone && (
          <>
            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-line text-navy-700 focus:ring-navy-700/20 shrink-0"
              />
              <span className="text-sm text-ink">Ho letto e accetto l&apos;informativa privacy.</span>
            </label>
            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={firmaPrivacy}
                disabled={!privacyAccepted || privacySaving}
              >
                {privacySaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Firma…</> : "Firma"}
              </Button>
            </div>
          </>
        )}
      </section>

      {/* Regolamento */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-ink">Regolamento</h3>
          {regolamentoDone && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-grass-700">
              <CheckCircle2 className="w-4 h-4" />
              Caricato{f.DATA_FIRMA_REGOLAMENTO ? ` il ${formatDateIT(f.DATA_FIRMA_REGOLAMENTO)}` : ""}
            </span>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto p-3 bg-bg-soft border border-line rounded-[var(--radius-md)] text-sm text-ink leading-relaxed whitespace-pre-line">
          {REGOLAMENTO_TEXT}
        </div>
        <label className="flex items-start gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={regoAccepted || regolamentoDone}
            disabled={regolamentoDone}
            onChange={(e) => setRegoAccepted(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-line text-navy-700 focus:ring-navy-700/20 shrink-0"
          />
          <span className="text-sm text-ink">Ho letto e accetto il regolamento.</span>
        </label>

        {regolamentoFirmatoCaricato && f.REGOLAMENTO_FIRMATO?.[0]?.url ? (
          <div className="mt-4 flex items-center gap-2 p-3 bg-grass-50 border border-grass-200 rounded-[var(--radius-lg)]">
            <FileText className="w-5 h-5 text-grass-700 shrink-0" />
            <p className="flex-1 text-sm text-ink truncate">
              {f.REGOLAMENTO_FIRMATO[0].filename ?? "Regolamento firmato"}
            </p>
            <Button asChild variant="ghost" size="sm">
              <a href={f.REGOLAMENTO_FIRMATO[0].url} target="_blank" rel="noopener noreferrer">
                Apri
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled>
              <Download className="w-4 h-4" />
              Scarica PDF (da firmare)
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadRegolamento(f);
              }}
            />
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => fileInput.current?.click()}
              disabled={!regoAccepted || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Caricamento…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Carica regolamento firmato
                </>
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
