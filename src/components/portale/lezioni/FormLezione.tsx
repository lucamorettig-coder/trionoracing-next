"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TIPO_SESSIONE_VALUES, type TipoSessione } from "@/lib/airtable-portale";
import { tipoSessioneStyle } from "@/lib/portale-utils";
import type { Bambino, Lezione, Maestro } from "@/lib/airtable-portale";
import AttivitaChips from "./AttivitaChips";
import MaestriSelector from "./MaestriSelector";
import BambiniSelector from "./BambiniSelector";

interface Props {
  /** Server Action a cui inviare il form. */
  action: (formData: FormData) => void | Promise<void>;
  /** Lezione esistente per pre-compilazione (modalità edit). */
  lezione?: Lezione;
  maestri: Maestro[];
  bambini: Bambino[];
  currentMaestroId: string;
  readOnly?: boolean;
  /** Etichetta CTA principale. */
  submitLabel?: string;
  /** Mostrato come hidden input `id` (modalità update). */
  lezioneId?: string;
}

const oggiISO = () => new Date().toISOString().slice(0, 10);

export default function FormLezione({
  action,
  lezione,
  maestri,
  bambini,
  currentMaestroId,
  readOnly = false,
  submitLabel = "Salva lezione",
  lezioneId,
}: Props) {
  const f = lezione?.fields;
  const [tipo, setTipo] = useState<TipoSessione | "">(
    (f?.TIPO_SESSIONE as TipoSessione | undefined) ?? "",
  );

  return (
    <form
      action={action}
      className="space-y-8 max-w-[720px]"
      aria-label="Form lezione"
    >
      {lezioneId && <input type="hidden" name="id" value={lezioneId} />}

      {/* Sezione 1 — Quando + tipo */}
      <fieldset className="space-y-4" disabled={readOnly}>
        <legend className="text-lg font-bold text-ink mb-1">Quando</legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="data-input" className="text-sm font-semibold text-ink">
              Data lezione
            </label>
            <input
              id="data-input"
              type="date"
              name="DATA"
              required
              defaultValue={f?.DATA ?? oggiISO()}
              max={oggiISO()}
              className="w-full h-11 px-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10 disabled:bg-bg-soft"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Tipo di sessione</p>
          <div role="radiogroup" aria-label="Tipo di sessione" className="flex flex-wrap gap-2">
            {TIPO_SESSIONE_VALUES.map((t) => {
              const style = tipoSessioneStyle(t);
              const isSelected = tipo === t;
              return (
                <label
                  key={t}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border cursor-pointer transition-colors text-sm font-medium",
                    isSelected
                      ? `${style.bg} ${style.text} border-transparent`
                      : "bg-white border-line text-ink hover:border-navy-200",
                    readOnly && "cursor-not-allowed",
                  )}
                >
                  <input
                    type="radio"
                    name="TIPO_SESSIONE"
                    value={t}
                    checked={isSelected}
                    onChange={() => setTipo(t)}
                    disabled={readOnly}
                    required
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                      isSelected ? "bg-white/20" : `${style.bg} ${style.text}`,
                    )}
                  >
                    {style.shortLabel}
                  </span>
                  {t}
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Sezione 2 — Chi ha tenuto */}
      <fieldset className="space-y-3" disabled={readOnly}>
        <legend className="text-lg font-bold text-ink mb-1">Chi ha tenuto la lezione</legend>
        <p className="text-xs text-ink-muted">
          Sei sempre incluso. Aggiungi i co-maestri presenti per la continuità di team.
        </p>
        <MaestriSelector
          maestri={maestri}
          currentMaestroId={currentMaestroId}
          defaultValue={f?.MAESTRI_PRESENTI ?? [currentMaestroId]}
          disabled={readOnly}
        />
      </fieldset>

      {/* Sezione 3 — Argomento */}
      <fieldset className="space-y-3" disabled={readOnly}>
        <legend className="text-lg font-bold text-ink mb-1">Argomento della lezione</legend>
        <p className="text-xs text-ink-muted">
          Seleziona una o più aree affrontate (chips multi-select).
        </p>
        <AttivitaChips defaultValue={f?.ATTIVITA_SVOLTE ?? []} disabled={readOnly} />
      </fieldset>

      {/* Sezione 4 — Bambini presenti */}
      <fieldset className="space-y-3" disabled={readOnly}>
        <legend id="bambini-selector-label" className="text-lg font-bold text-ink mb-1">
          Bambini presenti
        </legend>
        <p className="text-xs text-ink-muted">
          Filtra per nome e seleziona i bambini partecipanti.
        </p>
        <BambiniSelector
          bambini={bambini}
          defaultValue={f?.BAMBINI_PRESENTI ?? []}
          disabled={readOnly}
        />
      </fieldset>

      {/* Sezione 5 — Note */}
      <fieldset className="space-y-4" disabled={readOnly}>
        <legend className="text-lg font-bold text-ink mb-1">Note</legend>

        <div className="space-y-1.5">
          <label htmlFor="note-pub" className="text-sm font-semibold text-ink">
            Note pubbliche{" "}
            <span className="text-xs font-normal text-ink-muted">
              (visibili ai genitori)
            </span>
          </label>
          <textarea
            id="note-pub"
            name="NOTE_ATTIVITA"
            rows={3}
            defaultValue={f?.NOTE_ATTIVITA ?? ""}
            placeholder="Es. Gruppo concentrato sulla tecnica di curva, buoni progressi su…"
            className="w-full p-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10 disabled:bg-bg-soft"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="note-int" className="text-sm font-semibold text-ink">
            Note interne{" "}
            <span className="text-xs font-normal text-ink-muted">
              (solo maestri e admin)
            </span>
          </label>
          <textarea
            id="note-int"
            name="NOTE_INTERNE"
            rows={3}
            defaultValue={f?.NOTE_INTERNE ?? ""}
            placeholder="Es. Continuare con esercizio X la prossima settimana. Bambino Y da seguire."
            className="w-full p-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10 disabled:bg-bg-soft"
          />
        </div>
      </fieldset>

      {!readOnly && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="md">
            {submitLabel}
          </Button>
          <Button asChild variant="ghost" size="md">
            <Link href="/portale/lezioni">Annulla</Link>
          </Button>
        </div>
      )}
    </form>
  );
}
