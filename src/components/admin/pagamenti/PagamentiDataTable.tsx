"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, ExternalLink, CheckCircle } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MethodTag } from "./MethodTag";
import { BulkSegnaPagatoModal } from "./BulkSegnaPagatoModal";
import { SegnaTitoloPagatoModal } from "@/components/admin/iscrizioni/SegnaTitoloPagatoModal";
import { formatEUR, titoloLabel } from "@/lib/portale-utils";
import type { TitoloAdminEnriched } from "@/lib/airtable-admin";

interface Props {
  titoli: TitoloAdminEnriched[];
}

function statoBadge(stato?: string): { label: string; variant: BadgeVariant } {
  if (stato === "pagato") return { label: "Pagato", variant: "success" };
  if (stato === "scaduto") return { label: "Scaduto", variant: "error" };
  return { label: "Da pagare", variant: "warning" };
}

export function PagamentiDataTable({ titoli }: Props) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [singleTitolo, setSingleTitolo] = React.useState<TitoloAdminEnriched | null>(null);
  const [resetKey, setResetKey] = React.useState(0);

  const titoliById = React.useMemo(() => {
    const map: Record<string, TitoloAdminEnriched> = {};
    for (const t of titoli) map[t.id] = t;
    return map;
  }, [titoli]);

  const selectedTitoli = selectedIds.map((id) => titoliById[id]).filter(Boolean);

  const clearSelection = () => {
    setSelectedIds([]);
    setResetKey((k) => k + 1);
  };

  const columns: ColumnDef<TitoloAdminEnriched>[] = [
    {
      key: "bambino",
      label: "Bambino",
      sortable: true,
      accessor: (r) =>
        `${r.iscrizione?.fields.COGNOME_BAMBINO ?? ""} ${r.iscrizione?.fields.NOME_BAMBINO ?? ""}`.trim(),
      cellRenderer: (r) => (
        <span className="font-medium text-ink">
          {r.iscrizione?.fields.COGNOME_BAMBINO} {r.iscrizione?.fields.NOME_BAMBINO}
        </span>
      ),
    },
    {
      key: "genitore",
      label: "Genitore",
      sortable: true,
      accessor: (r) =>
        `${r.iscrizione?.fields.COGNOME_GENITORE ?? ""} ${r.iscrizione?.fields.NOME_GENITORE ?? ""}`.trim(),
      cellRenderer: (r) => (
        <span className="text-ink-muted text-[13px]">
          {r.iscrizione?.fields.COGNOME_GENITORE} {r.iscrizione?.fields.NOME_GENITORE}
        </span>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      accessor: (r) => titoloLabel(r).primary,
      cellRenderer: (r) => {
        const { primary } = titoloLabel(r);
        return <span className="text-[13px] text-ink">{primary}</span>;
      },
    },
    {
      key: "importo",
      label: "Importo",
      sortable: true,
      align: "right",
      accessor: (r) => r.fields.IMPORTO ?? 0,
      cellRenderer: (r) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums">
          {formatEUR(r.fields.IMPORTO ?? 0)}
        </span>
      ),
    },
    {
      key: "scadenza",
      label: "Scadenza",
      sortable: true,
      accessor: (r) => r.fields.DATA_SCADENZA_PAGAMENTO ?? "",
      cellRenderer: (r) => {
        const d = r.fields.DATA_SCADENZA_PAGAMENTO;
        if (!d) return <span className="text-ink-muted">—</span>;
        return (
          <span className="font-mono text-[12.5px] text-ink-muted">
            {new Date(d).toLocaleDateString("it-IT")}
          </span>
        );
      },
    },
    {
      key: "stato",
      label: "Stato",
      sortable: true,
      accessor: (r) => r.fields.STATO_TITOLO ?? "",
      cellRenderer: (r) => {
        const { label, variant } = statoBadge(r.fields.STATO_TITOLO);
        return <Badge variant={variant} size="sm">{label}</Badge>;
      },
    },
    {
      key: "metodo",
      label: "Metodo",
      sortable: true,
      accessor: (r) => r.fields.METODO_PAGAMENTO ?? "",
      cellRenderer: (r) => <MethodTag metodo={r.fields.METODO_PAGAMENTO} />,
    },
    {
      key: "pagato_il",
      label: "Pagato il",
      sortable: true,
      accessor: (r) => r.fields.DATA_PAGAMENTO ?? "",
      cellRenderer: (r) => {
        const d = r.fields.DATA_PAGAMENTO;
        if (!d) return <span className="text-ink-muted">—</span>;
        return (
          <span className="font-mono text-[12.5px] text-ink-muted">
            {new Date(d).toLocaleDateString("it-IT")}
          </span>
        );
      },
    },
    {
      key: "codice",
      label: "Riferimento",
      accessor: (r) => r.fields.CODICE_TITOLO ?? "",
      cellRenderer: (r) => (
        <span className="font-mono text-[11.5px] text-ink-muted">
          {r.fields.CODICE_TITOLO ?? r.id.slice(-6)}
        </span>
      ),
    },
    {
      key: "azioni",
      label: "",
      width: "48px",
      align: "center",
      cellRenderer: (r) => {
        const iscrId = r.fields.ISCRIZIONE?.[0];
        const bambinoId = r.iscrizione?.fields.TABELLA_BAMBINI?.[0];
        const isPagato = r.fields.STATO_TITOLO === "pagato";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-bg-muted transition-colors"
                aria-label="Azioni"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} className="text-ink-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isPagato && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setSingleTitolo(r);
                  }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={14} />
                  Segna pagato
                </DropdownMenuItem>
              )}
              {iscrId && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/portale/admin/iscrizioni/${iscrId}`}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Apri iscrizione
                  </Link>
                </DropdownMenuItem>
              )}
              {bambinoId && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/portale/admin/bambini/${bambinoId}`}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Apri bambino
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        key={resetKey}
        columns={columns}
        data={titoli}
        getRowId={(r) => r.id}
        selectable
        onSelectionChange={setSelectedIds}
        pageSize={50}
        initialSortKey="scadenza"
        emptyState={
          <p className="text-ink-muted text-sm">
            Nessun titolo trovato con i filtri selezionati.
          </p>
        }
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={clearSelection}
        itemLabel="titoli selezionati"
        actions={[
          {
            label: "Segna pagati in blocco",
            onClick: () => setBulkOpen(true),
            icon: <CheckCircle size={14} />,
          },
        ]}
      />

      {bulkOpen && selectedTitoli.length > 0 && (
        <BulkSegnaPagatoModal
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          titoli={selectedTitoli}
          onSuccess={clearSelection}
        />
      )}

      {singleTitolo && (
        <SegnaTitoloPagatoModal
          open={!!singleTitolo}
          onOpenChange={(open) => {
            if (!open) setSingleTitolo(null);
          }}
          titolo={singleTitolo}
        />
      )}
    </>
  );
}
