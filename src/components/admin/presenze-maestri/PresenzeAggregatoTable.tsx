"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatEUR } from "@/lib/portale-utils";
import type { PresenzaAggregata } from "@/lib/airtable-admin";

interface Props {
  rows: PresenzaAggregata[];
  mese: number;
  anno: number;
}

function iniziali(nome: string, cognome: string): string {
  const a = (cognome[0] ?? "").toUpperCase();
  const b = (nome[0] ?? "").toUpperCase();
  return `${a}${b}` || "—";
}

export function PresenzeAggregatoTable({ rows, mese, anno }: Props) {
  const router = useRouter();

  const columns: ColumnDef<PresenzaAggregata>[] = [
    {
      key: "maestro",
      label: "Maestro",
      sortable: true,
      accessor: (r) => `${r.maestroCognome} ${r.maestroNome}`,
      cellRenderer: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 w-8 h-8 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center text-[11px] font-bold">
            {iniziali(r.maestroNome, r.maestroCognome)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink leading-tight">
              {r.maestroCognome} {r.maestroNome}
            </span>
            {r.maestroQualifica && (
              <span className="text-[11px] text-ink-muted leading-tight">
                {r.maestroQualifica}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "presenze",
      label: "N° presenze",
      width: "180px",
      sortable: true,
      accessor: (r) => r.presenzeTotali,
      cellRenderer: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink">
            {r.presenzeTotali} totali
          </span>
          <span className="text-[11px] text-ink-muted">
            {r.nLezioni} lez · {r.nGare} gar{r.nGare === 1 ? "a" : "e"}
          </span>
        </div>
      ),
    },
    {
      key: "dovuto",
      label: "Dovuto",
      width: "120px",
      align: "right",
      sortable: true,
      accessor: (r) => r.dovuto,
      cellRenderer: (r) => (
        <span className="font-semibold tabular-nums text-ink">
          {formatEUR(r.dovuto)}
        </span>
      ),
    },
    {
      key: "pagato",
      label: "Pagato",
      width: "150px",
      align: "right",
      sortable: true,
      accessor: (r) => r.pagato,
      cellRenderer: (r) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold tabular-nums text-grass-700">
            {formatEUR(r.pagato)}
          </span>
          <span className="text-[11px] text-ink-muted">
            {r.presenzePagate}/{r.presenzeTotali} pagate
          </span>
        </div>
      ),
    },
    {
      key: "residuo",
      label: "Residuo",
      width: "150px",
      align: "right",
      sortable: true,
      accessor: (r) => r.residuo,
      cellRenderer: (r) => {
        if (r.residuo <= 0) {
          return (
            <span className="text-sm text-ink-muted tabular-nums">
              {formatEUR(0)}
            </span>
          );
        }
        return (
          <div className="inline-flex items-center gap-2">
            <span className="font-bold tabular-nums text-ember-700">
              {formatEUR(r.residuo)}
            </span>
            <Badge variant="warning" size="sm">
              da pagare
            </Badge>
          </div>
        );
      },
    },
    {
      key: "azioni",
      label: "",
      width: "120px",
      align: "right",
      cellRenderer: (r) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-semibold text-navy-700 hover:text-navy-900 rounded-[var(--radius-sm)] hover:bg-navy-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/portale/admin/presenze-maestri/${r.maestroId}?mese=${mese}&anno=${anno}`,
            );
          }}
        >
          Dettaglio
          <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <DataTable<PresenzaAggregata>
      columns={columns}
      data={rows}
      getRowId={(r) => r.maestroId}
      onRowClick={(r) =>
        router.push(
          `/portale/admin/presenze-maestri/${r.maestroId}?mese=${mese}&anno=${anno}`,
        )
      }
      initialSortKey="residuo"
      initialSortDir="desc"
      emptyState={
        <div className="text-center py-12">
          <ClipboardList className="mx-auto text-ink-muted/60 mb-3" size={32} />
          <p className="font-semibold text-ink">Nessuna presenza nel periodo selezionato</p>
          <p className="text-sm text-ink-muted mt-1 max-w-md mx-auto">
            Le presenze maestri vengono generate automaticamente quando un maestro
            registra una lezione o una gara viene confermata.
          </p>
        </div>
      }
    />
  );
}
