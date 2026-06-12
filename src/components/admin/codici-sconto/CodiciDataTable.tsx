"use client";

import * as React from "react";
import { Pencil, Power, PowerOff, Trash2, AlertTriangle, TicketPercent } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { CodiceFormDialog } from "./CodiceFormDialog";
import { formatEUR } from "@/lib/portale-utils";
import type { CodiceSconto } from "@/lib/codici-sconto";
import {
  toggleAttivoCodiceScontoAction,
  deleteCodiceScontoAction,
} from "@/app/portale/(portal)/admin/codici-sconto/actions";

function fmtData(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

type StatoCodice = { label: string; cls: string };

function statoCodice(c: CodiceSconto, attivo: boolean, oggi: string): StatoCodice {
  if (!attivo) return { label: "Disattivato", cls: "bg-bg-muted text-ink-muted" };
  if (c.fields.VALIDO_DA && oggi < c.fields.VALIDO_DA) {
    return { label: "Non ancora attivo", cls: "bg-sky-50 text-sky-700" };
  }
  if (c.fields.VALIDO_A && oggi > c.fields.VALIDO_A) {
    return { label: "Scaduto", cls: "bg-ember-50 text-ember-700" };
  }
  return { label: "Attivo", cls: "bg-grass-50 text-grass-700" };
}

export function CodiciDataTable({ codici }: { codici: CodiceSconto[] }) {
  const oggi = new Date().toISOString().slice(0, 10);

  const [editing, setEditing] = React.useState<CodiceSconto | null>(null);
  const [deleting, setDeleting] = React.useState<CodiceSconto | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [bannerError, setBannerError] = React.useState<string | null>(null);

  const attivoOf = (c: CodiceSconto) => overrides[c.id] ?? c.fields.ATTIVO ?? false;

  async function handleToggle(c: CodiceSconto) {
    const current = attivoOf(c);
    const next = !current;
    setBannerError(null);
    setOverrides((o) => ({ ...o, [c.id]: next }));
    setTogglingId(c.id);
    const res = await toggleAttivoCodiceScontoAction(c.id, next);
    setTogglingId(null);
    if (!res.ok) {
      setOverrides((o) => ({ ...o, [c.id]: current }));
      setBannerError(res.error);
    }
  }

  const columns: ColumnDef<CodiceSconto>[] = [
    {
      key: "CODICE",
      label: "Codice",
      sortable: true,
      accessor: (c) => c.fields.CODICE ?? "",
      cellRenderer: (c) => (
        <span className="font-mono font-semibold text-ink tracking-wide">{c.fields.CODICE}</span>
      ),
    },
    {
      key: "IMPORTO",
      label: "Sconto",
      sortable: true,
      align: "right",
      accessor: (c) => c.fields.IMPORTO ?? 0,
      cellRenderer: (c) => (
        <span className="font-semibold text-grass-700 tabular-nums">
          −{formatEUR(c.fields.IMPORTO ?? 0)}
        </span>
      ),
    },
    {
      key: "validita",
      label: "Validità",
      accessor: (c) => c.fields.VALIDO_DA ?? "",
      cellRenderer: (c) => (
        <span className="text-[13px] text-ink-muted whitespace-nowrap">
          {fmtData(c.fields.VALIDO_DA)} → {fmtData(c.fields.VALIDO_A)}
        </span>
      ),
    },
    {
      key: "stato",
      label: "Stato",
      cellRenderer: (c) => {
        const s = statoCodice(c, attivoOf(c), oggi);
        return (
          <span
            className={`inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[11.5px] font-semibold ${s.cls}`}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: "descrizione",
      label: "Descrizione",
      accessor: (c) => c.fields.DESCRIZIONE ?? "",
      cellRenderer: (c) => (
        <span className="text-[13px] text-ink-muted">{c.fields.DESCRIZIONE || "—"}</span>
      ),
    },
    {
      key: "azioni",
      label: "",
      width: "140px",
      align: "right",
      cellRenderer: (c) => {
        const attivo = attivoOf(c);
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleToggle(c)}
              disabled={togglingId === c.id}
              title={attivo ? "Disattiva" : "Attiva"}
              aria-label={attivo ? "Disattiva codice" : "Attiva codice"}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors disabled:opacity-40 ${
                attivo
                  ? "border-grass-200 text-grass-700 hover:bg-grass-50"
                  : "border-line text-ink-muted hover:bg-bg-muted"
              }`}
            >
              {attivo ? <Power size={15} /> : <PowerOff size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setEditing(c)}
              title="Modifica"
              aria-label="Modifica codice"
              className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-line text-ink-muted hover:text-navy-700 hover:bg-bg-muted transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleting(c);
              }}
              title="Elimina"
              aria-label="Elimina codice"
              className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-line text-ink-muted hover:text-flag-700 hover:bg-flag-50 hover:border-flag-200 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {bannerError && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-flag-50 border border-flag-200 px-4 py-3 text-[13px] text-flag-700 flex items-center gap-2">
          <AlertTriangle size={16} aria-hidden /> {bannerError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={codici}
        getRowId={(c) => c.id}
        initialSortKey="CODICE"
        emptyState={
          <div className="py-12 text-center">
            <TicketPercent size={28} className="mx-auto text-ink-muted mb-2" aria-hidden />
            <p className="text-[13px] text-ink-muted">
              Nessun codice sconto. Creane uno con &quot;Nuovo codice&quot;.
            </p>
          </div>
        }
      />

      {editing && (
        <CodiceFormDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          codice={editing}
        />
      )}

      {deleting && (
        <AdminFormDialog
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          title="Eliminare il codice?"
          description={`"${deleting.fields.CODICE}" — l'azione è irreversibile.`}
          icon={<Trash2 size={18} />}
          iconTone="flag"
          size="sm"
          submitLabel="Elimina"
          submitVariant="destructive"
          onSubmit={async () => {
            setDeleteError(null);
            const res = await deleteCodiceScontoAction(deleting.id);
            if (!res.ok) {
              setDeleteError(res.error);
              throw new Error(res.error);
            }
            setDeleting(null);
          }}
        >
          {deleteError && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] bg-flag-50 border border-flag-200 px-3 py-2.5 text-[12.5px] text-flag-700 flex items-start gap-2"
            >
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}
          <p className="text-[13px] text-ink-muted">
            Lo storico dei pagamenti che hanno usato questo codice resta intatto (il codice è
            registrato come testo sui titoli).
          </p>
        </AdminFormDialog>
      )}
    </>
  );
}
