"use client";

import * as React from "react";
import { CheckCircle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { segnaTitoloPagato, type MetodoPagamentoAdmin, type ProviderPagamentoAdmin } from "@/lib/actions-admin";
import type { TitoloPagamento } from "@/lib/airtable-portale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titolo: TitoloPagamento;
}

const METODI: { value: MetodoPagamentoAdmin; label: string }[] = [
  { value: "bonifico", label: "Bonifico" },
  { value: "contanti", label: "Contanti" },
  { value: "pos_segreteria", label: "POS segreteria" },
  { value: "app", label: "App SumUp" },
];

const PROVIDER: { value: ProviderPagamentoAdmin; label: string }[] = [
  { value: "Altro", label: "Altro / manuale" },
  { value: "SUMUP", label: "SumUp" },
  { value: "Nexi", label: "Nexi" },
];

export function SegnaTitoloPagatoModal({ open, onOpenChange, titolo }: Props) {
  const now = new Date().toISOString().slice(0, 16);
  const [metodo, setMetodo] = React.useState<MetodoPagamentoAdmin>("bonifico");
  const [dataPagamento, setDataPagamento] = React.useState(now);
  const [provider, setProvider] = React.useState<ProviderPagamentoAdmin>("Altro");
  const [note, setNote] = React.useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMetodo("bonifico");
      setDataPagamento(new Date().toISOString().slice(0, 16));
      setProvider("Altro");
      setNote("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    await segnaTitoloPagato(titolo.id, {
      metodo,
      dataPagamento: dataPagamento + ":00.000Z",
      provider,
      note: note || undefined,
    });
  };

  const importo = titolo.fields.IMPORTO ?? 0;
  const descrizione = titolo.fields.DESCRIZIONE ?? `Titolo ${titolo.id.slice(-6)}`;
  const scadenza = titolo.fields.DATA_SCADENZA_PAGAMENTO;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Segna come pagato"
      description="Registra manualmente il pagamento del titolo selezionato."
      icon={<CheckCircle size={18} />}
      iconTone="grass"
      submitLabel="Segna pagato"
      submitVariant="success"
      cancelLabel="Annulla"
      footerHint="Idempotente: chiamato 2× sullo stesso titolo non crea duplicati."
      onSubmit={handleSubmit}
    >
      {/* Context card */}
      <div className="rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-ink">{descrizione}</p>
          {scadenza && (
            <p className="text-[12px] text-ink-muted mt-0.5">
              Scadenza {new Date(scadenza).toLocaleDateString("it-IT")}
            </p>
          )}
        </div>
        <p className="text-2xl font-bold text-grass-700 shrink-0">
          € {importo.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {titolo.fields.NUMERO_RATA === 1 && (
        <div className="rounded-[var(--radius-md)] bg-sky-50 border border-sky-200 px-3 py-2 text-[12px] text-sky-700">
          Questo è il titolo di 1ª rata — verrà aggiornato anche{" "}
          <strong>PRIMA_RATA_PAGATA</strong> sull&apos;iscrizione.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Metodo di pagamento</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as MetodoPagamentoAdmin)}
            className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            {METODI.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderPagamentoAdmin)}
            className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            {PROVIDER.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Data pagamento</label>
        <input
          type="datetime-local"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Note interne</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Riferimento ricevuta, numero bonifico…"
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>
    </AdminFormDialog>
  );
}
