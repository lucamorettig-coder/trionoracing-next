"use client";

import * as React from "react";
import { Euro, Plus, AlertTriangle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { Button } from "@/components/ui/button";
import { upsertTariffa, type TariffaFormData } from "@/lib/actions-admin";
import type { Tariffa } from "@/lib/airtable-admin";
import type { TipoCorso } from "@/lib/airtable-portale";

const QUARTERS = [
  { value: "Q1", label: "Q1 (Gennaio → Aprile)" },
  { value: "Q2", label: "Q2 (Maggio → Agosto)" },
  { value: "Q3", label: "Q3 (Settembre → Dicembre)" },
] as const;

const CORSI = [
  { value: "MTB-BDC", label: "Corso MTB-BDC (Strada + MTB)" },
  { value: "SOLO-MTB", label: "Solo Mountain Bike (giovedì)" },
] as const;

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tariffa?: Tariffa;
  iscrizioniCount?: number;
  annoDefault?: number;
}

export function TariffaFormDialog({
  open,
  onOpenChange,
  tariffa,
  iscrizioniCount = 0,
  annoDefault,
}: DialogProps) {
  const editing = !!tariffa;
  const f = tariffa?.fields ?? {};

  const [anno, setAnno] = React.useState(
    f.ANNO_ISCRIZIONE ?? String(annoDefault ?? new Date().getFullYear()),
  );
  const [nomeTariffa, setNomeTariffa] = React.useState(f.NOME_TARIFFA ?? "Q1");
  const [tipoCorso, setTipoCorso] = React.useState<TipoCorso>(f.TIPO_CORSO ?? "MTB-BDC");
  const [descrizione, setDescrizione] = React.useState(f.DESCRIZIONE_TARIFFA ?? "");
  const [quotaTotale, setQuotaTotale] = React.useState(f.QUOTA_TOTALE_ANNO ?? 0);
  const [numeroRate, setNumeroRate] = React.useState(f.NUMERO_RATE ?? 3);
  const [importoRata, setImportoRata] = React.useState(f.IMPORTO_RATA ?? 0);
  const [importoKit, setImportoKit] = React.useState(f.IMPORTO_KIT_SCUOLA ?? 0);
  const [importoIscrizione, setImportoIscrizione] = React.useState(f.IMPORTO_ISCRIZIONE ?? 0);
  const [scontoFamiglia, setScontoFamiglia] = React.useState(f.SCONTO_FAMIGLIA_NUMEROSA ?? 0);
  const [attiva, setAttiva] = React.useState(f.ATTIVA ?? true);
  const [errore, setErrore] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setErrore(null);
    const data: TariffaFormData = {
      anno: String(anno).trim(),
      nomeTariffa,
      tipoCorso,
      descrizione: descrizione.trim() || undefined,
      quotaTotaleAnno: Number(quotaTotale) || 0,
      numeroRate: Number(numeroRate) || 1,
      importoRata: Number(importoRata) || 0,
      importoKitScuola: Number(importoKit) || 0,
      importoIscrizione: Number(importoIscrizione) || 0,
      scontoFamigliaNumerosa: Number(scontoFamiglia) || 0,
      attiva,
    };
    try {
      await upsertTariffa(data, tariffa?.id);
    } catch (e) {
      // Errore inline (es. violazione unicità anno+quarter+corso). Re-throw mantiene
      // il dialog aperto: AdminFormDialog chiude solo su submit riuscito.
      setErrore(e instanceof Error ? e.message : "Errore durante il salvataggio.");
      throw e;
    }
  };

  const title = editing ? "Modifica tariffa" : "Nuova tariffa";
  const description = editing
    ? `Tariffa ${f.NOME_TARIFFA ?? ""} · ${f.TIPO_CORSO ?? "MTB-BDC"} · ${f.ANNO_ISCRIZIONE ?? ""}`
    : "Crea una nuova tariffa per corso e quarter.";

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={<Euro size={18} />}
      iconTone="navy"
      size="lg"
      submitLabel={editing ? "Salva modifiche" : "Crea tariffa"}
      cancelLabel="Annulla"
      footerHint="Le modifiche non sono retroattive sulle iscrizioni già create."
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

      {editing && iscrizioniCount > 0 && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-3 py-3 text-[12.5px] text-ember-700 flex items-start gap-2"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong className="text-ink">
              {iscrizioniCount} iscrizion{iscrizioniCount === 1 ? "e storica collegata" : "i storiche collegate"} a questa tariffa
            </strong>{" "}
            (incluse eventuali annullate). Le modifiche <strong>non sono retroattive</strong>: le
            iscrizioni esistenti mantengono i valori al momento dell&apos;iscrizione.
          </span>
        </div>
      )}

      <div>
        <p className="text-[11.5px] uppercase tracking-wide font-bold text-ink-muted mb-2">
          Anagrafica
        </p>
        <Field label="Corso" className="mb-3">
          <select
            value={tipoCorso}
            onChange={(e) => setTipoCorso(e.target.value as TipoCorso)}
            className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
          >
            {CORSI.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Anno">
            <input
              type="text"
              value={anno}
              onChange={(e) => setAnno(e.target.value)}
              className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
              placeholder="2026"
            />
          </Field>
          <Field label="Quarter">
            <select
              value={nomeTariffa}
              onChange={(e) => setNomeTariffa(e.target.value)}
              className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
            >
              {QUARTERS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Descrizione (opzionale)" className="mt-3">
          <input
            type="text"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
            placeholder="Tariffa standard primo quadrimestre"
          />
        </Field>
      </div>

      <div className="h-px bg-line-soft" />

      <div>
        <p className="text-[11.5px] uppercase tracking-wide font-bold text-ink-muted mb-2">
          Importi
        </p>
        <div className="grid grid-cols-3 gap-3">
          <CurrencyField label="Quota totale anno" value={quotaTotale} onChange={setQuotaTotale} />
          <CurrencyField label="Importo iscrizione" value={importoIscrizione} onChange={setImportoIscrizione} />
          <CurrencyField label="Kit scuola" value={importoKit} onChange={setImportoKit} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field label="Numero rate">
            <input
              type="number"
              min={1}
              max={12}
              value={numeroRate}
              onChange={(e) => setNumeroRate(parseInt(e.target.value, 10) || 1)}
              className="h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full"
            />
          </Field>
          <CurrencyField label="Importo rata base" value={importoRata} onChange={setImportoRata} />
          <CurrencyField label="Sconto famiglia" value={scontoFamiglia} onChange={setScontoFamiglia} />
        </div>
        <p className="mt-3 text-[11.5px] text-ink-muted italic">
          Scadenze rate dinamiche: la 1ª rata scade nel mese di iscrizione, le successive ogni 2 mesi.
        </p>
      </div>

      <div className="h-px bg-line-soft" />

      <label className="flex items-start gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] cursor-pointer">
        <input
          type="checkbox"
          checked={attiva}
          onChange={(e) => setAttiva(e.target.checked)}
          className="mt-0.5"
        />
        <div>
          <p className="text-[13px] font-semibold text-ink">Tariffa attiva</p>
          <p className="text-[11.5px] text-ink-muted mt-0.5">
            Solo le tariffe ATTIVE sono selezionabili in fase di iscrizione. Una sola tariffa
            attiva consigliata per Anno × Quarter.
          </p>
        </div>
      </label>

    </AdminFormDialog>
  );
}

function Field({
  label,
  helper,
  className,
  children,
}: {
  label: string;
  helper?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-[11.5px] font-bold text-ink">{label}</label>
      {children}
      {helper && <span className="text-[11px] text-ink-muted">{helper}</span>}
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

export function TariffaFormDialogTrigger({ label }: { label?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Plus size={14} />
        {label ?? "Nuova tariffa"}
      </Button>
      {open && (
        <TariffaFormDialog open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
