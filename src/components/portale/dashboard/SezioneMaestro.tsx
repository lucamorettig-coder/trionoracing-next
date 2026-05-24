import Link from "next/link";
import { Plus, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardLezione from "@/components/portale/lezioni/CardLezione";
import CardGaraAssegnata from "@/components/portale/lezioni/CardGaraAssegnata";
import type { Gara, Lezione, Maestro } from "@/lib/airtable-portale";

interface Props {
  maestro: Maestro;
  lezioniMese: Lezione[];
  lezioniRecenti: Lezione[];
  gareFuture: Gara[];
  maestriById: Record<string, Maestro>;
}

/**
 * Blocco "Come Maestro" della dashboard ruolo-aware (M-1 EVO-006).
 * Mostrato per utenti ISTRUTTORE (e ADMIN+ISTRUTTORE dual ruolo derivato dai dati).
 */
export default function SezioneMaestro({
  maestro,
  lezioniMese,
  lezioniRecenti,
  gareFuture,
  maestriById,
}: Props) {
  const f = maestro.fields;
  const nome = f.NOME_MAESTRO;
  const qualifica = f.QUALIFICA;
  const discipline = (f.DISCIPLINE ?? []).join(" · ");
  const lezioniMeseCount = lezioniMese.length;
  const gareCount = gareFuture.length;
  const gareVisible = gareFuture.slice(0, 3);
  const lezioniVisible = lezioniRecenti.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero "Come Maestro" */}
      <section className="photo-bg-navy text-white rounded-[var(--radius-xl)] overflow-hidden">
        <div className="relative px-6 lg:px-10 py-8 lg:py-10">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">
            Come Maestro
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Ciao {nome}
            {qualifica ? `, ${qualifica}` : ""}
          </h2>
          <p className="text-white/80 text-sm">
            {lezioniMeseCount} {lezioniMeseCount === 1 ? "lezione" : "lezioni"} questo mese
            {gareCount > 0 && (
              <>
                <span className="mx-2 text-white/40" aria-hidden>·</span>
                {gareCount} {gareCount === 1 ? "gara" : "gare"} in programma
              </>
            )}
          </p>
          {discipline && (
            <p className="text-white/60 text-xs mt-1.5 uppercase tracking-wide font-mono">
              {discipline}
            </p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/portale/lezioni/nuova"
            className="flex items-center gap-3 bg-navy-700 text-white rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:bg-navy-900 transition-colors shadow-[var(--shadow-sm)]"
          >
            <Plus className="w-5 h-5 shrink-0" />
            Nuova lezione
          </Link>
          <Link
            href="/portale/lezioni"
            className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
          >
            <BookOpen className="w-5 h-5 shrink-0 text-ink-muted" />
            Le mie lezioni
          </Link>
          <Link
            href="/portale/gare-assegnate"
            className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
          >
            <Trophy className="w-5 h-5 shrink-0 text-ink-muted" />
            Gare assegnate
            {gareCount > 0 && (
              <span className="ml-auto text-[11px] font-mono uppercase text-ink-muted">
                {gareCount}
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* Gare in programma */}
      {gareVisible.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink inline-flex items-center gap-2">
              <Trophy className="w-5 h-5 text-navy-700" />
              Le mie prossime gare
            </h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/portale/gare-assegnate">Vedi tutte</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {gareVisible.map((g) => (
              <CardGaraAssegnata key={g.id} gara={g} />
            ))}
          </div>
        </section>
      )}

      {/* Storico recente */}
      {lezioniVisible.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink inline-flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-navy-700" />
              Storico recente
            </h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/portale/lezioni">Vedi tutte</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {lezioniVisible.map((l) => (
              <CardLezione key={l.id} lezione={l} maestriById={maestriById} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
