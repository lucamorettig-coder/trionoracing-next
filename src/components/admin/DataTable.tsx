"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  accessor?: (row: T) => unknown;
  sortable?: boolean;
  cellRenderer?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  initialSortKey?: string;
  initialSortDir?: "asc" | "desc";
}

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function getValue<T>(row: T, col: ColumnDef<T>): unknown {
  if (col.accessor) return col.accessor(row);
  return (row as Record<string, unknown>)[col.key];
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), "it", { numeric: true });
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  pageSize = 50,
  selectable = false,
  onSelectionChange,
  emptyState,
  loading,
  initialSortKey,
  initialSortDir = "asc",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(initialSortKey ?? null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(initialSortDir);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => compare(getValue(a, col), getValue(b, col)) * dir);
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  // Clamp during render — avoids a setState-in-effect cascade if data shrinks.
  const safePage = Math.min(page, totalPages - 1);
  const pageData = React.useMemo(
    () => sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [sortedData, safePage, pageSize],
  );

  const allVisibleIds = pageData.map(getRowId);
  const allSelectedOnPage =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));

  const toggleSort = (col: ColumnDef<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onSelectionChange?.([...next]);
  };

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allSelectedOnPage) {
      allVisibleIds.forEach((id) => next.delete(id));
    } else {
      allVisibleIds.forEach((id) => next.add(id));
    }
    setSelected(next);
    onSelectionChange?.([...next]);
  };

  if (!loading && data.length === 0) {
    return (
      <div className="bg-white border border-line rounded-[var(--radius-lg)] p-12 text-center">
        {emptyState ?? <p className="text-ink-muted">Nessun dato disponibile.</p>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-[var(--radius-lg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white border-b border-line z-10">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={toggleAllOnPage}
                    aria-label="Seleziona tutti"
                    className="rounded border-line accent-navy-700"
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = sortKey === col.key;
                const SortIcon = !active
                  ? ChevronsUpDown
                  : sortDir === "asc"
                    ? ChevronUp
                    : ChevronDown;
                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "px-4 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide",
                      ALIGN_CLASS[col.align ?? "left"],
                      col.headerClassName,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                      >
                        {col.label}
                        <SortIcon size={12} className={active ? "text-navy-700" : "text-ink-muted/60"} />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => {
              const id = getRowId(row);
              const isSelected = selected.has(id);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-line-soft last:border-b-0 transition-colors",
                    isSelected ? "bg-navy-50/60" : "hover:bg-bg-soft",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label="Seleziona riga"
                        className="rounded border-line accent-navy-700"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const content = col.cellRenderer
                      ? col.cellRenderer(row)
                      : (getValue(row, col) as React.ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-ink",
                          ALIGN_CLASS[col.align ?? "left"],
                          col.cellClassName,
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-bg-soft text-xs text-ink-muted">
          <span>
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedData.length)} di {sortedData.length}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-line bg-white hover:bg-bg-muted disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage >= totalPages - 1}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-line bg-white hover:bg-bg-muted disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Successivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
