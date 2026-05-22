import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { getGenitoreByClerkId, getBambiniByGenitore } from "@/lib/airtable-portale";
import { Button } from "@/components/ui/button";
import FiglioCard from "@/components/portale/figli/FiglioCard";

export default async function FigliPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const bambini = await getBambiniByGenitore(genitore.id);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">I miei figli</h1>
          {bambini.length > 0 && (
            <p className="text-ink-muted text-sm mt-1">
              {bambini.length} {bambini.length === 1 ? "figlio registrato" : "figli registrati"}
            </p>
          )}
        </div>
        <Button asChild variant="primary" size="md" className="hidden sm:inline-flex">
          <Link href="/portale/figli/nuovo">
            <Plus className="w-4 h-4" />
            Aggiungi figlio
          </Link>
        </Button>
      </div>

      {bambini.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-50 mb-4">
            <Users className="w-8 h-8 text-navy-700" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Non hai ancora figli aggiunti</h2>
          <p className="text-ink-muted mb-6 max-w-sm mx-auto">
            Aggiungi i dati di tuo figlio per poterlo iscrivere ai nostri corsi.
          </p>
          <Button asChild variant="primary" size="md">
            <Link href="/portale/figli/nuovo">
              <Plus className="w-4 h-4" />
              Aggiungi il primo figlio
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bambini.map((b) => (
            <FiglioCard key={b.id} bambino={b} />
          ))}
          <Link
            href="/portale/figli/nuovo"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-[var(--radius-xl)] p-8 text-ink-muted hover:border-navy-300 hover:text-navy-700 transition-colors min-h-[160px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-semibold">Aggiungi figlio</span>
          </Link>
        </div>
      )}

      {/* FAB mobile */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <Button asChild variant="primary" size="md" className="rounded-full shadow-[var(--shadow-lg)] w-14 h-14 p-0">
          <Link href="/portale/figli/nuovo" aria-label="Aggiungi figlio">
            <Plus className="w-6 h-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
