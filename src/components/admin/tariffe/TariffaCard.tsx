"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TariffaFormDialog } from "./TariffaFormDialog";
import { formatEUR } from "@/lib/portale-utils";
import type { Tariffa } from "@/lib/airtable-admin";

export type QuarterColor = "grass" | "ember" | "sky";

interface Props {
  tariffa: Tariffa;
  quarterColor: QuarterColor;
  iscrizioniCount: number;
}

const QUARTER_LABEL: Record<string, string> = {
  Q1: "Gennaio → Aprile",
  Q2: "Maggio → Agosto",
  Q3: "Settembre → Dicembre",
};

const HEADER_GRADIENTS: Record<QuarterColor, string> = {
  grass: "linear-gradient(135deg, var(--grass-500), var(--grass-600))",
  ember: "linear-gradient(135deg, var(--ember-500), var(--ember-600))",
  sky: "linear-gradient(135deg, var(--sky-500), var(--sky-600))",
};

export function TariffaCard({ tariffa, quarterColor, iscrizioniCount }: Props) {
  const [editOpen, setEditOpen] = React.useState(false);
  const f = tariffa.fields;
  const anno = f.ANNO_ISCRIZIONE ?? "—";
  const quarter = f.NOME_TARIFFA ?? "—";
  const corso = f.TIPO_CORSO ?? "MTB-BDC";
  const titolo = QUARTER_LABEL[quarter] ?? quarter;
  const attiva = !!f.ATTIVA;

  return (
    <>
      <article className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)] overflow-hidden flex flex-col">
        {/* Header colorato gradient + pattern overlay */}
        <div
          className="relative text-white"
          style={{ background: HEADER_GRADIENTS[quarterColor] }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/assets/pattern.svg')",
              backgroundSize: "180px 180px",
              opacity: 0.15,
            }}
          />
          <div className="relative z-[1] px-5 py-4 flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-wide opacity-80 flex items-center gap-2 flex-wrap">
              <span>Quarter {quarter.replace(/^Q/, "")} · {anno}</span>
              <span className="bg-white/20 rounded-full px-2 py-0.5 font-bold">{corso}</span>
            </span>
            <h2 className="text-[22px] font-extrabold leading-tight">{titolo}</h2>
            {f.DESCRIZIONE_TARIFFA && (
              <p className="font-mono text-[12.5px] opacity-85 mt-0.5">
                {f.DESCRIZIONE_TARIFFA}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                  attiva ? "bg-white/20" : "bg-white/10",
                )}
              >
                {attiva ? "✓ Attiva" : "⏱ In preparazione"}
              </span>
              <span className="text-[11.5px] opacity-80">
                {iscrizioniCount} iscrizion{iscrizioniCount === 1 ? "e" : "i"}
              </span>
            </div>
          </div>
        </div>

        {/* Body breakdown */}
        <div className="px-5 py-4 flex flex-col">
          <Row label="Quota totale anno" value={fmt(f.QUOTA_TOTALE_ANNO)} />
          <Row label="Importo iscrizione" value={fmt(f.IMPORTO_ISCRIZIONE)} />
          <Row label="Kit scuola" value={fmt(f.IMPORTO_KIT_SCUOLA)} />
          <Row
            label="Numero rate"
            value={
              <span className="font-mono tabular-nums">{f.NUMERO_RATE ?? "—"}</span>
            }
          />
          <Row label="Importo rata" value={fmt(f.IMPORTO_RATA)} />
          <Row label="Sconto famiglia" value={fmt(f.SCONTO_FAMIGLIA_NUMEROSA)} />
          <p className="text-[11.5px] text-ink-muted italic pt-2 mt-1 border-t border-dashed border-line-soft">
            Scadenze: dal mese di iscrizione, una rata ogni 2 mesi
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-bg-soft border-t border-line flex items-center justify-between">
          <span className="text-[11.5px] text-ink-muted">
            {iscrizioniCount} iscrizion{iscrizioniCount === 1 ? "e collegata" : "i collegate"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil size={14} />
            Modifica
          </Button>
        </div>
      </article>

      {editOpen && (
        <TariffaFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          tariffa={tariffa}
          iscrizioniCount={iscrizioniCount}
        />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line-soft last:border-0">
      <span className="text-[12.5px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-semibold text-ink font-mono tabular-nums">{value}</span>
    </div>
  );
}

function fmt(value: number | undefined): React.ReactNode {
  if (value == null) return "—";
  return formatEUR(value);
}
