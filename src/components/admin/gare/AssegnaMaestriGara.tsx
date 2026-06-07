"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { assegnaMaestriGaraAction } from "@/app/portale/(portal)/admin/gare/actions";
import type { MaestroLite } from "@/lib/airtable-admin";

interface Props {
  garaId: string;
  maestri: MaestroLite[];
  assignedIds: string[];
}

/**
 * EVO-025: assegnazione maestri inline sulla scheda gara. Chip toggle + Salva,
 * con stato "modifiche non salvate" e feedback. Sostituisce la sezione maestri
 * nel form di modifica.
 */
export default function AssegnaMaestriGara({ garaId, maestri, assignedIds }: Props) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(assignedIds));
  const [saved, setSaved] = React.useState<Set<string>>(new Set(assignedIds));
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const dirty =
    selected.size !== saved.size ||
    [...selected].some((id) => !saved.has(id));

  function toggle(id: string) {
    setOk(false);
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function salva() {
    const ids = [...selected];
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await assegnaMaestriGaraAction(garaId, ids);
      if (res.ok) {
        setSaved(new Set(ids));
        setOk(true);
      } else {
        setError(res.error);
      }
    });
  }

  if (maestri.length === 0) {
    return <p className="text-[13px] text-ink-muted">Nessun maestro attivo disponibile.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {maestri.map((m) => {
          const isSel = selected.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              aria-pressed={isSel}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] transition-colors",
                isSel
                  ? "bg-navy-700 border-navy-700 text-white"
                  : "bg-white border-line text-ink-muted hover:border-navy-700 hover:text-ink",
              )}
            >
              {isSel && <Check size={12} strokeWidth={3} aria-hidden />}
              <span className="font-semibold">
                {m.cognome} {m.nome}
              </span>
              {m.qualifica && (
                <span className={isSel ? "text-white/70 text-[11px]" : "text-ink-muted text-[11px]"}>
                  · {m.qualifica}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={salva}
          disabled={!dirty || pending}
        >
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
          Salva assegnazione
        </Button>
        {ok && !dirty && (
          <span className="text-[13px] text-grass-700 inline-flex items-center gap-1">
            <Check size={14} aria-hidden /> Assegnazione salvata
          </span>
        )}
        {dirty && (
          <span className="text-[12px] text-ink-muted">Modifiche non salvate</span>
        )}
        {error && <span className="text-[13px] text-flag-700">{error}</span>}
      </div>
    </div>
  );
}
