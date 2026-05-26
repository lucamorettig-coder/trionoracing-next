"use client";

import * as React from "react";
import { Users, MoreVertical, Eye } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { LezioneDetailModal } from "./LezioneDetailModal";
import { formatDateIT } from "@/lib/portale-utils";
import type { Lezione } from "@/lib/airtable-portale";

export interface LezioneRow extends Lezione {
  /** Map maestroId -> "Cognome Nome" pre-calcolata server-side per evitare N+1 client. */
  maestriNomi: Array<{ id: string; cognome: string; nome: string; isCompilatore: boolean }>;
}

interface Props {
  rows: LezioneRow[];
}

const GIORNI_SETTIMANA = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

function giornoSettimanaIT(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return GIORNI_SETTIMANA[d.getDay()] ?? "";
  } catch {
    return "";
  }
}

export function LezioniDataTable({ rows }: Props) {
  const [selected, setSelected] = React.useState<LezioneRow | null>(null);

  const columns: ColumnDef<LezioneRow>[] = [
    {
      key: "data",
      label: "Data",
      width: "140px",
      sortable: true,
      accessor: (r) => r.fields.DATA ?? "",
      cellRenderer: (r) => {
        const data = r.fields.DATA;
        if (!data) return <span className="text-ink-muted">—</span>;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ink">{formatDateIT(data)}</span>
            <span className="text-[11px] font-mono uppercase text-ink-muted">
              {giornoSettimanaIT(data)}
            </span>
          </div>
        );
      },
    },
    {
      key: "argomento",
      label: "Argomento",
      sortable: true,
      accessor: (r) => r.fields.TIPO_SESSIONE ?? r.fields.NOTE_ATTIVITA ?? "",
      cellRenderer: (r) => {
        const tipo = r.fields.TIPO_SESSIONE;
        const note = r.fields.NOTE_ATTIVITA;
        return (
          <div className="flex flex-col gap-0.5">
            {tipo && <span className="text-sm font-semibold text-ink leading-tight">{tipo}</span>}
            {note && (
              <span className="text-[12px] text-ink-muted line-clamp-2 leading-snug">
                {note}
              </span>
            )}
            {!tipo && !note && <span className="text-ink-muted">—</span>}
          </div>
        );
      },
    },
    {
      key: "maestri",
      label: "Maestri",
      width: "260px",
      cellRenderer: (r) => {
        const list = r.maestriNomi ?? [];
        if (list.length === 0) return <span className="text-ink-muted text-sm">—</span>;
        const visible = list.slice(0, 3);
        const extra = list.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1 items-center">
            {visible.map((m) => (
              <Badge
                key={m.id}
                variant={m.isCompilatore ? "default" : "neutral"}
                size="sm"
                title={m.isCompilatore ? "Compilatore" : undefined}
              >
                {m.cognome}
              </Badge>
            ))}
            {extra > 0 && (
              <span
                className="text-[11px] text-ink-muted"
                title={list
                  .slice(3)
                  .map((m) => `${m.cognome} ${m.nome}`)
                  .join(" · ")}
              >
                +{extra}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "bambini",
      label: "N° bambini",
      width: "120px",
      align: "center",
      sortable: true,
      accessor: (r) => r.fields.BAMBINI_PRESENTI?.length ?? 0,
      cellRenderer: (r) => {
        const n = r.fields.BAMBINI_PRESENTI?.length ?? 0;
        return (
          <div className="inline-flex items-center gap-1.5 text-sm text-ink">
            <Users size={14} className="text-ink-muted" />
            <span className="font-semibold">{n}</span>
          </div>
        );
      },
    },
    {
      key: "azioni",
      label: "",
      width: "60px",
      align: "right",
      cellRenderer: (r) => (
        <button
          type="button"
          aria-label="Apri dettaglio"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(r);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable<LezioneRow>
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => setSelected(r)}
        initialSortKey="data"
        initialSortDir="desc"
        emptyState={
          <div className="text-center py-12">
            <Eye className="mx-auto text-ink-muted/60 mb-3" size={32} />
            <p className="font-semibold text-ink">Nessuna lezione registrata</p>
            <p className="text-sm text-ink-muted mt-1">
              Le lezioni vengono registrate dai maestri dal portale{" "}
              <code className="text-[12px]">/portale/lezioni</code>.
            </p>
          </div>
        }
      />
      <LezioneDetailModal
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        lezione={selected}
      />
    </>
  );
}
