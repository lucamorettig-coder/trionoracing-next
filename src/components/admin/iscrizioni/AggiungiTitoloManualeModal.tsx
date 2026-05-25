"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { creaTitoloManuale, type TipoTitoloManuale } from "@/lib/actions-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizioneId: string;
  importoTotale?: number;
}

const TIPI: { value: TipoTitoloManuale; label: string }[] = [
  { value: "rata", label: "Rata" },
  { value: "seconda_rata", label: "2ª rata" },
  { value: "terza_rata", label: "3ª rata" },
  { value: "Abbigliamento", label: "Abbigliamento / kit" },
  { value: "altro", label: "Altro" },
];

export function AggiungiTitoloManualeModal({ open, onOpenChange, iscrizioneId, importoTotale }: Props) {
  const [tipo, setTipo] = React.useState<TipoTitoloManuale>("altro");
  const [importo, setImporto] = React.useState("");
  const [scadenza, setScadenza] = React.useState(
    () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [descrizione, setDescrizione] = React.useState("");
  const [note, setNote] = React.useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTipo("altro");
      setImporto("");
      setScadenza(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // ok: inside event handler
      setDescrizione("");
      setNote("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    await creaTitoloManuale(iscrizioneId, {
      tipo,
      importo: parseFloat(importo),
      scadenza,
      descrizione: descrizione.slice(0, 80),
      note: note || undefined,
    });
  };

  const isValid = !!importo && !isNaN(parseFloat(importo)) && !!descrizione.trim() && !!scadenza;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Aggiungi titolo manuale"
      description="Crea un titolo di pagamento extra al di fuori del piano rate automatico."
      icon={<PlusCircle size={18} />}
      iconTone="navy"
      submitLabel="Crea titolo"
      cancelLabel="Annulla"
      footerHint="Il titolo non viene incluso nel conteggio delle rate del piano."
      onSubmit={isValid ? handleSubmit : undefined}
    >
      {importoTotale != null && (
        <div className="rounded-[var(--radius-md)] bg-sky-50 border border-sky-200 px-3 py-2 text-[12.5px] text-sky-700">
          Iscrizione #{iscrizioneId.slice(-6)} · Piano totale{" "}
          <strong>€ {importoTotale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</strong>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Tipo titolo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoTitoloManuale)}
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        >
          {TIPI.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">
            Importo (€) <span className="text-flag-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
            placeholder="es. 25.00 o -10.00"
            className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
          {tipo === "altro" && (
            <p className="text-[11px] text-ink-muted">Usa valore negativo per sconti (es. -15.00)</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">
            Scadenza <span className="text-flag-500">*</span>
          </label>
          <input
            type="date"
            value={scadenza}
            onChange={(e) => setScadenza(e.target.value)}
            className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">
          Descrizione <span className="text-flag-500">*</span>
          <span className="font-normal text-ink-muted ml-1">max 80 char</span>
        </label>
        <input
          type="text"
          maxLength={80}
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Es. Supplemento kit personalizzato 2026"
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Note interne</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Note per uso interno admin"
          className="px-3 py-2 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 resize-y"
        />
      </div>
    </AdminFormDialog>
  );
}
