import Link from "next/link";
import { Plus, CreditCard, CheckCircle2, FileText, Stethoscope, Euro, Trophy, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FiglioCard from "@/components/portale/figli/FiglioCard";
import JustCreatedBanner from "@/components/portale/figli/JustCreatedBanner";
import { formatDateIT, getStatoIscrizioneAnnoCorrente, buildScadenze, isProfiloGenitoreCompleto, campiMancantiProfilo } from "@/lib/portale-utils";
import WarningSoftBanner from "@/components/ui/warning-soft-banner";
import { statoIscrizioneGaraBadge } from "@/components/portale/gare/gara-utils";
import type {
  Genitore,
  Bambino,
  Iscrizione,
  TitoloPagamento,
  IscrizioneGara,
  Gara,
} from "@/lib/airtable-portale";

interface Props {
  genitore: Genitore;
  bambini: Bambino[];
  iscrizioni: Iscrizione[];
  titoli: TitoloPagamento[];
  iscrizioniGara?: IscrizioneGara[];
  gareFuture?: Gara[];
  /** Se presente, mostra il banner di conferma "Hai aggiunto X" in cima (redirect post-creazione figlio, EVO-027). */
  figlioAppenaCreato?: Bambino | null;
}

export default function DashboardGenitore({
  genitore,
  bambini,
  iscrizioni,
  titoli,
  iscrizioniGara = [],
  gareFuture = [],
  figlioAppenaCreato = null,
}: Props) {
  const nome = genitore.fields.NOME_GENITORE;
  const anno = new Date().getFullYear();

  const statiIscrizione = bambini.map((b) => ({
    bambino: b,
    ...getStatoIscrizioneAnnoCorrente(b.id, iscrizioni),
  }));

  const tuttiIscritti = bambini.length > 0 && statiIscrizione.every((s) => s.stato === 'iscritto');
  const qualcunoDaIscrivere = statiIscrizione.some((s) => s.stato !== 'iscritto');

  const profiloIncompleto = !isProfiloGenitoreCompleto(genitore);
  const mancanti = profiloIncompleto ? campiMancantiProfilo(genitore).slice(0, 2).join(", ") : "";

  const scadenze = buildScadenze(bambini, titoli, iscrizioni);
  const scadenzeCount = scadenze.length;
  const scadenzeVisible = scadenze.slice(0, 5);

  // Richieste gare attive (non rifiutate/ritirate) su gare ancora future
  const garaById = Object.fromEntries(gareFuture.map((g) => [g.id, g]));
  const bambinoById = Object.fromEntries(bambini.map((b) => [b.id, b]));
  const garaRichiesteAttive = iscrizioniGara.filter(
    (i) => garaById[i.garaId] && i.stato !== "Rifiutata" && i.stato !== "Ritirata",
  );
  const garaRichiesteVisible = garaRichiesteAttive.slice(0, 3);

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Hero */}
      <section className="photo-bg-navy text-white">
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
          {bambini.length === 0 ? (
            <>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">Benvenuto</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Ciao, {nome}
              </h1>
              <p className="text-white/80 text-lg mb-6 max-w-lg">
                Benvenuto su Triono Racing. Inizia aggiungendo tuo figlio per poterlo iscrivere ai corsi.
              </p>
              <Button asChild variant="hero" size="md">
                <Link href="/portale/figli/nuovo">
                  <Plus className="w-4 h-4" />
                  Aggiungi figlio
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">Il tuo portale</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Ciao, {nome}
              </h1>
              <p className="text-white/70 text-base">
                {bambini.length} {bambini.length === 1 ? "figlio" : "figli"}
                {scadenzeCount > 0 && (
                  <span className="ml-2 text-ember-300">
                    · {scadenzeCount} {scadenzeCount === 1 ? "scadenza" : "scadenze"} in arrivo
                  </span>
                )}
              </p>
            </>
          )}
        </div>
      </section>

      {figlioAppenaCreato && (
        <JustCreatedBanner
          nomeBambino={figlioAppenaCreato.fields.NOME_BAMBINO ?? ""}
          bambinoId={figlioAppenaCreato.id}
        />
      )}

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-10">
        {/* Banner soft profilo incompleto (EVO-029) — non bloccante */}
        {profiloIncompleto && (
          <WarningSoftBanner
            title="Completa il tuo profilo"
            description={
              <>
                Mancano alcuni dati anagrafici
                {mancanti ? ` (${mancanti}…)` : ""} necessari per le iscrizioni e
                il tesseramento dei tuoi figli.
              </>
            }
            cta={{ label: "Completa il profilo", href: "/portale/profilo" }}
          />
        )}

        {/* Prossime scadenze — sopra "I miei figli" quando presenti (EVO-025) */}
        {scadenzeVisible.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-ink mb-4">Prossime scadenze</h2>
            <div className="bg-white border border-line rounded-[var(--radius-xl)] divide-y divide-line shadow-[var(--shadow-sm)]">
              {scadenzeVisible.map((s, idx) => {
                const isScaduto = s.giorni < 0;
                const isCert = s.kind === 'cert';
                const iconBg = isScaduto ? 'bg-flag-100 text-flag-700' : 'bg-ember-100 text-ember-700';

                const title = isCert
                  ? `Certificato medico di ${s.bambinoNome}`
                  : `${s.titoloLabel ?? 'Pagamento'} · ${s.bambinoNome}${s.importo !== undefined ? ` · €${s.importo}` : ''}`;

                const subtitle = isScaduto
                  ? isCert
                    ? `Scaduto da ${Math.abs(s.giorni)} ${Math.abs(s.giorni) === 1 ? 'giorno' : 'giorni'} · blocco iscrizione ${anno}`
                    : `Scaduto il ${formatDateIT(s.dataScadenza)}`
                  : `Tra ${s.giorni} ${s.giorni === 1 ? 'giorno' : 'giorni'} · scadenza ${formatDateIT(s.dataScadenza)}`;

                const ctaLabel = isCert ? 'Carica certificato' : 'Paga con SumUp';
                const ctaHref = isCert
                  ? `/portale/figli/${s.bambinoId}#certificato`
                  : `/portale/iscrizioni/${s.iscrizioneId}/checkout?titolo=${s.titoloId}`;

                return (
                  <div key={idx} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${iconBg}`}>
                      {isCert ? <Stethoscope className="w-5 h-5" /> : <Euro className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{title}</p>
                      <p className="text-xs text-ink-muted">{subtitle}</p>
                    </div>
                    <Button asChild variant={isCert ? "secondary" : "primary"} size="sm" className="shrink-0">
                      <Link href={ctaHref}>{ctaLabel}</Link>
                    </Button>
                  </div>
                );
              })}
              {scadenzeCount > 5 && (
                <div className="px-5 py-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/portale/iscrizioni?stato=da_pagare">
                      Vedi tutte le scadenze ({scadenzeCount})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* I miei figli */}
        {bambini.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-ink">I miei figli</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/portale/figli">Vedi tutti</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statiIscrizione.map(({ bambino, stato, iscrizioneId }) => (
                <FiglioCard
                  key={bambino.id}
                  bambino={bambino}
                  statoIscrizione={stato}
                  iscrizioneId={iscrizioneId}
                />
              ))}
              <Link
                href="/portale/figli/nuovo"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-[var(--radius-xl)] p-8 text-ink-muted hover:border-navy-300 hover:text-navy-700 transition-colors min-h-[160px]"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-semibold">Aggiungi figlio</span>
              </Link>
            </div>
          </section>
        )}

        {/* Le tue gare — richieste attive */}
        {garaRichiesteAttive.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink inline-flex items-center gap-2">
                <Trophy className="w-5 h-5 text-navy-700" />
                Le tue gare
                <span className="text-[12px] font-mono text-ink-muted">({garaRichiesteAttive.length})</span>
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/portale/gare">Calendario gare</Link>
              </Button>
            </div>
            <div className="bg-white border border-line rounded-[var(--radius-xl)] divide-y divide-line shadow-[var(--shadow-sm)]">
              {garaRichiesteVisible.map((isc) => {
                const gara = garaById[isc.garaId]!;
                const bambino = bambinoById[isc.bambinoId];
                const nome = bambino?.fields.NOME_BAMBINO ?? "Figlio";
                const badge = statoIscrizioneGaraBadge(isc.stato, nome);
                return (
                  <Link
                    key={isc.id}
                    href={`/portale/gare/${gara.id}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-bg-soft transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{gara.nomeGara}</p>
                      <p className="text-xs text-ink-muted mt-0.5 inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {gara.luogo}
                        </span>
                        <span aria-hidden>·</span>
                        <span>{formatDateIT(gara.data)}</span>
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <ArrowRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </Link>
                );
              })}
              {garaRichiesteAttive.length > garaRichiesteVisible.length && (
                <div className="px-5 py-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/portale/gare">
                      Vedi tutte ({garaRichiesteAttive.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section>
          <h2 className="text-xl font-bold text-ink mb-4">Azioni rapide</h2>
          <div className={`grid grid-cols-1 gap-4 ${qualcunoDaIscrivere ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
            {qualcunoDaIscrivere && (
              <Link
                href="/portale/iscrizioni/nuova"
                className="flex items-center gap-3 bg-navy-700 text-white rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:bg-navy-900 transition-colors shadow-[var(--shadow-sm)]"
              >
                <Plus className="w-5 h-5 shrink-0" />
                Nuova iscrizione
              </Link>
            )}
            <Link
              href="/portale/iscrizioni"
              className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
            >
              <FileText className="w-5 h-5 shrink-0 text-ink-muted" />
              Iscrizioni
            </Link>
            <Link
              href="/portale/pagamenti"
              className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
            >
              <CreditCard className="w-5 h-5 shrink-0 text-ink-muted" />
              Pagamenti
            </Link>
            <Link
              href="/portale/gare"
              className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
            >
              <Trophy className="w-5 h-5 shrink-0 text-ink-muted" />
              Calendario gare
              {gareFuture.length > 0 && (
                <span className="ml-auto text-[11px] font-mono uppercase text-ink-muted">
                  {gareFuture.length}
                </span>
              )}
            </Link>
          </div>

          {tuttiIscritti && (
            <div className="mt-8 p-4 lg:p-5 rounded-[var(--radius-lg)] border border-grass-100 bg-grass-50 flex items-center gap-4">
              <div className="w-11 h-11 rounded-[var(--radius-md)] bg-grass-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-grass-700 text-sm">Tutti i tuoi figli sono iscritti per il {anno}</p>
                <p className="text-xs text-grass-700/80 mt-0.5">Puoi gestire pagamenti e modulistica dalle sezioni dedicate.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
