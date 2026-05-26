"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Star, Users, ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TipoGaraTile, formatDataGara } from "./gare-helpers";
import type { Gara } from "@/lib/airtable-portale";

interface Props {
  gare: GaraWithCounter[];
  toggle: "future" | "passate";
}

export interface GaraWithCounter extends Gara {
  numIscrizioni: number;
}

export function GareDataTable({ gare, toggle }: Props) {
  const router = useRouter();

  const columns: ColumnDef<GaraWithCounter>[] = [
    {
      key: "data",
      label: "Data",
      sortable: true,
      width: "110px",
      accessor: (r) => r.data,
      cellRenderer: (r) => {
        const { primary, weekday } = formatDataGara(r.data);
        return (
          <div className="flex flex-col">
            <span className="font-mono text-[12.5px] text-ink font-semibold tabular-nums">
              {primary}
            </span>
            {weekday && (
              <span className="font-mono text-[10.5px] text-ink-muted uppercase">
                {weekday}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "tipo",
      label: "Tipo",
      width: "110px",
      accessor: (r) => r.tipoGara ?? "",
      cellRenderer: (r) => <TipoGaraTile tipo={r.tipoGara} />,
    },
    {
      key: "nome",
      label: "Nome gara",
      sortable: true,
      accessor: (r) => r.nomeGara,
      cellRenderer: (r) => (
        <span className="font-semibold text-ink line-clamp-2">{r.nomeGara}</span>
      ),
    },
    {
      key: "luogo",
      label: "Luogo",
      sortable: true,
      accessor: (r) => r.luogo,
      cellRenderer: (r) => (
        <span className="text-[13px] text-ink-muted">{r.luogo || "—"}</span>
      ),
    },
    {
      key: "classe",
      label: "Classe",
      width: "150px",
      accessor: (r) => r.classe ?? "",
      cellRenderer: (r) =>
        r.classe ? (
          <Badge variant="neutral" size="sm">{r.classe}</Badge>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "iscrizioni",
      label: "Iscrizioni",
      width: "110px",
      align: "center",
      sortable: true,
      accessor: (r) => r.numIscrizioni,
      cellRenderer: (r) => (
        <span
          className={
            r.numIscrizioni > 0
              ? "inline-flex items-center gap-1 text-grass-700 font-semibold text-[13px]"
              : "text-ink-muted text-[13px]"
          }
        >
          <Users size={13} aria-hidden />
          {r.numIscrizioni}
        </span>
      ),
    },
    {
      key: "in_evidenza",
      label: "★",
      width: "48px",
      align: "center",
      accessor: (r) => (r.inEvidenza ? 1 : 0),
      cellRenderer: (r) =>
        r.inEvidenza ? (
          <Star size={16} className="text-sun-500 fill-sun-500 inline" />
        ) : (
          <span className="text-ink-muted text-[12px]">—</span>
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
            <DropdownMenuItem
              onSelect={() => router.push(`/portale/admin/gare/${r.id}`)}
              className="flex items-center gap-2"
            >
              <ExternalLink size={14} />
              Apri
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push(`/portale/admin/gare/${r.id}/modifica`)}
              className="flex items-center gap-2"
            >
              <Pencil size={14} />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push(`/portale/admin/gare/${r.id}/iscrizioni`)}
              className="flex items-center gap-2"
            >
              <Users size={14} />
              Iscrizioni ({r.numIscrizioni})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={gare}
      getRowId={(r) => r.id}
      pageSize={50}
      initialSortKey="data"
      initialSortDir={toggle === "future" ? "asc" : "desc"}
      onRowClick={(r) => router.push(`/portale/admin/gare/${r.id}`)}
      emptyState={
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-ink-muted text-sm">
            {toggle === "future"
              ? "Nessuna gara futura nel calendario."
              : "Nessuna gara passata."}
          </p>
          <p className="text-ink-muted text-xs max-w-md">
            Le gare arrivano normalmente dal database. Puoi aggiungerne una manualmente per casi eccezionali.
          </p>
        </div>
      }
    />
  );
}
