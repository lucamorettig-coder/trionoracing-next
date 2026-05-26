"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Users, UserCheck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CambiaRuoloModal } from "./CambiaRuoloModal";
import { formatDateIT } from "@/lib/portale-utils";
import type { Genitore, Ruolo } from "@/lib/airtable-portale";

interface Props {
  rows: Genitore[];
}

const RUOLO_LABEL: Record<Ruolo, string> = {
  GENITORE: "Genitore",
  ISTRUTTORE: "Maestro",
  ADMIN: "Admin",
};

const RUOLO_VARIANT: Record<Ruolo, BadgeVariant> = {
  GENITORE: "info",
  ISTRUTTORE: "warning",
  ADMIN: "success",
};

export function ruoloBadge(ruolo: Ruolo | undefined) {
  const r: Ruolo = ruolo ?? "GENITORE";
  return (
    <Badge variant={RUOLO_VARIANT[r]} size="sm">
      {RUOLO_LABEL[r]}
    </Badge>
  );
}

export function GenitoriDataTable({ rows }: Props) {
  const router = useRouter();
  const [target, setTarget] = React.useState<Genitore | null>(null);

  const columns: ColumnDef<Genitore>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      accessor: (r) => `${r.fields.COGNOME_GENITORE ?? ""} ${r.fields.NOME_GENITORE ?? ""}`,
      cellRenderer: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink leading-tight">
            {r.fields.COGNOME_GENITORE} {r.fields.NOME_GENITORE}
          </span>
          {r.fields.EMAIL_GENITORE && (
            <a
              href={`mailto:${r.fields.EMAIL_GENITORE}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-ink-muted hover:text-navy-700 hover:underline truncate"
            >
              {r.fields.EMAIL_GENITORE}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "cellulare",
      label: "Cellulare",
      width: "160px",
      accessor: (r) => r.fields.CELLULARE_GENITORE ?? "",
      cellRenderer: (r) =>
        r.fields.CELLULARE_GENITORE ? (
          <a
            href={`tel:${r.fields.CELLULARE_GENITORE}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-navy-700 hover:underline tabular-nums"
          >
            {r.fields.CELLULARE_GENITORE}
          </a>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "ruolo",
      label: "Ruolo",
      width: "140px",
      sortable: true,
      accessor: (r) => r.fields.RUOLO ?? "GENITORE",
      cellRenderer: (r) => ruoloBadge(r.fields.RUOLO),
    },
    {
      key: "figli",
      label: "N° figli",
      width: "100px",
      align: "center",
      sortable: true,
      accessor: (r) => r.fields.TABELLA_BAMBINI?.length ?? 0,
      cellRenderer: (r) => {
        const n = r.fields.TABELLA_BAMBINI?.length ?? 0;
        if (n === 0) return <span className="text-ink-muted">—</span>;
        return (
          <div className="inline-flex items-center gap-1.5 text-sm text-ink">
            <Users size={14} className="text-ink-muted" />
            <span className="font-semibold">{n}</span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Registrato",
      width: "140px",
      sortable: true,
      accessor: (r) => r.fields.CREATED_AT ?? r.createdTime ?? "",
      cellRenderer: (r) => {
        const v = r.fields.CREATED_AT ?? r.createdTime;
        if (!v) return <span className="text-ink-muted">—</span>;
        return <span className="text-sm text-ink-muted tabular-nums">{formatDateIT(v)}</span>;
      },
    },
    {
      key: "azioni",
      label: "",
      width: "60px",
      align: "right",
      cellRenderer: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Azioni"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/portale/admin/genitori/${r.id}`)}>
              Apri dettaglio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTarget(r)}>
              <UserCheck size={14} />
              Cambia ruolo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable<Genitore>
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => router.push(`/portale/admin/genitori/${r.id}`)}
        initialSortKey="nome"
        initialSortDir="asc"
        emptyState={
          <div className="text-center py-12">
            <p className="font-semibold text-ink">Nessun utente trovato</p>
            <p className="text-sm text-ink-muted mt-1">
              Modifica i filtri per ampliare la ricerca.
            </p>
          </div>
        }
      />
      <CambiaRuoloModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        genitore={target}
      />
    </>
  );
}
