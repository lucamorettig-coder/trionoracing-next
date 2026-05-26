"use client";

import * as React from "react";
import { BookOpen, Users, AlertTriangle, FileText, Award, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateIT } from "@/lib/portale-utils";
import type { LezioneRow } from "./LezioniDataTable";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lezione: LezioneRow | null;
  /** Map id bambino → "Cognome Nome" per arricchimento UI lato server (opzionale). */
  bambiniNomi?: Record<string, string>;
}

export function LezioneDetailModal({ open, onOpenChange, lezione, bambiniNomi }: Props) {
  if (!lezione) return null;

  const data = lezione.fields.DATA ? formatDateIT(lezione.fields.DATA) : "—";
  const compilatori = lezione.maestriNomi.filter((m) => m.isCompilatore);
  const altri = lezione.maestriNomi.filter((m) => !m.isCompilatore);
  const bambiniIds = lezione.fields.BAMBINI_PRESENTI ?? [];
  const noteAttivita = lezione.fields.NOTE_ATTIVITA;
  const noteInterne = lezione.fields.NOTE_INTERNE;
  const tipoSessione = lezione.fields.TIPO_SESSIONE;
  const attivita = lezione.fields.ATTIVITA_SVOLTE ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showClose={false}
        className="p-0 overflow-hidden flex flex-col max-h-[calc(100vh-64px)]"
      >
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-line">
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-navy-50 text-navy-700">
            <BookOpen size={18} />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <DialogTitle className="text-base font-bold text-ink leading-tight">
              Lezione del {data}
            </DialogTitle>
            {tipoSessione && (
              <DialogDescription className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">
                {tipoSessione}
              </DialogDescription>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700/30"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted flex items-center gap-1.5">
              <Award size={12} /> Maestri presenti
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {compilatori.map((m) => (
                <Badge key={m.id} variant="default" size="sm" title="Compilatore registro">
                  {m.cognome} {m.nome} ★
                </Badge>
              ))}
              {altri.map((m) => (
                <Badge key={m.id} variant="neutral" size="sm">
                  {m.cognome} {m.nome}
                </Badge>
              ))}
              {lezione.maestriNomi.length === 0 && (
                <span className="text-sm text-ink-muted">Nessun maestro registrato.</span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted flex items-center gap-1.5">
              <Users size={12} /> Bambini presenti ({bambiniIds.length})
            </h3>
            {bambiniIds.length === 0 ? (
              <p className="text-sm text-ink-muted">Nessun bambino registrato.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bambiniIds.map((id) => (
                  <Badge key={id} variant="info" size="sm">
                    {bambiniNomi?.[id] ?? id.slice(0, 8)}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {attivita.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted">
                Attività svolte
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {attivita.map((a) => (
                  <Badge key={a} variant="sun" size="sm">
                    {a}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {noteAttivita && (
            <section className="flex flex-col gap-1.5">
              <h3 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted flex items-center gap-1.5">
                <FileText size={12} /> Note pubbliche (visibili ai genitori)
              </h3>
              <div className="rounded-[var(--radius-md)] bg-sky-50 border border-sky-100 px-3 py-2 text-[13px] text-ink whitespace-pre-wrap">
                {noteAttivita}
              </div>
            </section>
          )}

          {noteInterne && (
            <section className="flex flex-col gap-1.5">
              <h3 className="text-[11px] uppercase tracking-wide font-semibold text-ember-700 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Note interne (admin/maestri)
              </h3>
              <div className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 px-3 py-2 text-[13px] text-ink whitespace-pre-wrap">
                {noteInterne}
              </div>
            </section>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line bg-bg-soft">
          <Button type="button" variant="primary" size="sm" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
