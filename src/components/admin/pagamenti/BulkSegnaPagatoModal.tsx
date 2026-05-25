"use client";

import * as React from "react";
import { CheckCircle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import {
  bulkSegnaPagato,
  type MetodoPagamentoAdmin,
  type ProviderPagamentoAdmin,
} from "@/lib/actions-admin";
import { formatEUR, titoloLabel } from "@/lib/portale-utils";
import type { TitoloAdminEnriched } from "@/lib/airtable-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titoli: TitoloAdminEnriched[];
  onSuccess?: () => void;
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

export function BulkSegnaPagatoModal({ open, onOpenChange, titoli, onSuccess }: Props) {
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
    const res = await bulkSegnaPagato({
      ids: titoli.map((t) => t.id),
      metodo,
      dataPagamento: dataPagamento + ":00.000Z",
      provider,
      note: note || undefined,
    });
    if (res.errors.length > 0) {
      alert(
        `Operazione completata con ${res.errors.length} errore${res.errors.length > 1 ? "i" : ""}. ` +
          `Aggiornati ${res.processed}, ignorati ${res.skipped}.`,
      );
    }
    onSuccess?.();
  };

  const totale = titoli.reduce((sum, t) => sum + (t.fields.IMPORTO ?? 0), 0);
  const primaRataCount = titoli.filter((t) => t.fields.NUMERO_RATA === 1).length;
  const N = titoli.length;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Segna pagati in blocco"
      description={`Registra manualmente il pagamento di ${N} titoli con lo stesso metodo e data.`}
      icon={<CheckCircle size={18} />}
      iconTone="grass"
      size="lg"
      submitLabel={`Segna ${N} pagati`}
      submitVariant="success"
      cancelLabel="Annulla"
      footerHint="Idempotente: titoli già pagati vengono ignorati silenziosamente."
      onSubmit={handleSubmit}
    >
      {/* Context card riepilogo */}
      <div className="rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-grass-700">
          {N} titoli selezionati
        </p>
        <div className="max-h-[140px] overflow-y-auto flex flex-col gap-1 pr-1">
          {titoli.map((t) => {
            const label = titoloLabel(t).primary;
            const bambino =
              t.iscrizione?.fields.NOME_BAMBINO && t.iscrizione?.fields.COGNOME_BAMBINO
                ? `${t.iscrizione.fields.COGNOME_BAMBINO} ${t.iscrizione.fields.NOME_BAMBINO}`
                : "—";
            return (
              <div key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="text-ink truncate">
                  <span className="font-medium">{bambino}</span>
                  <span className="text-ink-muted"> · {label}</span>
                </span>
                <span className="font-mono text-ink shrink-0">
                  {formatEUR(t.fields.IMPORTO ?? 0)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-grass-100">
          <span className="text-[12px] font-semibold text-ink">Totale aggregato</span>
          <span className="text-2xl font-bold text-grass-700">{formatEUR(totale)}</span>
        </div>
      </div>

      {primaRataCount > 0 && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-sky-50 border border-sky-200 px-3 py-2 text-[12px] text-sky-700"
        >
          <strong>
            {primaRataCount} titol{primaRataCount > 1 ? "i" : "o"}{" "}
            {primaRataCount > 1 ? "sono 1ª rata" : "è 1ª rata"}
          </strong>
          : verrà aggiornato anche <strong>PRIMA_RATA_PAGATA</strong> sulle relative iscrizioni.
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
            {METODI.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderPagamentoAdmin)}
            className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            {PROVIDER.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
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
          placeholder="Riferimento ricevuta cumulativa, numero bonifico…"
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>
    </AdminFormDialog>
  );
}
