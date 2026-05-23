"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, Label, Input, FormHelper } from "@/components/ui/form";
import DropZoneFile from "@/components/portale/figli/DropZoneFile";
import { certBadgeVariant, formatDateIT } from "@/lib/portale-utils";
import type { Bambino } from "@/lib/airtable-portale";

interface Props {
  bambino: Bambino;
}

export default function TabCertificato({ bambino }: Props) {
  const [certFile, setCertFile] = useState<File | null>(null);
  const [dataScadenza, setDataScadenza] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fields } = bambino;
  const certUrl = fields.CERTIFICATO_MEDICO_FILE?.[0]?.url;
  const certFilename = fields.CERTIFICATO_MEDICO_FILE?.[0]?.filename;
  const { variant, label } = certBadgeVariant(
    fields.CERTIFICATO_MEDICO_STATO,
    fields.CERTIFICATO_MEDICO_SCADENZA,
  );

  async function handleUpload() {
    if (!certFile) { setError("Seleziona un file prima di procedere."); return; }
    if (!dataScadenza) { setError("Inserisci la data di scadenza del certificato."); return; }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", certFile);
      formData.append("dataScadenza", dataScadenza);
      const res = await fetch(`/api/portale/bambini/${bambino.id}/certificato`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const raw = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(raw);
          msg = parsed.error ?? msg;
        } catch {
          if (raw) msg = raw.slice(0, 200);
        }
        throw new Error(msg);
      }
      setSuccess(true);
      setCertFile(null);
      setDataScadenza("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il caricamento.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stato attuale */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="font-bold text-ink mb-4">Stato attuale</h2>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Badge variant={variant} size="md">{label}</Badge>
            {fields.CERTIFICATO_MEDICO_SCADENZA && (
              <p className="text-xs text-ink-muted mt-2">
                Data scadenza: {formatDateIT(fields.CERTIFICATO_MEDICO_SCADENZA)}
              </p>
            )}
          </div>
        </div>
        {certUrl && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] border border-line">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{certFilename ?? "Certificato"}</p>
            </div>
            <a
              href={certUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs text-sky-600 hover:text-navy-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Apri
            </a>
          </div>
        )}
      </section>

      {/* Carica nuovo */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-5">
        <h2 className="font-bold text-ink">Carica nuovo certificato</h2>

        {success && (
          <div className="bg-grass-50 border border-grass-200 rounded-[var(--radius-md)] px-4 py-2 text-grass-700 text-sm">
            Certificato caricato con successo.
          </div>
        )}
        {error && (
          <div className="bg-flag-50 border border-flag-200 rounded-[var(--radius-md)] px-4 py-2 text-flag-700 text-sm">
            {error}
          </div>
        )}

        <DropZoneFile
          accept="application/pdf,image/jpeg,image/png"
          maxSize={50 * 1024 * 1024}
          onFile={(f) => { setCertFile(f); setSuccess(false); }}
          helper="PDF, JPG o PNG — max 50MB"
        />

        <FormField>
          <Label htmlFor="data-scadenza" required>Data scadenza certificato</Label>
          <Input
            id="data-scadenza"
            type="date"
            value={dataScadenza}
            onChange={(e) => setDataScadenza(e.target.value)}
          />
          <FormHelper>La trovi sul documento rilasciato dal medico.</FormHelper>
        </FormField>

        <Button
          variant="primary"
          size="md"
          onClick={handleUpload}
          loading={uploading}
          disabled={!certFile || !dataScadenza}
        >
          Carica certificato
        </Button>

        <p className="text-xs text-ink-muted">
          Il certificato medico-sportivo non agonistico è obbligatorio per la pratica del ciclismo.
          Lo puoi richiedere a un medico autorizzato (medico di famiglia, pediatra o medico sportivo).
        </p>
      </section>
    </div>
  );
}
