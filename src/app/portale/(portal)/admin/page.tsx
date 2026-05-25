import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Baby,
  CreditCard,
  Flag,
  Coffee,
  TrendingUp,
  AlertCircle,
  Wallet,
  ShieldAlert,
  Banknote,
  Clock,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KPICard } from "@/components/admin/KPICard";
import { TodayTaskRow } from "@/components/admin/TodayTaskRow";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";
import {
  getCertificatiScaduti,
  getIscrizioniInStallo,
  getKPIBambiniAttivi,
  getKPIIncassiYTD,
  getKPIIscrizioniAnno,
  getKPIPagamentiPending,
  getRateScadute,
} from "@/lib/airtable-admin";
import { formatEUR } from "@/lib/portale-utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Iscrizioni",
    href: "/portale/admin/iscrizioni",
    icon: <ClipboardList size={22} />,
    description: "Gestisci anno corrente",
  },
  {
    label: "Bambini",
    href: "/portale/admin/bambini",
    icon: <Baby size={22} />,
    description: "Anagrafica e certificati",
  },
  {
    label: "Pagamenti",
    href: "/portale/admin/pagamenti",
    icon: <CreditCard size={22} />,
    description: "Rate e titoli",
  },
  {
    label: "Gare",
    href: "/portale/admin/gare",
    icon: <Flag size={22} />,
    description: "Calendario e iscrizioni",
  },
];

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") redirect("/portale");

  const anno = new Date().getFullYear();
  const firstName = genitore.fields.NOME_GENITORE?.split(" ")[0] ?? "Luca";

  const [kpiIscr, kpiBamb, kpiIncassi, kpiPending] = await Promise.all([
    safe(() => getKPIIscrizioniAnno(anno)),
    safe(() => getKPIBambiniAttivi(anno)),
    safe(() => getKPIIncassiYTD(anno)),
    safe(() => getKPIPagamentiPending()),
  ]);

  const [certScaduti, rateScadute, iscrizioniStallo] = await Promise.all([
    safe(() => getCertificatiScaduti()),
    safe(() => getRateScadute()),
    safe(() => getIscrizioniInStallo()),
  ]);

  const taskCount =
    (certScaduti?.count ?? 0) + (rateScadute?.count ?? 0) + (iscrizioniStallo?.count ?? 0);

  const iscrDelta =
    kpiIscr?.deltaVsPrevYear != null
      ? `${kpiIscr.deltaVsPrevYear >= 0 ? "+" : ""}${kpiIscr.deltaVsPrevYear} vs ${anno - 1}`
      : undefined;
  const iscrDeltaVariant: "positive" | "negative" | "neutral" =
    kpiIscr?.deltaVsPrevYear == null
      ? "neutral"
      : kpiIscr.deltaVsPrevYear > 0
        ? "positive"
        : kpiIscr.deltaVsPrevYear < 0
          ? "negative"
          : "neutral";

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title={`Ciao ${firstName}, benvenuto`}
        subtitle="Ecco il riepilogo di oggi."
      />

      {/* KPI ───────────────────────────────────────────────────────── */}
      <section className="mt-8" aria-label="Indicatori chiave">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label={`Iscrizioni ${anno}`}
            value={kpiIscr?.value ?? "—"}
            delta={iscrDelta}
            deltaVariant={iscrDeltaVariant}
            subline={kpiIscr ? `${kpiIscr.prevValue} l'anno scorso` : undefined}
            icon={<TrendingUp size={18} />}
          />
          <KPICard
            label="Bambini attivi"
            value={kpiBamb?.value ?? "—"}
            subline="Con iscrizione completa"
            icon={<Baby size={18} />}
          />
          <KPICard
            label="Incassi YTD"
            value={kpiIncassi ? formatEUR(kpiIncassi.value) : "—"}
            subline={
              kpiIncassi
                ? `App ${formatEUR(kpiIncassi.breakdown.app)} · Bonifico ${formatEUR(
                    kpiIncassi.breakdown.bonifico,
                  )}`
                : undefined
            }
            icon={<Wallet size={18} />}
          />
          <KPICard
            label="Pagamenti pending"
            value={kpiPending?.count ?? "—"}
            valueTone="critical"
            subline={kpiPending ? `${formatEUR(kpiPending.totaleImporto)} attesi` : undefined}
            icon={<AlertCircle size={18} />}
          />
        </div>
      </section>

      {/* Today's tasks ─────────────────────────────────────────────── */}
      <section className="mt-12" aria-label="Cose da fare oggi">
        <header className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-ink leading-tight">Cose da fare oggi</h2>
            <p className="text-sm text-ink-muted mt-0.5">Ordinate per urgenza.</p>
          </div>
        </header>

        {taskCount === 0 ? (
          <div className="bg-white border border-line rounded-[var(--radius-lg)] p-10 text-center flex flex-col items-center gap-3">
            <Coffee className="text-navy-200" size={48} aria-hidden />
            <h3 className="text-lg font-bold text-ink">🎉 Niente da fare oggi</h3>
            <p className="text-sm text-ink-muted max-w-md">
              Tutti i certificati validi, le rate pagate, le iscrizioni complete. Goditi un caffè.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {certScaduti && certScaduti.count > 0 && (
              <TodayTaskRow
                icon={<ShieldAlert size={20} className="text-flag-500" />}
                title="certificati medici scaduti"
                count={certScaduti.count}
                href="/portale/admin/bambini?filter=cert-scaduto"
                severity="critical"
                description="Bambini con certificato non più valido."
              />
            )}
            {rateScadute && rateScadute.count > 0 && (
              <TodayTaskRow
                icon={<Banknote size={20} className="text-flag-500" />}
                title="rate scadute non pagate"
                count={rateScadute.count}
                href="/portale/admin/pagamenti?filter=scaduto"
                severity="critical"
                description={`Totale atteso ${formatEUR(rateScadute.totaleImporto)}.`}
              />
            )}
            {iscrizioniStallo && iscrizioniStallo.count > 0 && (
              <TodayTaskRow
                icon={<Clock size={20} className="text-ember-500" />}
                title="iscrizioni in stallo da oltre 7 giorni"
                count={iscrizioniStallo.count}
                href="/portale/admin/iscrizioni?filter=stallo"
                severity="warning"
                description="INCOMPLETA senza modifiche recenti."
              />
            )}
          </div>
        )}
      </section>

      {/* Quick actions ─────────────────────────────────────────────── */}
      <section className="mt-12" aria-label="Azioni rapide">
        <h2 className="text-lg lg:text-xl font-bold text-ink leading-tight mb-4">Azioni rapide</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-2 hover:bg-navy-700 hover:text-white hover:border-navy-700 transition-colors"
            >
              <span className="text-navy-700 group-hover:text-sun-500 transition-colors">
                {a.icon}
              </span>
              <span className="font-semibold text-ink group-hover:text-white transition-colors">
                {a.label}
              </span>
              <span className="text-xs text-ink-muted group-hover:text-white/70 transition-colors">
                {a.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Wrapper di safety: se un wrapper Airtable fallisce (env mancante in preview,
 * formula errata, rate limit), la dashboard continua a renderizzare con "—".
 */
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/dashboard] fetch failed:", err);
    return null;
  }
}
