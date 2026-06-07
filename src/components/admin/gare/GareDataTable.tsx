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
import { toggleInEvidenzaAction } from "@/app/portale/(portal)/admin/gare/actions";
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
  const [, startTransition] = React.useTransition();
  // Override ottimistici inEvidenza per id (rollback su errore action).
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
  const [errore, setErrore] = React.useState<string | null>(null);

  const isInEvidenza = (r: GaraWithCounter) =>
    overrides[r.id] ?? r.inEvidenza ?? false;

  function handleToggleEvidenza(r: GaraWithCounter) {
    const prev = isInEvidenza(r);
    const next = !prev;
    setErrore(null);
    setOverrides((o) => ({ ...o, [r.id]: next })); // ottimistico
    startTransition(async () => {
      const res = await toggleInEvidenzaAction(r.id, next);
      if (!res.ok) {
        // rollback
        setOverrides((o) => ({ ...o, [r.id]: prev }));
        setErrore("Impossibile aggiornare l'evidenza. Riprova.");
      }
    });
  }

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
      label: "In evidenza",
      width: "96px",
      align: "center",
      accessor: (r) => (isInEvidenza(r) ? 1 : 0),
      cellRenderer: (r) => {
        const on = isInEvidenza(r);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleEvidenza(r);
            }}
            aria-pressed={on}
            aria-label={on ? "Togli evidenza" : "Metti in evidenza"}
            className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] hover:bg-bg-muted transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-700/20"
          >
            <Star
              size={16}
              className={on ? "text-sun-500 fill-sun-500" : "text-ink-muted"}
            />
          </button>
        );
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
    <>
      {errore && (
        <div
          role="alert"
          className="mb-3 rounded-[var(--radius-md)] bg-flag-50 border border-flag-200 px-4 py-2.5 text-[13px] text-flag-700"
        >
          {errore}
        </div>
      )}
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
    </>
  );
}
