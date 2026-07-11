"use client";

import * as React from "react";
import { Pencil, Power, PowerOff, Trash2, AlertTriangle, Megaphone } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { ComunicazioneFormDialog } from "./ComunicazioneFormDialog";
import type { ComunicazioneHeroAdmin } from "@/lib/airtable-admin";
import {
  toggleAttivaComunicazioneAction,
  deleteComunicazioneAction,
} from "@/app/portale/(portal)/admin/comunicazioni/actions";

function fmtData(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

type StatoComunicazione = { label: string; cls: string };

/** Attiva / Programmata / Scaduta / Disattivata — pattern statoCodice (EVO-028). */
function statoComunicazione(
  c: ComunicazioneHeroAdmin,
  attiva: boolean,
  oggi: string,
): StatoComunicazione {
  if (!attiva) return { label: "Disattivata", cls: "bg-bg-muted text-ink-muted" };
  if (c.fields.VALIDO_DA && oggi < c.fields.VALIDO_DA) {
    return { label: "Programmata", cls: "bg-sky-50 text-sky-700" };
  }
  if (c.fields.VALIDO_A && oggi > c.fields.VALIDO_A) {
    return { label: "Scaduta", cls: "bg-ember-50 text-ember-700" };
  }
  return { label: "Attiva", cls: "bg-grass-50 text-grass-700" };
}

export function ComunicazioniDataTable({
  comunicazioni,
}: {
  comunicazioni: ComunicazioneHeroAdmin[];
}) {
  const oggi = new Date().toISOString().slice(0, 10);

  const [editing, setEditing] = React.useState<ComunicazioneHeroAdmin | null>(null);
  const [deleting, setDeleting] = React.useState<ComunicazioneHeroAdmin | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [bannerError, setBannerError] = React.useState<string | null>(null);

  const attivaOf = (c: ComunicazioneHeroAdmin) => overrides[c.id] ?? c.fields.ATTIVA ?? false;

  async function handleToggle(c: ComunicazioneHeroAdmin) {
    const current = attivaOf(c);
    const next = !current;
    setBannerError(null);
    setOverrides((o) => ({ ...o, [c.id]: next }));
    setTogglingId(c.id);
    const res = await toggleAttivaComunicazioneAction(c.id, next);
    setTogglingId(null);
    if (!res.ok) {
      setOverrides((o) => ({ ...o, [c.id]: current }));
      setBannerError(res.error);
    }
  }

  const columns: ColumnDef<ComunicazioneHeroAdmin>[] = [
    {
      key: "NOME",
      label: "Nome",
      sortable: true,
      accessor: (c) => c.fields.NOME ?? "",
      cellRenderer: (c) => (
        <div>
          <span className="font-semibold text-ink">{c.fields.NOME}</span>
          {c.fields.TITOLO && (
            <span className="block text-[12px] text-ink-muted truncate max-w-[240px]">
              {c.fields.TITOLO.replace(/\*\*/g, "")}
            </span>
          )}
        </div>
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
      key: "PRIORITA",
      label: "Priorità",
      sortable: true,
      align: "right",
      accessor: (c) => c.fields.PRIORITA ?? 0,
      cellRenderer: (c) => (
        <span className="font-mono text-[13px] text-ink-muted tabular-nums">
          {c.fields.PRIORITA ?? 0}
        </span>
      ),
    },
    {
      key: "stato",
      label: "Stato",
      cellRenderer: (c) => {
        const s = statoComunicazione(c, attivaOf(c), oggi);
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
      key: "azioni",
      label: "",
      width: "140px",
      align: "right",
      cellRenderer: (c) => {
        const attiva = attivaOf(c);
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleToggle(c)}
              disabled={togglingId === c.id}
              title={attiva ? "Disattiva" : "Attiva"}
              aria-label={attiva ? "Disattiva comunicazione" : "Attiva comunicazione"}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors disabled:opacity-40 ${
                attiva
                  ? "border-grass-200 text-grass-700 hover:bg-grass-50"
                  : "border-line text-ink-muted hover:bg-bg-muted"
              }`}
            >
              {attiva ? <Power size={15} /> : <PowerOff size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setEditing(c)}
              title="Modifica"
              aria-label="Modifica comunicazione"
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
              aria-label="Elimina comunicazione"
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
        data={comunicazioni}
        getRowId={(c) => c.id}
        initialSortKey="PRIORITA"
        emptyState={
          <div className="py-12 text-center">
            <Megaphone size={28} className="mx-auto text-ink-muted mb-2" aria-hidden />
            <p className="text-[13px] text-ink-muted">
              Nessuna comunicazione. Creane una con &quot;Nuova comunicazione&quot;.
            </p>
          </div>
        }
      />

      {editing && (
        <ComunicazioneFormDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          comunicazione={editing}
        />
      )}

      {deleting && (
        <AdminFormDialog
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          title="Eliminare la comunicazione?"
          description={`"${deleting.fields.NOME}" — l'azione è irreversibile.`}
          icon={<Trash2 size={18} />}
          iconTone="flag"
          size="sm"
          submitLabel="Elimina"
          submitVariant="destructive"
          onSubmit={async () => {
            setDeleteError(null);
            const res = await deleteComunicazioneAction(deleting.id);
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
            La comunicazione smetterà subito di comparire nella rotazione della hero.
          </p>
        </AdminFormDialog>
      )}
    </>
  );
}
