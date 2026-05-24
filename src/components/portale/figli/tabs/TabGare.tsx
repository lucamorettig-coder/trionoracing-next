import Link from "next/link";
import { Trophy, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bambino, Gara, IscrizioneGara } from "@/lib/airtable-portale";
import { formatDateIT, categoriaCompatibile } from "@/lib/portale-utils";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import CardGara from "@/components/portale/gare/CardGara";
import { statoIscrizioneGaraBadge } from "@/components/portale/gare/gara-utils";

interface Props {
  bambino: Bambino;
  iscrizioniGara: IscrizioneGara[];
  gareFuture: Gara[];
}

/**
 * Tab "Gare" della scheda figlio.
 * - Sezione 1 "Le sue gare": iscrizioni gara del bambino (stati attivi: Richiesta/Confermata).
 * - Sezione 2 "Gare disponibili": gare future non ancora richieste dal bambino,
 *   compatibili per categoria FCI. Riusa CardGara passando un array con solo
 *   questo bambino per i badge per-figlio.
 */
export default function TabGare({ bambino, iscrizioniGara, gareFuture }: Props) {
  const garaById = Object.fromEntries(gareFuture.map((g) => [g.id, g]));

  const sue = iscrizioniGara.filter(
    (i) => i.bambinoId === bambino.id && i.stato !== "Rifiutata" && i.stato !== "Ritirata",
  );
  const sueAttive = sue.filter((i) => garaById[i.garaId]);

  const cat = calcCategoriaFCI(bambino.fields.DATA_NASCITA_BAMBINO);

  const idsGiaRichieste = new Set(sue.map((i) => i.garaId));
  const disponibili = gareFuture.filter(
    (g) => !idsGiaRichieste.has(g.id) && categoriaCompatibile(g.classe, cat),
  );

  if (sueAttive.length === 0 && disponibili.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="text-center py-16 bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-50 mb-4">
            <Trophy className="w-7 h-7 text-navy-700" />
          </div>
          <p className="text-ink font-semibold mb-1">Nessuna gara richiesta</p>
          <p className="text-ink-muted text-sm mb-5">
            Non ci sono gare richieste per {bambino.fields.NOME_BAMBINO}. Vedi il calendario per i prossimi eventi.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/portale/gare">Vedi calendario gare</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {sueAttive.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-ink mb-3.5">
            Le sue gare · {sueAttive.length}
          </h3>
          <div className="space-y-2.5">
            {sueAttive.map((isc) => {
              const gara = garaById[isc.garaId]!;
              const badge = statoIscrizioneGaraBadge(isc.stato, bambino.fields.NOME_BAMBINO);
              return (
                <Link
                  key={isc.id}
                  href={`/portale/gare/${gara.id}`}
                  className="flex items-center gap-3 p-4 bg-white border border-line rounded-[var(--radius-md)] hover:border-navy-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink truncate">{gara.nomeGara}</div>
                    <div className="text-[12.5px] text-ink-muted mt-0.5 inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {gara.luogo}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{formatDateIT(gara.data)}</span>
                    </div>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {disponibili.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-ink mb-1">Gare disponibili</h3>
          <p className="text-[13px] text-ink-muted mb-3.5">
            Gare future {cat ? `compatibili con la categoria ${cat} di ${bambino.fields.NOME_BAMBINO}` : `per ${bambino.fields.NOME_BAMBINO}`}.
          </p>
          <div className="space-y-3">
            {disponibili.slice(0, 5).map((g) => (
              <CardGara
                key={g.id}
                gara={g}
                bambini={[bambino]}
                iscrizioniGenitore={iscrizioniGara}
              />
            ))}
          </div>
          {disponibili.length > 5 && (
            <div className="mt-4 text-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/portale/gare">Vedi tutto il calendario ({disponibili.length} gare)</Link>
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
