"use client";

import { Bike, Mountain, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { corsoLabel, formatEUR } from "@/lib/portale-utils";
import type { TipoCorso } from "@/lib/airtable-portale";
import type { CorsoOption } from "../WizardNuovaIscrizione";
import StepHeader from "../StepHeader";

interface Props {
  step: number;
  total: number;
  anno: number;
  options: CorsoOption[];
  selected: TipoCorso | null;
  onSelect: (corso: TipoCorso) => void;
}

interface CorsoMeta {
  descrizione: string;
  Icon: LucideIcon;
  iconClass: string;
  badges: { variant: "info" | "warning"; label: string }[];
}

const CORSO_META: Record<TipoCorso, CorsoMeta> = {
  "MTB-BDC": {
    descrizione:
      "Strada il martedì e mountain bike il giovedì: la formula completa, due lezioni a settimana.",
    Icon: Bike,
    iconClass: "bg-sky-100 text-sky-700",
    badges: [
      { variant: "info", label: "Martedì · Strada" },
      { variant: "warning", label: "Giovedì · MTB" },
    ],
  },
  "SOLO-MTB": {
    descrizione:
      "Una lezione a settimana, il giovedì: equilibrio, frenata e padronanza del mezzo off-road.",
    Icon: Mountain,
    iconClass: "bg-sun-100 text-sun-700",
    badges: [{ variant: "warning", label: "Giovedì · MTB" }],
  },
};

const QUARTER_PERIODO: Record<"Q1" | "Q2" | "Q3", string> = {
  Q1: "gen–apr",
  Q2: "mag–ago",
  Q3: "set–dic",
};

export default function StepScegliCorso({ step, total, anno, options, selected, onSelect }: Props) {
  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="Scegli il corso"
        description="Due formule: il corso completo con due lezioni a settimana, oppure solo la mountain bike del giovedì. Nello step successivo vedrai il dettaglio della quota."
      />

      <div className="flex flex-col gap-3.5" role="radiogroup" aria-label="Scegli il corso">
        {options.map((opt) => {
          const meta = CORSO_META[opt.corso];
          const { label } = corsoLabel(opt.corso);
          const isSelected = selected === opt.corso;
          const Icon = meta.Icon;
          const disabled = !opt.disponibile || opt.quotaQuarterCorrente == null;
          const prezzo = opt.quotaQuarterCorrente != null ? formatEUR(opt.quotaQuarterCorrente) : null;

          return (
            <button
              key={opt.corso}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(opt.corso)}
              className={[
                "w-full text-left rounded-[var(--radius-xl)] border-2 bg-white shadow-[var(--shadow-xs)] p-5 transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2",
                disabled
                  ? "opacity-50 pointer-events-none border-line"
                  : isSelected
                    ? "border-navy-700 bg-navy-50/40"
                    : "border-line hover:border-navy-300 hover:shadow-[var(--shadow-sm)]",
              ].join(" ")}
            >
              {/* Riga 1: icona corso + nome + radio indicator */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${meta.iconClass}`}
                  aria-hidden
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </span>
                <span className="text-lg font-bold text-ink flex-1 min-w-0">{label}</span>
                <span
                  aria-hidden
                  className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-navy-700" : "border-line"
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-navy-700" />}
                </span>
              </div>

              {/* Riga 2: descrizione */}
              <p className="mt-2.5 mb-3 text-sm text-ink-muted">{meta.descrizione}</p>

              {/* Riga 3: badge giorni + prezzo (quota quarter corrente) */}
              <div className="flex items-center gap-2 flex-wrap">
                {meta.badges.map((b) => (
                  <Badge key={b.label} variant={b.variant} size="sm">
                    {b.label}
                  </Badge>
                ))}
                {prezzo && (
                  <span className="ml-auto font-bold text-ink whitespace-nowrap">
                    {prezzo}{" "}
                    <span className="text-ink-muted font-medium text-xs">per te</span>
                  </span>
                )}
                {prezzo ? (
                  <span className="w-full text-right text-[11.5px] text-ink-muted mt-0.5">
                    Quota per chi si iscrive ora ({QUARTER_PERIODO[opt.quarter]})
                    {opt.quotaAnnoIntero != null &&
                      opt.quotaAnnoIntero !== opt.quotaQuarterCorrente && (
                        <> · anno intero: {formatEUR(opt.quotaAnnoIntero)}</>
                      )}
                  </span>
                ) : (
                  <span className="w-full text-right text-[11.5px] text-ember-700 mt-0.5">
                    Non disponibile per l&apos;anno {anno}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
