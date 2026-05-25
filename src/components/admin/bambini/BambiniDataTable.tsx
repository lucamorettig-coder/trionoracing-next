"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { certBadgeVariant } from "@/lib/portale-utils";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import type { Bambino } from "@/lib/airtable-portale";

interface BambiniDataTableProps {
  bambini: Bambino[];
  anniIscrizione?: Record<string, string>;
}

export function BambiniDataTable({ bambini, anniIscrizione = {} }: BambiniDataTableProps) {
  const columns: ColumnDef<Bambino>[] = [
    {
      key: "cognome",
      label: "Cognome",
      sortable: true,
      accessor: (r) => r.fields.COGNOME_BAMBINO ?? "",
      cellRenderer: (r) => (
        <span className="font-medium text-ink">{r.fields.COGNOME_BAMBINO}</span>
      ),
    },
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      accessor: (r) => r.fields.NOME_BAMBINO ?? "",
      cellRenderer: (r) => <span className="text-ink">{r.fields.NOME_BAMBINO}</span>,
    },
    {
      key: "nascita",
      label: "Nato/a il",
      sortable: true,
      accessor: (r) => r.fields.DATA_NASCITA_BAMBINO ?? "",
      cellRenderer: (r) => {
        const d = r.fields.DATA_NASCITA_BAMBINO;
        if (!d) return <span className="text-ink-muted">—</span>;
        return (
          <span className="font-mono text-[13px] text-ink-muted">
            {new Date(d).toLocaleDateString("it-IT")}
          </span>
        );
      },
    },
    {
      key: "categoria",
      label: "Categoria FCI",
      sortable: true,
      accessor: (r) => {
        const d = r.fields.DATA_NASCITA_BAMBINO;
        if (!d) return "";
        return calcCategoriaFCI(d) ?? "";
      },
      cellRenderer: (r) => {
        const d = r.fields.DATA_NASCITA_BAMBINO;
        if (!d) return <span className="text-ink-muted">—</span>;
        const cat = calcCategoriaFCI(d);
        return <span className="text-[13px] text-ink-muted">{cat ?? "—"}</span>;
      },
    },
    {
      key: "certificato",
      label: "Certificato",
      sortable: true,
      accessor: (r) => r.fields.CERTIFICATO_MEDICO_STATO ?? "",
      cellRenderer: (r) => {
        const { variant, label } = certBadgeVariant(
          r.fields.CERTIFICATO_MEDICO_STATO,
          r.fields.CERTIFICATO_MEDICO_SCADENZA,
        );
        return (
          <Badge variant={variant} size="sm">
            {label}
          </Badge>
        );
      },
    },
    {
      key: "iscrizione",
      label: "Iscrizione",
      sortable: true,
      accessor: (r) => anniIscrizione[r.id] ?? "",
      align: "center",
      cellRenderer: (r) => {
        const anno = anniIscrizione[r.id];
        if (!anno) return <span className="text-ink-muted">—</span>;
        return <Badge variant="default" size="sm">{anno}</Badge>;
      },
    },
    {
      key: "azioni",
      label: "",
      width: "48px",
      align: "center",
      cellRenderer: (r) => (
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
            <DropdownMenuItem asChild>
              <Link
                href={`/portale/admin/bambini/${r.id}`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
                Vai al dettaglio
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={bambini}
      getRowId={(r) => r.id}
      onRowClick={(r) => {
        window.location.href = `/portale/admin/bambini/${r.id}`;
      }}
      selectable
      pageSize={50}
      initialSortKey="cognome"
      emptyState={
        <p className="text-ink-muted text-sm">
          Nessun bambino trovato con i filtri selezionati.
        </p>
      }
    />
  );
}
