"use client";

import * as React from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { Badge } from "@/components/ui/badge";
import { SegnaPagatePresenzeModal } from "./SegnaPagatePresenzeModal";
import { formatEUR, formatDateIT } from "@/lib/portale-utils";
import type { PresenzaMaestroEnriched } from "@/lib/airtable-admin";

interface Props {
  rows: PresenzaMaestroEnriched[];
}

export function PresenzeMaestroDrilldown({ rows }: Props) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);

  const idToRow = React.useMemo(() => {
    const m = new Map<string, PresenzaMaestroEnriched>();
    for (const r of rows) m.set(r.id, r);
    return m;
  }, [rows]);

  const selectedPresenze = React.useMemo(
    () => selectedIds.map((id) => idToRow.get(id)).filter(Boolean) as PresenzaMaestroEnriched[],
    [selectedIds, idToRow],
  );

  const columns: ColumnDef<PresenzaMaestroEnriched>[] = [
    {
      key: "tipo",
      label: "Tipo",
      width: "100px",
      sortable: true,
      accessor: (r) => r.fields.TIPO,
      cellRenderer: (r) =>
        r.fields.TIPO === "lezione" ? (
          <Badge variant="neutral" size="sm">Lezione</Badge>
        ) : (
          <Badge variant="info" size="sm">Gara</Badge>
        ),
    },
    {
      key: "data",
      label: "Data",
      width: "120px",
      sortable: true,
      accessor: (r) => r.fields.DATA,
      cellRenderer: (r) => (
        <span className="text-sm text-ink tabular-nums">{formatDateIT(r.fields.DATA)}</span>
      ),
    },
    {
      key: "evento",
      label: "Evento",
      cellRenderer: (r) => {
        if (r.eventoId) {
          const href =
            r.fields.TIPO === "lezione"
              ? `/portale/admin/lezioni?search=${encodeURIComponent(r.eventoLabel)}`
              : `/portale/admin/gare/${r.eventoId}/iscrizioni`;
          return (
            <Link href={href} className="text-sm text-navy-700 hover:underline">
              {r.eventoLabel}
            </Link>
          );
        }
        return <span className="text-sm text-ink-muted italic">{r.eventoLabel}</span>;
      },
    },
    {
      key: "importo",
      label: "Importo",
      width: "120px",
      align: "right",
      sortable: true,
      accessor: (r) => r.fields.IMPORTO_DOVUTO ?? 0,
      cellRenderer: (r) => (
        <span className="font-semibold tabular-nums text-ink">
          {formatEUR(r.fields.IMPORTO_DOVUTO ?? 0)}
        </span>
      ),
    },
    {
      key: "stato",
      label: "Stato",
      width: "200px",
      sortable: true,
      accessor: (r) => (r.fields.PAGATO ? 1 : 0),
      cellRenderer: (r) => {
        if (r.fields.PAGATO && r.fields.DATA_PAGAMENTO) {
          return (
            <Badge variant="success" size="sm">
              Pagato · {formatDateIT(r.fields.DATA_PAGAMENTO)}
            </Badge>
          );
        }
        if (r.fields.PAGATO) {
          return <Badge variant="success" size="sm">Pagato</Badge>;
        }
        return <Badge variant="warning" size="sm">Da pagare</Badge>;
      },
    },
  ];

  return (
    <>
      <DataTable<PresenzaMaestroEnriched>
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        selectable
        onSelectionChange={setSelectedIds}
        initialSortKey="data"
        initialSortDir="desc"
        emptyState={
          <div className="text-center py-12">
            <p className="font-semibold text-ink">Nessuna presenza nel periodo</p>
          </div>
        }
      />
      <BulkActionBar
        selectedCount={selectedPresenze.filter((p) => !p.fields.PAGATO).length}
        onClearSelection={() => setSelectedIds([])}
        itemLabel="da pagare"
        actions={[
          {
            label: "Segna pagate",
            icon: <CheckCircle size={14} />,
            onClick: () => setModalOpen(true),
          },
        ]}
      />
      <SegnaPagatePresenzeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        presenze={selectedPresenze.filter((p) => !p.fields.PAGATO)}
        onSuccess={() => {
          setModalOpen(false);
          setSelectedIds([]);
        }}
      />
    </>
  );
}
