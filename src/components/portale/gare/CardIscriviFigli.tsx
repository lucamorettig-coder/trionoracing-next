"use client";

import { useState } from "react";
import { Check, Clock, ArrowRight, Info } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import type { Bambino, Gara, IscrizioneGara } from "@/lib/airtable-portale";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import { categoriaCompatibile } from "@/lib/portale-utils";
import { requestIscrizioneGara } from "@/app/portale/(portal)/gare/[id]/actions";
import { statoIscrizioneGaraBadge } from "./gara-utils";

interface Props {
  gara: Gara;
  bambini: Bambino[];
  iscrizioniGenitore: IscrizioneGara[];
}

export default function CardIscriviFigli({ gara, bambini, iscrizioniGenitore }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (bambini.length === 0) {
    return (
      <div className="bg-white border-2 border-navy-700 rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-base font-bold mb-2">Iscrivi i tuoi figli</h2>
        <p className="text-[13px] text-ink-muted">
          Non hai ancora aggiunto figli al portale. Aggiungi un figlio per richiedere l&apos;iscrizione a questa gara.
        </p>
      </div>
    );
  }

  const rows = bambini.map((b) => {
    const iscEsistente = iscrizioniGenitore.find(
      (i) => i.bambinoId === b.id && i.garaId === gara.id && i.stato !== "Rifiutata" && i.stato !== "Ritirata",
    );
    const cat = calcCategoriaFCI(b.fields.DATA_NASCITA_BAMBINO);
    const compat = categoriaCompatibile(gara.classe, cat);
    return { bambino: b, iscEsistente, cat, compat };
  });

  const selezionati = bambini.filter((b) => selected.has(b.id));
  const nomiSelezionati = selezionati.map((b) => b.fields.NOME_BAMBINO);

  let ctaLabel = "Richiedi iscrizione";
  if (nomiSelezionati.length === 1) ctaLabel = `Richiedi iscrizione per ${nomiSelezionati[0]}`;
  else if (nomiSelezionati.length === 2) ctaLabel = `Richiedi per ${nomiSelezionati[0]} e ${nomiSelezionati[1]}`;
  else if (nomiSelezionati.length >= 3) {
    const last = nomiSelezionati[nomiSelezionati.length - 1];
    ctaLabel = `Richiedi per ${nomiSelezionati.slice(0, -1).join(", ")} e ${last}`;
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const action = requestIscrizioneGara.bind(null, gara.id);

  return (
    <div className="bg-white border-2 border-navy-700 rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
      <h2 className="text-base font-bold mb-1.5 inline-flex items-center gap-2">
        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-navy-700 text-white text-[13px] font-mono font-bold">1</span>
        Iscrivi i tuoi figli
      </h2>
      <p className="text-[13px] text-ink-muted mb-3.5 leading-snug">
        Seleziona i figli da iscrivere. La richiesta verrà valutata dalla segreteria entro qualche giorno.
      </p>

      <form action={action} className="space-y-2.5">
        {rows.map(({ bambino, iscEsistente, cat, compat }) => {
          if (iscEsistente) {
            const badge = statoIscrizioneGaraBadge(iscEsistente.stato, bambino.fields.NOME_BAMBINO);
            return (
              <div
                key={bambino.id}
                className="flex items-center gap-3 p-3.5 border-2 rounded-[var(--radius-md)] border-ember-100 bg-ember-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink">
                    {bambino.fields.NOME_BAMBINO} {bambino.fields.COGNOME_BAMBINO}
                  </div>
                  <div className="text-[12px] text-ember-700 font-semibold mt-0.5">
                    Richiesta già inviata · {iscEsistente.stato.toLowerCase()}
                  </div>
                </div>
                <Badge variant={badge.variant} size="sm">
                  <Clock className="w-3 h-3" />
                  {iscEsistente.stato}
                </Badge>
              </div>
            );
          }

          const isSelected = selected.has(bambino.id);
          return (
            <label
              key={bambino.id}
              className={`flex items-center gap-3 p-3.5 border-2 rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                isSelected ? "border-navy-700 bg-navy-50" : "border-line bg-white hover:border-navy-200"
              }`}
            >
              <input
                type="checkbox"
                name="bambino_id"
                value={bambino.id}
                checked={isSelected}
                onChange={() => toggle(bambino.id)}
                className="sr-only"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink">
                  {bambino.fields.NOME_BAMBINO} {bambino.fields.COGNOME_BAMBINO}
                </div>
                <div className="text-[12px] text-ink-muted mt-0.5 inline-flex items-center gap-1.5 flex-wrap">
                  {cat && <span>Categoria FCI: {cat}</span>}
                  {!compat && (
                    <>
                      {cat && <span aria-hidden>·</span>}
                      <span className="inline-flex items-center gap-1 text-ember-700 font-semibold">
                        <Info className="w-3 h-3" />
                        Categoria non compatibile (puoi richiedere comunque)
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? "bg-navy-700 border-navy-700 text-white" : "border-line"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </label>
          );
        })}

        <SubmitButton
          variant="primary"
          size="md"
          disabled={selected.size === 0}
          className="w-full mt-3"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </SubmitButton>
      </form>

      <p className="text-[12px] text-ink-muted mt-3 leading-snug">
        Non c&apos;è nulla da pagare adesso. La quota di iscrizione gara, se prevista, è gestita dalla segreteria.
      </p>
    </div>
  );
}
