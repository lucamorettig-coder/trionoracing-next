import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getGenitoreByClerkId, getBambiniByGenitore } from "@/lib/airtable-portale";
import { Button } from "@/components/ui/button";
import WizardNuovaIscrizione from "@/components/portale/iscrizioni/WizardNuovaIscrizione";

interface PageProps {
  searchParams: Promise<{ bambino?: string }>;
}

export default async function NuovaIscrizionePage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const bambini = await getBambiniByGenitore(genitore.id);
  const sp = await searchParams;

  if (bambini.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-ink mb-3">Aggiungi prima un figlio</h1>
        <p className="text-ink-muted mb-6">
          Per creare un&apos;iscrizione ti serve almeno un figlio registrato.
        </p>
        <Button asChild variant="primary" size="md">
          <Link href="/portale/figli/nuovo">Aggiungi figlio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-2xl font-bold text-ink mb-2 text-center">Nuova iscrizione</h1>
      <p className="text-ink-muted text-center mb-8">
        4 step per iscrivere tuo figlio alla scuola.
      </p>
      <WizardNuovaIscrizione
        bambini={bambini}
        bambinoIniziale={sp.bambino}
        anno={new Date().getFullYear()}
      />
    </div>
  );
}
