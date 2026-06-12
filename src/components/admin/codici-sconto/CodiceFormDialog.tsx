"use client";

import * as React from "react";
import { TicketPercent, Plus, AlertTriangle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { Button } from "@/components/ui/button";
import type { CodiceSconto } from "@/lib/codici-sconto";
import type { CodiceScontoFormData } from "@/lib/airtable-admin";
import {
  createCodiceScontoAction,
  updateCodiceScontoAction,
} from "@/app/portale/(portal)/admin/codici-sconto/actions";

function oggiISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function fineAnnoISO(): string {
  return `${new Date().getFullYear()}-12-31`;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codice?: CodiceSconto;
}

export function CodiceFormDialog({ open, onOpenChange, codice }: DialogProps) {
  const editing = !!codice;
  const f = codice?.fields ?? {};

  const [codiceInput, setCodiceInput] = React.useState(f.CODICE ?? "");
  const [importo, setImporto] = React.useState(f.IMPORTO ?? 0);
  const [validoDa, setValidoDa] = React.useState(f.VALIDO_DA ?? oggiISO());
  const [validoA, setValidoA] = React.useState(f.VALIDO_A ?? fineAnnoISO());
  const [attivo, setAttivo] = React.useState(f.ATTIVO ?? true);
  const [descrizione, setDescrizione] = React.useState(f.DESCRIZIONE ?? "");
  const [errore, setErrore] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setErrore(null);
    const data: CodiceScontoFormData = {
      codice: codiceInput.trim(),
      importo: Number(importo) || 0,
      validoDa,
      validoA,
      attivo,
      descrizione: descrizione.trim() || undefined,
    };
    const res = editing
      ? await updateCodiceScontoAction(codice.id, data)
      : await createCodiceScontoAction(data);
    if (!res.ok) {
      // Errore inline (codice non valido / duplicato / date incoerenti).
      // Re-throw mantiene il dialog aperto: AdminFormDialog chiude solo su successo.
      setErrore(res.error);
      throw new Error(res.error);
    }
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifica codice sconto" : "Nuovo codice sconto"}
      description={
        editing
          ? `Codice ${f.CODICE ?? ""}`
          : "Crea un codice sconto a importo fisso con periodo di validità."
      }
      icon={<TicketPercent size={18} />}
      iconTone="navy"
      size="md"
      submitLabel={editing ? "Salva modifiche" : "Crea codice"}
      footerHint="Lo sconto si applica solo se l'importo da pagare resta maggiore di zero."
      onSubmit={handleSubmit}
    >
      {errore && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-flag-50 border border-flag-200 border-l-[3px] border-l-flag-500 px-3 py-2.5 text-[12.5px] text-flag-700 flex items-start gap-2"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{errore}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Codice">
          <input
            type="text"
            value={codiceInput}
            onChange={(e) => setCodiceInput(e.target.value)}
            placeholder="ESTATE2026"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-9 px-3 text-[13px] uppercase border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
          />
        </Field>
        <CurrencyField label="Sconto" value={importo} onChange={setImporto} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Valido dal">
          <input
            type="date"
            value={validoDa}
            onChange={(e) => setValidoDa(e.target.value)}
            className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
          />
        </Field>
        <Field label="Valido fino al">
          <input
            type="date"
            value={validoA}
            onChange={(e) => setValidoA(e.target.value)}
            className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
          />
        </Field>
      </div>

      <Field label="Descrizione (opzionale)">
        <input
          type="text"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Promo iscrizioni estate"
          className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
        />
      </Field>

      <label className="flex items-start gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] cursor-pointer">
        <input
          type="checkbox"
          checked={attivo}
          onChange={(e) => setAttivo(e.target.checked)}
          className="mt-0.5"
        />
        <div>
          <p className="text-[13px] font-semibold text-ink">Codice attivo</p>
          <p className="text-[11.5px] text-ink-muted mt-0.5">
            Solo i codici attivi e nel periodo di validità sono applicabili dai genitori.
          </p>
        </div>
      </label>
    </AdminFormDialog>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-[11.5px] font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type="number"
          step="0.01"
          min={0}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-9 px-3 pr-7 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full text-right tabular-nums"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-[13px] font-semibold pointer-events-none">
          €
        </span>
      </div>
    </Field>
  );
}

export function CodiceFormDialogTrigger() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} />
        Nuovo codice
      </Button>
      {open && <CodiceFormDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
