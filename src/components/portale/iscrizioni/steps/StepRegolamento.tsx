"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import StepHeader from "../StepHeader";

interface Props {
  step: number;
  total: number;
  iscrizione: Iscrizione;
  regolamentoUrl: string | null;
  regolamentoFilename: string | null;
  onUploaded: () => void;
}

export default function StepRegolamento({
  step,
  total,
  iscrizione,
  regolamentoUrl,
  regolamentoFilename,
  onUploaded,
}: Props) {
  const router = useRouter();
  const f = iscrizione.fields;
  const alreadyUploaded = !!f.REGOLAMENTO_FIRMATO?.length && !!f.FLAG_REGOLAMENTO;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
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
        const raw = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          msg = JSON.parse(raw).error ?? msg;
        } catch {
          if (raw) msg = raw.slice(0, 200);
        }
        setError(msg);
        return;
      }
      router.refresh();
      onUploaded();
    } catch {
      setError("Errore di rete");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="Regolamento della scuola"
        description="Scarica il regolamento qui sotto, firmalo (a penna o digitalmente) e ricaricalo come PDF o foto. Puoi salvare e completare in un secondo momento se ti serve tempo."
      />

      {alreadyUploaded && (
        <div className="mb-4 p-3 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
          <p className="text-sm text-grass-700 font-semibold">
            Regolamento firmato caricato
            {f.DATA_FIRMA_REGOLAMENTO ? ` il ${formatDateIT(f.DATA_FIRMA_REGOLAMENTO)}` : ""}
          </p>
        </div>
      )}

      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 space-y-5">
        {/* Download */}
        <div>
          <p className="text-sm font-semibold text-ink mb-2">1. Scarica il regolamento</p>
          {regolamentoUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={regolamentoUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-4 h-4" />
                {regolamentoFilename ?? "Scarica regolamento (PDF)"}
              </a>
            </Button>
          ) : (
            <p className="text-sm text-ink-muted italic">
              Regolamento non ancora disponibile per questa tariffa. Contatta la segreteria.
            </p>
          )}
        </div>

        {/* Upload */}
        <div>
          <p className="text-sm font-semibold text-ink mb-2">
            2. Ricarica il regolamento firmato
          </p>

          {alreadyUploaded && f.REGOLAMENTO_FIRMATO?.[0]?.url ? (
            <div className="flex items-center gap-2 p-3 bg-grass-50 border border-grass-200 rounded-[var(--radius-lg)]">
              <FileText className="w-5 h-5 text-grass-700 shrink-0" />
              <p className="flex-1 text-sm text-ink truncate">
                {f.REGOLAMENTO_FIRMATO[0].filename ?? "Regolamento firmato"}
              </p>
              <Button asChild variant="ghost" size="sm">
                <a href={f.REGOLAMENTO_FIRMATO[0].url} target="_blank" rel="noopener noreferrer">
                  Apri
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Sostituisci
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
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
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />

          <p className="mt-2 text-xs text-ink-muted">PDF, JPG o PNG · max 50MB.</p>
        </div>

        {error && (
          <div className="p-3 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-sm text-flag-700">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}
