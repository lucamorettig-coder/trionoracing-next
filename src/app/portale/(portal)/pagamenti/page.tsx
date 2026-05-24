import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { getGenitoreByClerkId, getTitoliByGenitore } from "@/lib/airtable-portale";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/portale-utils";
import PagamentiLista from "@/components/portale/pagamenti/PagamentiLista";

export default async function PagamentiPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const { titoli, iscrizioniById } = await getTitoliByGenitore(genitore.id);

  const pagato = titoli
    .filter((t) => t.fields.STATO_TITOLO === "pagato")
    .reduce((s, t) => s + (t.fields.IMPORTO ?? 0), 0);
  const daPagare = titoli
    .filter((t) => t.fields.STATO_TITOLO !== "pagato")
    .reduce((s, t) => s + (t.fields.IMPORTO ?? 0), 0);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Pagamenti</h1>
        {titoli.length > 0 && (
          <p className="text-ink-muted text-sm mt-1">
            {titoli.length} {titoli.length === 1 ? "titolo" : "titoli"}
            {" · "}
            Pagato <span className="font-semibold text-ink">{formatEUR(pagato)}</span>
            {" · "}
            Da pagare <span className="font-semibold text-ink">{formatEUR(daPagare)}</span>
          </p>
        )}
      </div>

      {titoli.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-50 mb-4">
            <CreditCard className="w-8 h-8 text-navy-700" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Nessun pagamento</h2>
          <p className="text-ink-muted mb-6 max-w-sm mx-auto">
            I titoli di pagamento appariranno qui dopo la prima iscrizione.
          </p>
          <Button asChild variant="primary" size="md">
            <Link href="/portale/iscrizioni/nuova">
              <Plus className="w-4 h-4" />
              Nuova iscrizione
            </Link>
          </Button>
        </div>
      ) : (
        <PagamentiLista titoli={titoli} iscrizioniById={iscrizioniById} />
      )}
    </div>
  );
}
