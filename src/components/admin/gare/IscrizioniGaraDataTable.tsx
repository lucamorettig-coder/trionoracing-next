"use client";

import * as React from "react";
import { MoreHorizontal, Check, X, Mail } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDataOraIT } from "./gare-helpers";
import { ApprovaIscrizioneGaraModal } from "./ApprovaIscrizioneGaraModal";
import { RifiutaIscrizioneGaraModal } from "./RifiutaIscrizioneGaraModal";
import { BulkApprovaRifiutaModal } from "./BulkApprovaRifiutaModal";
import type { IscrizioneGaraAdminEnriched } from "@/lib/airtable-admin";
import type { StatoIscrizioneGara } from "@/lib/airtable-portale";

interface Props {
  iscrizioni: IscrizioneGaraAdminEnriched[];
  nomeGara: string;
  dataGara: string;
}

const STATO_VARIANT: Record<StatoIscrizioneGara, BadgeVariant> = {
  Richiesta: "warning",
  Confermata: "success",
  Rifiutata: "error",
  Ritirata: "neutral",
};

export function IscrizioniGaraDataTable({ iscrizioni, nomeGara, dataGara }: Props) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [resetKey, setResetKey] = React.useState(0);
  const [singleApprova, setSingleApprova] = React.useState<IscrizioneGaraAdminEnriched | null>(null);
  const [singleRifiuta, setSingleRifiuta] = React.useState<IscrizioneGaraAdminEnriched | null>(null);
  const [bulkVariant, setBulkVariant] = React.useState<"approva" | "rifiuta" | null>(null);

  const byId = React.useMemo(() => {
    const m: Record<string, IscrizioneGaraAdminEnriched> = {};
    for (const i of iscrizioni) m[i.id] = i;
    return m;
  }, [iscrizioni]);

  const selected = selectedIds.map((id) => byId[id]).filter(Boolean);

  const clearSelection = () => {
    setSelectedIds([]);
    setResetKey((k) => k + 1);
  };

  const columns: ColumnDef<IscrizioneGaraAdminEnriched>[] = [
    {
      key: "bambino",
      label: "Bambino",
      sortable: true,
      accessor: (r) => `${r.bambinoCognome} ${r.bambinoNome}`.trim(),
      cellRenderer: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink">
            {r.bambinoCognome} {r.bambinoNome}
          </span>
          {r.categoriaFCI && (
            <span className="text-[11px] text-ink-muted">{r.categoriaFCI}</span>
          )}
        </div>
      ),
    },
    {
      key: "genitore",
      label: "Genitore",
      sortable: true,
      accessor: (r) => `${r.genitoreCognome} ${r.genitoreNome}`.trim(),
      cellRenderer: (r) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-ink">
            {r.genitoreCognome} {r.genitoreNome}
          </span>
          {r.genitoreEmail && (
            <a
              href={`mailto:${r.genitoreEmail}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11.5px] text-navy-700 hover:underline"
            >
              <Mail size={10} aria-hidden />
              {r.genitoreEmail}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "data_richiesta",
      label: "Data richiesta",
      sortable: true,
      accessor: (r) => r.dataRichiesta ?? "",
      cellRenderer: (r) => (
        <span className="font-mono text-[12.5px] text-ink-muted">
          {formatDataOraIT(r.dataRichiesta)}
        </span>
      ),
    },
    {
      key: "stato",
      label: "Stato",
      sortable: true,
      width: "120px",
      accessor: (r) => r.stato,
      cellRenderer: (r) => (
        <Badge variant={STATO_VARIANT[r.stato]} size="sm">
          {r.stato}
        </Badge>
      ),
    },
    {
      key: "note",
      label: "Note genitore",
      accessor: (r) => r.noteGenitore ?? "",
      cellRenderer: (r) =>
        r.noteGenitore ? (
          <span
            className="text-[12.5px] text-ink-muted line-clamp-2 max-w-xs"
            title={r.noteGenitore}
          >
            {r.noteGenitore}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "azioni",
      label: "",
      width: "48px",
      align: "center",
      cellRenderer: (r) => {
        const canApprova = r.stato !== "Confermata";
        const canRifiuta = r.stato !== "Rifiutata";
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
              {canApprova && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setSingleApprova(r);
                  }}
                  className="flex items-center gap-2"
                >
                  <Check size={14} className="text-grass-700" />
                  Approva
                </DropdownMenuItem>
              )}
              {canRifiuta && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setSingleRifiuta(r);
                  }}
                  className="flex items-center gap-2"
                >
                  <X size={14} className="text-flag-500" />
                  Rifiuta
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
        data={iscrizioni}
        getRowId={(r) => r.id}
        selectable
        onSelectionChange={setSelectedIds}
        pageSize={50}
        emptyState={
          <p className="text-ink-muted text-sm">
            Nessuna richiesta di iscrizione per questa gara.
          </p>
        }
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={clearSelection}
        itemLabel="iscrizioni selezionate"
        actions={[
          {
            label: "Approva selezionate",
            onClick: () => setBulkVariant("approva"),
            icon: <Check size={14} />,
          },
          {
            label: "Rifiuta selezionate",
            onClick: () => setBulkVariant("rifiuta"),
            variant: "destructive",
            icon: <X size={14} />,
          },
        ]}
      />

      {singleApprova && (
        <ApprovaIscrizioneGaraModal
          open={!!singleApprova}
          onOpenChange={(open) => !open && setSingleApprova(null)}
          iscrizione={singleApprova}
          nomeGara={nomeGara}
          dataGara={dataGara}
        />
      )}

      {singleRifiuta && (
        <RifiutaIscrizioneGaraModal
          open={!!singleRifiuta}
          onOpenChange={(open) => !open && setSingleRifiuta(null)}
          iscrizione={singleRifiuta}
          nomeGara={nomeGara}
        />
      )}

      {bulkVariant && selected.length > 0 && (
        <BulkApprovaRifiutaModal
          open={bulkVariant !== null}
          onOpenChange={(open) => !open && setBulkVariant(null)}
          iscrizioni={selected}
          variant={bulkVariant}
          nomeGara={nomeGara}
          onSuccess={clearSelection}
        />
      )}
    </>
  );
}
