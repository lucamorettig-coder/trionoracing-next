import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getGareAssegnateAlMaestro,
} from "@/lib/airtable-portale";
import CardGaraAssegnata from "@/components/portale/lezioni/CardGaraAssegnata";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";

export const metadata = {
  title: "Gare assegnate · Portale Triono Racing",
};

interface SearchParams {
  searchParams: Promise<{ scope?: string }>;
}

export default async function GareAssegnatePage({ searchParams }: SearchParams) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <SezioneMaestroNonCollegato />
      </div>
    );
  }

  const sp = await searchParams;
  const scope: "future" | "past" = sp.scope === "past" ? "past" : "future";
  const gare = await getGareAssegnateAlMaestro(maestro.id, scope);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-8">
      <header>
        <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
          Area maestro
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1">
          Gare assegnate
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Gare a cui sei stato assegnato come maestro accompagnatore.
        </p>
      </header>

      {/* Tab toggle future/passate */}
      <div role="tablist" className="inline-flex bg-bg-muted rounded-[var(--radius-md)] p-1">
        <Link
          href="/portale/gare-assegnate?scope=future"
          role="tab"
          aria-selected={scope === "future"}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)] transition-colors",
            scope === "future"
              ? "bg-white text-navy-700 shadow-[var(--shadow-xs)]"
              : "text-ink-muted hover:text-navy-700",
          )}
        >
          In programma
        </Link>
        <Link
          href="/portale/gare-assegnate?scope=past"
          role="tab"
          aria-selected={scope === "past"}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)] transition-colors",
            scope === "past"
              ? "bg-white text-navy-700 shadow-[var(--shadow-xs)]"
              : "text-ink-muted hover:text-navy-700",
          )}
        >
          Concluse
        </Link>
      </div>

      {gare.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border-2 border-dashed border-line rounded-[var(--radius-xl)]">
          <Trophy className="w-10 h-10 text-ink-muted" aria-hidden />
          <p className="text-base font-semibold text-ink">
            Nessuna gara {scope === "future" ? "in programma" : "conclusa"}
          </p>
          <p className="text-sm text-ink-muted max-w-md">
            {scope === "future"
              ? "Le gare a cui sarai assegnato compariranno qui."
              : "Le gare passate a cui hai partecipato compariranno qui."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gare.map((g) => (
            <CardGaraAssegnata key={g.id} gara={g} past={scope === "past"} />
          ))}
        </div>
      )}
    </div>
  );
}
