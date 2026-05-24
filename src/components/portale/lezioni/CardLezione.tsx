import Link from "next/link";
import { ArrowRight, Users, UserCheck } from "lucide-react";
import { formatDateIT, tipoSessioneStyle } from "@/lib/portale-utils";
import type { Lezione, Maestro } from "@/lib/airtable-portale";

interface Props {
  lezione: Lezione;
  /** Mappa id → maestro per resolvere co-maestri presenti senza extra round-trip. */
  maestriById?: Record<string, Maestro>;
  href?: string;
}

/**
 * Card riga di una lezione (vista lista mese). Mostra:
 * - data
 * - tile colorato TIPO_SESSIONE (helper centralizzato)
 * - chips ATTIVITA_SVOLTE (max 2 + "+N")
 * - co-maestri (initials, max 3 + "+N")
 * - conteggio bambini
 * - note pubbliche preview (1 riga truncate)
 */
export default function CardLezione({ lezione, maestriById, href }: Props) {
  const f = lezione.fields;
  const tipo = tipoSessioneStyle(f.TIPO_SESSIONE);
  const attivita = f.ATTIVITA_SVOLTE ?? [];
  const attivitaVisible = attivita.slice(0, 2);
  const attivitaExtra = attivita.length - attivitaVisible.length;

  const maestri = (f.MAESTRI_PRESENTI ?? []).map((id) => maestriById?.[id]).filter(Boolean) as Maestro[];
  const maestriVisible = maestri.slice(0, 3);
  const maestriExtra = (f.MAESTRI_PRESENTI?.length ?? 0) - maestriVisible.length;

  const bambiniCount = f.BAMBINI_PRESENTI?.length ?? 0;
  const link = href ?? `/portale/lezioni/${lezione.id}`;

  return (
    <Link
      href={link}
      className="flex gap-4 items-start bg-white border border-line rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] hover:border-navy-200 transition-all"
    >
      <div
        className={`shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-[var(--radius-md)] text-[12px] font-bold uppercase tracking-wide ${tipo.bg} ${tipo.text}`}
        aria-label={f.TIPO_SESSIONE ?? "Tipo lezione"}
      >
        {tipo.shortLabel}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink">
            {f.DATA ? formatDateIT(f.DATA) : "—"}
          </p>
          {bambiniCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <Users className="w-3 h-3" />
              {bambiniCount} {bambiniCount === 1 ? "bambino" : "bambini"}
            </span>
          )}
          {maestri.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <UserCheck className="w-3 h-3" />
              <span className="inline-flex -space-x-1">
                {maestriVisible.map((m) => {
                  const initials = `${m.fields.NOME_MAESTRO?.[0] ?? ""}${m.fields.COGNOME_MAESTRO?.[0] ?? ""}`.toUpperCase();
                  return (
                    <span
                      key={m.id}
                      className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-700 border border-white"
                      title={`${m.fields.NOME_MAESTRO} ${m.fields.COGNOME_MAESTRO}`}
                    >
                      {initials}
                    </span>
                  );
                })}
                {maestriExtra > 0 && (
                  <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-bg-muted text-[10px] font-bold text-ink-muted border border-white">
                    +{maestriExtra}
                  </span>
                )}
              </span>
            </span>
          )}
        </div>

        {attivitaVisible.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {attivitaVisible.map((a) => (
              <span
                key={a}
                className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-semibold bg-bg-muted text-ink-muted"
              >
                {a}
              </span>
            ))}
            {attivitaExtra > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-semibold bg-bg-muted text-ink-muted">
                +{attivitaExtra}
              </span>
            )}
          </div>
        )}

        {f.NOTE_ATTIVITA && (
          <p className="mt-2 text-xs text-ink-muted truncate">{f.NOTE_ATTIVITA}</p>
        )}
      </div>

      <ArrowRight className="w-4 h-4 text-ink-muted shrink-0 mt-1" />
    </Link>
  );
}
