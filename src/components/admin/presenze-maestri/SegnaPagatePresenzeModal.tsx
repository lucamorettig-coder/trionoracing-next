"use client";

import * as React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { formatEUR, formatDateIT } from "@/lib/portale-utils";
import { segnaPresenzePagateAction } from "@/app/portale/(portal)/admin/presenze-maestri/actions";
import type { PresenzaMaestroEnriched } from "@/lib/airtable-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presenze: PresenzaMaestroEnriched[];
  onSuccess?: () => void;
}

export function SegnaPagatePresenzeModal({ open, onOpenChange, presenze, onSuccess }: Props) {
  const [dataPagamento, setDataPagamento] = React.useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDataPagamento(new Date().toISOString().slice(0, 10));
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const ids = presenze.map((p) => p.id);
    const res = await segnaPresenzePagateAction(ids, dataPagamento);
    if (!res.ok) {
      alert(`Errore: ${res.error}`);
      return;
    }
    onSuccess?.();
  };

  const totale = presenze.reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);
  const giaPagate = presenze.filter((p) => p.fields.PAGATO).length;
  const N = presenze.length;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`Segna ${N} presenz${N === 1 ? "a" : "e"} come pagat${N === 1 ? "a" : "e"}`}
      description="Registra il pagamento del rimborso al maestro per le presenze selezionate."
      icon={<CheckCircle size={18} />}
      iconTone="grass"
      size="lg"
      submitLabel={`Conferma pagamento`}
      submitVariant="success"
      footerHint="Idempotente: presenze già pagate vengono ignorate silenziosamente."
      onSubmit={handleSubmit}
    >
      <div className="rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-grass-700">
          {N} presenz{N === 1 ? "a" : "e"} selezionat{N === 1 ? "a" : "e"}
        </p>
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1 pr-1">
          {presenze.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="text-ink truncate">
                <span className="font-medium uppercase text-[10px] mr-1.5 text-ink-muted">
                  {p.fields.TIPO}
                </span>
                <span>{formatDateIT(p.fields.DATA)}</span>
                <span className="text-ink-muted"> · {p.eventoLabel}</span>
              </span>
              <span className="font-mono text-ink shrink-0 tabular-nums">
                {formatEUR(p.fields.IMPORTO_DOVUTO ?? 0)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-grass-100">
          <span className="text-[12px] font-semibold text-ink">Totale aggregato</span>
          <span className="text-2xl font-bold text-grass-700 tabular-nums">
            {formatEUR(totale)}
          </span>
        </div>
      </div>

      {giaPagate > 0 && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-3 py-2 text-[12px] text-ember-700 flex items-start gap-2"
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-ember-500" />
          <span>
            <strong>
              {giaPagate} presenz{giaPagate > 1 ? "e già pagate" : "a già pagata"}
            </strong>{" "}
            : verrann{giaPagate > 1 ? "o" : ""} ignorate per idempotenza.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">Data pagamento</label>
        <input
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          className="h-9 px-3 text-[13.5px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>
    </AdminFormDialog>
  );
}
