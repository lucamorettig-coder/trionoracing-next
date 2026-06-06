"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { ruoloBadge } from "@/components/admin/genitori/GenitoriDataTable";
import { formatDateIT } from "@/lib/portale-utils";
import { cn } from "@/lib/utils";
import type { MigrazioneAdminFilters } from "@/lib/airtable-admin";
import type { Genitore } from "@/lib/airtable-portale";

interface Props {
  utenti: Genitore[];
  initial: MigrazioneAdminFilters;
  total: number;
}

const STATI: { value: "loggato" | "non_loggato"; label: string }[] = [
  { value: "loggato", label: "Con utente Clerk" },
  { value: "non_loggato", label: "Senza utente Clerk" },
];

export function MigrazioneTable({ utenti, initial, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initial.search ?? "");

  // Debounce search → URL. Pattern PagamentiFilters/GenitoriFilters (EVO-018/020):
  // deps su [search], setParam inline non-memoized, cleanup su unmount.
  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStato = (s: "loggato" | "non_loggato") => {
    const params = new URLSearchParams(searchParams.toString());
    if (initial.statoLogin === s) params.delete("stato");
    else params.set("stato", s);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const hasFilters = !!initial.statoLogin || !!initial.search;

  const columns: ColumnDef<Genitore>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      accessor: (r) => r.fields.EMAIL_GENITORE ?? "",
      cellRenderer: (r) =>
        r.fields.EMAIL_GENITORE ? (
          <a
            href={`mailto:${r.fields.EMAIL_GENITORE}`}
            className="text-sm text-navy-700 hover:underline truncate"
          >
            {r.fields.EMAIL_GENITORE}
          </a>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      accessor: (r) => r.fields.NOME_GENITORE ?? "",
      cellRenderer: (r) => (
        <span className="text-sm text-ink">{r.fields.NOME_GENITORE || "—"}</span>
      ),
    },
    {
      key: "cognome",
      label: "Cognome",
      sortable: true,
      accessor: (r) => r.fields.COGNOME_GENITORE ?? "",
      cellRenderer: (r) => (
        <span className="text-sm text-ink">
          {r.fields.COGNOME_GENITORE || "—"}
        </span>
      ),
    },
    {
      key: "ruolo",
      label: "Ruolo",
      width: "120px",
      sortable: true,
      accessor: (r) => r.fields.RUOLO ?? "GENITORE",
      cellRenderer: (r) => ruoloBadge(r.fields.RUOLO),
    },
    {
      key: "dataMigrazione",
      label: "Data migrazione",
      width: "150px",
      sortable: true,
      accessor: (r) => r.fields.DATA_MIGRAZIONE ?? "",
      cellRenderer: (r) =>
        r.fields.DATA_MIGRAZIONE ? (
          <span className="text-sm text-ink-muted tabular-nums">
            {formatDateIT(r.fields.DATA_MIGRAZIONE)}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "statoLogin",
      label: "Stato login",
      width: "150px",
      align: "center",
      accessor: (r) => ((r.fields.AUTH_USER_ID ?? "").length > 0 ? 1 : 0),
      cellRenderer: (r) =>
        (r.fields.AUTH_USER_ID ?? "").length > 0 ? (
          <Badge variant="success" size="sm">
            Clerk creato
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            Mai loggato
          </Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mr-1">
          Stato
        </span>
        {STATI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStato(value)}
            className={cn(
              "h-8 px-3 text-[13px] font-medium border rounded-full transition-colors",
              initial.statoLogin === value
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca email, nome, cognome…"
            className="h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-72"
            aria-label="Cerca"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.replace(pathname);
            }}
            className="h-9 px-3 text-[13px] text-ink-muted hover:text-ink flex items-center gap-1"
          >
            <X size={13} />
            Ripristina
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px] text-ink-muted">
            {total} risultat{total === 1 ? "o" : "i"}
          </span>
          <ExportCSVButton
            entity="migrazione"
            filters={initial as unknown as Record<string, unknown>}
            size="sm"
          />
        </div>
      </div>

      <DataTable<Genitore>
        columns={columns}
        data={utenti}
        getRowId={(r) => r.id}
        initialSortKey="dataMigrazione"
        initialSortDir="desc"
        emptyState={
          <div className="text-center py-12">
            <p className="font-semibold text-ink">Nessun utente migrato</p>
            <p className="text-sm text-ink-muted mt-1">
              La lista si popola dopo l&apos;esecuzione dello script di import.
            </p>
          </div>
        }
      />
    </div>
  );
}
