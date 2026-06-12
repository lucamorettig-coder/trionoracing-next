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

// EVO-027: token corretti `--color-*` (i precedenti `--grass-500` ecc. non esistevano
// in Tailwind v4 → gradient vuoto = header "slavato"). Gradient profondo 500→700.
const HEADER_GRADIENTS: Record<QuarterColor, string> = {
  grass: "linear-gradient(135deg, var(--color-grass-500), var(--color-grass-700))",
  ember: "linear-gradient(135deg, var(--color-ember-500), var(--color-ember-700))",
  sky: "linear-gradient(135deg, var(--color-sky-500), var(--color-sky-700))",
};

const CHIP_TEXT: Record<QuarterColor, string> = {
  grass: "var(--color-grass-700)",
  ember: "var(--color-ember-700)",
  sky: "var(--color-sky-700)",
};

export function TariffaCard({ tariffa, quarterColor, iscrizioniCount }: Props) {
  const [editOpen, setEditOpen] = React.useState(false);
  const f = tariffa.fields;
  const anno = f.ANNO_ISCRIZIONE ?? "—";
  const quarter = f.NOME_TARIFFA ?? "—";
  const corso = f.TIPO_CORSO ?? "MTB-BDC";
  const titolo = QUARTER_LABEL[quarter] ?? quarter;
  const quarterNum = quarter.replace(/^Q/, "");
  const attiva = !!f.ATTIVA;

  return (
    <>
      <article className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)] overflow-hidden flex flex-col">
        {/* Header colorato — restyle EVO-027 (token --color-* corretti, gradient 500→700) */}
        <div
          className="relative text-white overflow-hidden"
          style={{ background: HEADER_GRADIENTS[quarterColor] }}
        >
          {/* Numero trimestre in filigrana */}
          <span
            aria-hidden
            className="absolute -right-1 -top-5 text-[78px] font-extrabold leading-none tracking-tighter text-white/[0.13] select-none pointer-events-none"
          >
            {quarterNum}
          </span>

          <div className="relative z-[1] px-5 py-4">
            {/* Top: chip trimestre + stato */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center justify-center bg-white rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-extrabold leading-none"
                style={{ color: CHIP_TEXT[quarterColor] }}
              >
                {quarter}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                  attiva ? "bg-white/20" : "bg-white/[0.12]",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full inline-block",
                    attiva ? "bg-white" : "bg-white/50",
                  )}
                />
                {attiva ? "Attiva" : "In preparazione"}
              </span>
            </div>

            {/* Titolo-eroe: periodo */}
            <h2 className="text-[21px] font-extrabold leading-tight mt-2.5 tracking-[-0.01em]">
              {titolo}
            </h2>

            {/* Meta line: anno · corso · iscrizioni */}
            <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[12.5px]">
              <span className="font-semibold">{anno}</span>
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-[11.5px] font-bold">
                {corso}
              </span>
              <span className="opacity-90">
                · {iscrizioniCount} iscrizion{iscrizioniCount === 1 ? "e" : "i"}
              </span>
            </div>

            {f.DESCRIZIONE_TARIFFA && (
              <p className="text-[12px] text-white/85 mt-2 leading-snug">
                {f.DESCRIZIONE_TARIFFA}
              </p>
            )}
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
