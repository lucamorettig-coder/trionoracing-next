"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { aggiungiPresenzaManualeAction } from "@/app/portale/(portal)/admin/presenze-maestri/actions";
import type { PresenzaTipo } from "@/lib/airtable-portale";

interface MaestroOption {
  id: string;
  nome: string;
  cognome: string;
  tariffaLezione: number | undefined;
  tariffaGara: number | undefined;
}

interface EventoOption {
  id: string;
  label: string;
  data: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maestri: MaestroOption[];
  lezioniRecenti: EventoOption[];
  garePassate: EventoOption[];
  /** Se passato, il maestro è prefillato e disabled (uso da drill-down). */
  maestroPrefill?: { id: string; tariffaLezione: number | undefined; tariffaGara: number | undefined };
  onSuccess?: () => void;
}

export function AggiungiPresenzaManualeModal({
  open,
  onOpenChange,
  maestri,
  lezioniRecenti,
  garePassate,
  maestroPrefill,
  onSuccess,
}: Props) {
  const [tipo, setTipo] = React.useState<PresenzaTipo>("lezione");
  const [maestroId, setMaestroId] = React.useState<string>(maestroPrefill?.id ?? "");
  const [eventoId, setEventoId] = React.useState<string>("");
  const [data, setData] = React.useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [importo, setImporto] = React.useState<string>("");
  const [pagato, setPagato] = React.useState(false);
  const [dataPagamento, setDataPagamento] = React.useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = React.useState<string>("");

  // Prefill importo dalla tariffa del maestro quando cambia tipo/maestro.
  // Pattern React ufficiale: state snapshot vs prop, setState durante render
  // con bailout (lint React 19 no setState-in-effect).
  const [prevPrefillKey, setPrevPrefillKey] = React.useState<string>("");
  const prefillKey = `${tipo}|${maestroId}`;
  if (prefillKey !== prevPrefillKey) {
    setPrevPrefillKey(prefillKey);
    const target =
      maestri.find((m) => m.id === maestroId) ??
      (maestroPrefill
        ? {
            id: maestroPrefill.id,
            tariffaLezione: maestroPrefill.tariffaLezione,
            tariffaGara: maestroPrefill.tariffaGara,
            nome: "",
            cognome: "",
          }
        : null);
    if (target) {
      const value = tipo === "lezione" ? target.tariffaLezione : target.tariffaGara;
      if (value !== undefined && importo === "") {
        setImporto(String(value));
      }
    }
  }

  // Prefill data dall'evento selezionato (stesso pattern).
  const [prevEventoKey, setPrevEventoKey] = React.useState<string>("");
  const eventoKey = `${tipo}|${eventoId}`;
  if (eventoId && eventoKey !== prevEventoKey) {
    setPrevEventoKey(eventoKey);
    const evento =
      tipo === "lezione"
        ? lezioniRecenti.find((e) => e.id === eventoId)
        : garePassate.find((e) => e.id === eventoId);
    if (evento && data !== evento.data) {
      setData(evento.data);
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTipo("lezione");
      setMaestroId(maestroPrefill?.id ?? "");
      setEventoId("");
      setData(new Date().toISOString().slice(0, 10));
      setImporto("");
      setPagato(false);
      setDataPagamento(new Date().toISOString().slice(0, 10));
      setNote("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!maestroId) {
      alert("Seleziona un maestro");
      return;
    }
    const importoNum = parseFloat(importo);
    if (isNaN(importoNum) || importoNum < 0) {
      alert("Importo non valido");
      return;
    }
    const res = await aggiungiPresenzaManualeAction({
      tipo,
      maestroId,
      data,
      importoDovuto: importoNum,
      lezioneId: tipo === "lezione" ? eventoId || undefined : undefined,
      garaId: tipo === "gara" ? eventoId || undefined : undefined,
      pagato: pagato || undefined,
      dataPagamento: pagato ? dataPagamento : undefined,
      note: note || undefined,
    });
    if (!res.ok) {
      alert(`Errore: ${res.error}`);
      return;
    }
    onSuccess?.();
  };

  const opzioniEvento = tipo === "lezione" ? lezioniRecenti : garePassate;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Aggiungi presenza manuale"
      description="Per eventi storici pre-cutoff EVO-020 o backfill puntuale. Idempotente (skip se già esistente)."
      icon={<Plus size={18} />}
      iconTone="sky"
      size="lg"
      submitLabel="Aggiungi presenza"
      submitVariant="primary"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Tipo evento</label>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipo"
              checked={tipo === "lezione"}
              onChange={() => {
                setTipo("lezione");
                setEventoId("");
              }}
            />
            <span className="text-sm">Lezione</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipo"
              checked={tipo === "gara"}
              onChange={() => {
                setTipo("gara");
                setEventoId("");
              }}
            />
            <span className="text-sm">Gara</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Maestro</label>
          <select
            value={maestroId}
            onChange={(e) => setMaestroId(e.target.value)}
            disabled={!!maestroPrefill}
            className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 disabled:bg-bg-muted disabled:cursor-not-allowed"
          >
            <option value="">Seleziona…</option>
            {maestri.map((m) => (
              <option key={m.id} value={m.id}>
                {m.cognome} {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">
            {tipo === "lezione" ? "Lezione (opzionale)" : "Gara (opzionale)"}
          </label>
          <select
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
            className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            <option value="">— Non collegato</option>
            {opzioniEvento.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Data evento</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Importo dovuto (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
            placeholder="es. 30.00"
            className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 tabular-nums"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 rounded-[var(--radius-md)] bg-bg-soft border border-line">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pagato}
            onChange={(e) => setPagato(e.target.checked)}
          />
          <span className="text-sm font-semibold">Già pagata</span>
        </label>
        {pagato && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink">Data pagamento</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Note (opzionale)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="es. Pagato in contanti, backfill lezione storica…"
          className="px-3 py-2 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 resize-y"
        />
      </div>
    </AdminFormDialog>
  );
}
