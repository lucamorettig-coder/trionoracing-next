import Link from "next/link";
import { AlertTriangle, Plus, CalendarDays, CreditCard, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import FiglioCard from "@/components/portale/figli/FiglioCard";
import { daysUntil, formatDateIT } from "@/lib/portale-utils";
import type { Genitore, Bambino } from "@/lib/airtable-portale";

interface Alert {
  bambinoNome: string;
  bambinoId: string;
  tipo: "cert_scaduto" | "cert_in_scadenza";
  dataScadenza: string;
  giorni: number;
}

function buildAlerts(bambini: Bambino[]): Alert[] {
  const alerts: Alert[] = [];
  for (const b of bambini) {
    const scadenza = b.fields.CERTIFICATO_MEDICO_SCADENZA;
    const stato = b.fields.CERTIFICATO_MEDICO_STATO;
    if (!scadenza) continue;
    const giorni = daysUntil(scadenza);
    if (stato === "SCADUTO" || giorni < 0) {
      alerts.push({ bambinoNome: b.fields.NOME_BAMBINO, bambinoId: b.id, tipo: "cert_scaduto", dataScadenza: scadenza, giorni });
    } else if (giorni <= 30) {
      alerts.push({ bambinoNome: b.fields.NOME_BAMBINO, bambinoId: b.id, tipo: "cert_in_scadenza", dataScadenza: scadenza, giorni });
    }
  }
  return alerts.sort((a, b) => a.giorni - b.giorni).slice(0, 3);
}

interface Props {
  genitore: Genitore;
  bambini: Bambino[];
}

export default function DashboardGenitore({ genitore, bambini }: Props) {
  const nome = genitore.fields.NOME_GENITORE;
  const alerts = buildAlerts(bambini);
  const scadenzeCount = alerts.length;

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Hero */}
      <section className="bg-navy-700 pattern-navy text-white">
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

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-10">
        {/* Alert urgenti */}
        {alerts.length > 0 && (
          <section className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={`${alert.bambinoId}-${alert.tipo}`}
                className={`flex items-start gap-3 rounded-[var(--radius-lg)] p-4 border ${
                  alert.tipo === "cert_scaduto"
                    ? "bg-flag-50 border-flag-200 text-flag-700"
                    : "bg-ember-50 border-ember-200 text-ember-700"
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {alert.tipo === "cert_scaduto"
                      ? `Certificato di ${alert.bambinoNome} scaduto il ${formatDateIT(alert.dataScadenza)}`
                      : `Certificato di ${alert.bambinoNome} in scadenza il ${formatDateIT(alert.dataScadenza)} (tra ${alert.giorni} giorni)`}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 text-xs h-8 px-3">
                  <Link href={`/portale/figli/${alert.bambinoId}#certificato`}>Carica nuovo</Link>
                </Button>
              </div>
            ))}
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
              {bambini.map((b) => (
                <FiglioCard key={b.id} bambino={b} />
              ))}
              {/* Ghost card aggiungi */}
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

        {/* Prossime scadenze */}
        {alerts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-ink mb-4">Prossime scadenze</h2>
            <div className="bg-white border border-line rounded-[var(--radius-xl)] divide-y divide-line shadow-[var(--shadow-sm)]">
              {alerts.map((alert) => (
                <div key={`sc-${alert.bambinoId}-${alert.tipo}`} className="flex items-center gap-4 px-5 py-4">
                  <CalendarDays className="w-5 h-5 text-ink-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      Certificato di {alert.bambinoNome}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {alert.tipo === "cert_scaduto"
                        ? `Scaduto il ${formatDateIT(alert.dataScadenza)}`
                        : `Scade il ${formatDateIT(alert.dataScadenza)}`}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs shrink-0">
                    <Link href={`/portale/figli/${alert.bambinoId}#certificato`}>Carica nuovo</Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section>
          <h2 className="text-xl font-bold text-ink mb-4">Azioni rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/portale/iscrizioni/nuova"
              className="flex items-center gap-3 bg-navy-700 text-white rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:bg-navy-900 transition-colors shadow-[var(--shadow-sm)]"
            >
              <Plus className="w-5 h-5 shrink-0" />
              Nuova iscrizione
            </Link>
            <Link
              href="/portale/iscrizioni"
              className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
            >
              <CreditCard className="w-5 h-5 shrink-0 text-ink-muted" />
              Vedi pagamenti
            </Link>
            <Link
              href="/portale/gare"
              className="flex items-center gap-3 bg-white border border-line text-ink rounded-[var(--radius-xl)] px-5 py-4 font-semibold hover:border-navy-300 transition-colors shadow-[var(--shadow-sm)]"
            >
              <Trophy className="w-5 h-5 shrink-0 text-ink-muted" />
              Calendario gare
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
