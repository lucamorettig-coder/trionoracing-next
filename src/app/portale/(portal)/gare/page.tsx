import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, ArrowRight, Trophy } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getGareFuture,
  getIscrizioniGareByGenitore,
} from "@/lib/airtable-portale";
import FiltriGare from "@/components/portale/gare/FiltriGare";
import CardIscrizioneGara from "@/components/portale/gare/CardIscrizioneGara";
import { formatDateIT } from "@/lib/portale-utils";
import { MESI_IT_SHORT, parseISODate } from "@/components/portale/gare/gara-utils";

export const metadata = {
  title: "Calendario gare · Portale Triono Racing",
};

export default async function GarePage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const today = new Date().toISOString().slice(0, 10);
  const [gare, bambini, iscrizioniGenitore] = await Promise.all([
    getGareFuture(today),
    getBambiniByGenitore(genitore.id),
    getIscrizioniGareByGenitore(genitore.id),
  ]);

  const spotlight = gare.find((g) => g.inEvidenza);
  const garaById = Object.fromEntries(gare.map((g) => [g.id, g]));
  const bambinoById = Object.fromEntries(bambini.map((b) => [b.id, b]));

  // Solo richieste attive su gare future (non in passato e non rifiutate/ritirate)
  const richiesteAttive = iscrizioniGenitore.filter(
    (i) =>
      garaById[i.garaId] &&
      i.stato !== "Rifiutata" &&
      i.stato !== "Ritirata",
  );

  if (gare.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">Calendario gare</h1>
        <p className="text-ink-muted text-sm max-w-[540px]">
          Gare giovanili a cui i tuoi figli possono partecipare. Sezione &quot;In evidenza&quot; = gare ufficiali della scuola.
        </p>
        <div className="text-center py-16 bg-white border border-line rounded-[var(--radius-xl)] mt-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-50 mb-4">
            <Trophy className="w-7 h-7 text-navy-700" />
          </div>
          <p className="text-ink font-semibold mb-1">Nessuna gara in programma</p>
          <p className="text-ink-muted text-sm">Al momento non ci sono gare future in calendario. Torna a controllare presto!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">Calendario gare</h1>
      <p className="text-ink-muted text-sm max-w-[540px]">
        Gare giovanili a cui i tuoi figli possono partecipare. Sezione &quot;In evidenza&quot; = gare ufficiali della scuola.
      </p>

      {spotlight && (
        <Spotlight
          nome={spotlight.nomeGara}
          data={spotlight.data}
          luogo={spotlight.luogo}
          comitato={spotlight.comitatoRegionale}
          classe={spotlight.classe}
          href={`/portale/gare/${spotlight.id}`}
          note={spotlight.note}
        />
      )}

      <FiltriGare
        gare={gare}
        bambini={bambini}
        iscrizioniGenitore={iscrizioniGenitore}
      />

      {richiesteAttive.length > 0 && (
        <section className="mt-12">
          <h2 className="text-base font-bold text-ink mb-3.5">Le tue richieste</h2>
          <div className="space-y-2">
            {richiesteAttive.map((isc) => (
              <CardIscrizioneGara
                key={isc.id}
                iscrizione={isc}
                gara={garaById[isc.garaId]!}
                bambino={bambinoById[isc.bambinoId]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface SpotlightProps {
  nome: string;
  data: string;
  luogo: string;
  comitato: string | null;
  classe: string | null;
  href: string;
  note: string | null;
}

function Spotlight({ nome, data, luogo, comitato, classe, href, note }: SpotlightProps) {
  const { day, month } = parseISODate(data);
  return (
    <Link
      href={href}
      className="block photo-bg-navy mt-6 rounded-[var(--radius-2xl)] p-6 lg:p-8 text-white hover:opacity-95 transition-opacity"
    >
      <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
        <div className="flex gap-5 items-start flex-1 min-w-0">
          <div className="flex-shrink-0 w-20 lg:w-24 text-center rounded-[var(--radius-md)] bg-sun-500 py-3 lg:py-3.5 leading-tight">
            <div className="text-3xl lg:text-4xl font-extrabold tracking-tight tabular-nums text-navy-900">{day}</div>
            <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-navy-900/70 mt-0.5">
              {MESI_IT_SHORT[month]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.08em] text-sun-500 mb-1.5">
              <Star className="w-3.5 h-3.5" />
              In evidenza · gara scuola
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold leading-tight">{nome}</h2>
            {note && <p className="text-[14px] text-white/75 mt-1.5 line-clamp-2">{note}</p>}
            <div className="text-[12px] font-mono text-white/70 mt-3 uppercase tracking-wide">
              {formatDateIT(data)} · {luogo}
              {comitato ? ` · ${comitato}` : ""}
              {classe ? ` · ${classe}` : ""}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 self-start lg:self-center bg-sun-500 text-navy-900 font-bold px-5 py-2.5 rounded-full whitespace-nowrap">
          Vedi gara
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
