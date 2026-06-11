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
import { ModulisticaIcons, getModulisticaState } from "./ModulisticaIcons";
import { statoIscrizioneAdminBadge } from "@/lib/admin-utils";
import { formatEUR, corsoLabel, corsoBadgeVariant } from "@/lib/portale-utils";
import type { Iscrizione } from "@/lib/airtable-portale";

interface IscrizioniDataTableProps {
  iscrizioni: Iscrizione[];
}

export function IscrizioniDataTable({ iscrizioni }: IscrizioniDataTableProps) {
  const columns: ColumnDef<Iscrizione>[] = [
    {
      key: "bambino",
      label: "Bambino",
      sortable: true,
      accessor: (r) => `${r.fields.COGNOME_BAMBINO ?? ""} ${r.fields.NOME_BAMBINO ?? ""}`.trim(),
      cellRenderer: (r) => (
        <span className="font-medium text-ink">
          {r.fields.COGNOME_BAMBINO} {r.fields.NOME_BAMBINO}
        </span>
      ),
    },
    {
      key: "genitore",
      label: "Genitore",
      sortable: true,
      accessor: (r) => `${r.fields.COGNOME_GENITORE ?? ""} ${r.fields.NOME_GENITORE ?? ""}`.trim(),
      cellRenderer: (r) => (
        <span className="text-ink-muted text-[13px]">
          {r.fields.COGNOME_GENITORE} {r.fields.NOME_GENITORE}
        </span>
      ),
    },
    {
      key: "corso",
      label: "Corso",
      sortable: true,
      accessor: (r) => r.fields.CORSO ?? "",
      cellRenderer: (r) => {
        const corso = r.fields.CORSO;
        if (!corso) return <span className="text-ink-muted">—</span>;
        return (
          <Badge variant={corsoBadgeVariant(corso)} size="sm">
            {corsoLabel(corso).short}
          </Badge>
        );
      },
    },
    {
      key: "anno",
      label: "Anno",
      sortable: true,
      accessor: (r) => r.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "",
      cellRenderer: (r) => (
        <span className="font-mono text-[13px] text-ink-muted">
          {r.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "—"}
        </span>
      ),
    },
    {
      key: "stato",
      label: "Stato",
      sortable: true,
      accessor: (r) => statoIscrizioneAdminBadge(r).label,
      cellRenderer: (r) => {
        const { label, variant } = statoIscrizioneAdminBadge(r);
        return <Badge variant={variant} size="sm">{label}</Badge>;
      },
    },
    {
      key: "modulistica",
      label: "Modulistica",
      cellRenderer: (r) => (
        <ModulisticaIcons {...getModulisticaState(r.fields)} size="xs" />
      ),
    },
    {
      key: "importo",
      label: "Importo",
      sortable: true,
      align: "right",
      accessor: (r) => r.fields.IMPORTO_FINALE_ANNUO ?? 0,
      cellRenderer: (r) => (
        <span className="font-mono text-[13px]">
          {r.fields.IMPORTO_FINALE_ANNUO != null ? formatEUR(r.fields.IMPORTO_FINALE_ANNUO) : "—"}
        </span>
      ),
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
                href={`/portale/admin/iscrizioni/${r.id}`}
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
      data={iscrizioni}
      getRowId={(r) => r.id}
      onRowClick={(r) => {
        window.location.href = `/portale/admin/iscrizioni/${r.id}`;
      }}
      selectable
      pageSize={50}
      initialSortKey="bambino"
      emptyState={
        <p className="text-ink-muted text-sm">
          Nessuna iscrizione trovata con i filtri selezionati.
        </p>
      }
    />
  );
}
