import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ScrollText } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getIscrizioniByGenitore,
} from "@/lib/airtable-portale";
import { Button } from "@/components/ui/button";
import IscrizioniLista from "@/components/portale/iscrizioni/IscrizioniLista";

interface PageProps {
  searchParams: Promise<{ anno?: string; figlio?: string }>;
}

export default async function IscrizioniPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const [bambini, iscrizioni] = await Promise.all([
    getBambiniByGenitore(genitore.id),
    getIscrizioniByGenitore(genitore.id),
  ]);

  const sp = await searchParams;
  const annoFilter = sp.anno ?? "anno-corrente";
  const figlioFilter = sp.figlio ?? "tutti";

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">Iscrizioni</h1>
          {iscrizioni.length > 0 && (
            <p className="text-ink-muted text-sm mt-1">
              {iscrizioni.length} {iscrizioni.length === 1 ? "iscrizione" : "iscrizioni"}
            </p>
          )}
        </div>
        {bambini.length > 0 && (
          <Button asChild variant="primary" size="md" className="hidden sm:inline-flex">
            <Link href="/portale/iscrizioni/nuova">
              <Plus className="w-4 h-4" />
              Nuova iscrizione
            </Link>
          </Button>
        )}
      </div>

      {iscrizioni.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-50 mb-4">
            <ScrollText className="w-8 h-8 text-navy-700" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Non hai iscrizioni</h2>
          <p className="text-ink-muted mb-6 max-w-sm mx-auto">
            {bambini.length === 0
              ? "Aggiungi prima un figlio, poi potrai iscriverlo a un corso."
              : "Inizia ora la prima iscrizione."}
          </p>
          {bambini.length === 0 ? (
            <Button asChild variant="primary" size="md">
              <Link href="/portale/figli/nuovo">
                <Plus className="w-4 h-4" />
                Aggiungi figlio
              </Link>
            </Button>
          ) : (
            <Button asChild variant="primary" size="md">
              <Link href="/portale/iscrizioni/nuova">
                <Plus className="w-4 h-4" />
                Inizia ora
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <IscrizioniLista
          iscrizioni={iscrizioni}
          bambini={bambini}
          annoFilter={annoFilter}
          figlioFilter={figlioFilter}
        />
      )}

      {/* FAB mobile */}
      {bambini.length > 0 && (
        <div className="sm:hidden fixed bottom-6 right-6">
          <Button asChild variant="primary" size="md" className="rounded-full shadow-[var(--shadow-lg)] w-14 h-14 p-0">
            <Link href="/portale/iscrizioni/nuova" aria-label="Nuova iscrizione">
              <Plus className="w-6 h-6" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
