import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, ExternalLink, CheckCircle2, Info } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getGaraById,
  getIscrizioniGareByGenitore,
} from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import CardIscriviFigli from "@/components/portale/gare/CardIscriviFigli";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function GaraDettaglioPage({ params, searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const { id } = await params;
  const sp = await searchParams;

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const gara = await getGaraById(id);
  if (!gara) notFound();

  // 404 anche per gare passate (no flusso iscrizione su gare vecchie)
  const today = new Date().toISOString().slice(0, 10);
  if (gara.data && gara.data < today) notFound();

  const [bambini, iscrizioniGenitore] = await Promise.all([
    getBambiniByGenitore(genitore.id),
    getIscrizioniGareByGenitore(genitore.id),
  ]);

  const success = sp.success ? parseInt(sp.success, 10) : null;

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Hero photo-bg-navy */}
      <div className="photo-bg-navy text-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-7 lg:py-12">
          <Link
            href="/portale/gare"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors mb-3.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Calendario gare
          </Link>

          {gara.inEvidenza && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.08em] text-sun-500 mb-1.5">
              <Star className="w-3.5 h-3.5" />
              In evidenza · gara scuola
            </div>
          )}
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
            {gara.nomeGara}
          </h1>
          <div className="text-[13px] lg:text-[14px] text-white/75 mt-3 leading-relaxed">
            {formatDateIT(gara.data)}
            {" · "}
            {gara.luogo}
            {gara.comitatoRegionale ? ` · ${gara.comitatoRegionale}` : ""}
            {gara.classe ? ` · ${gara.classe}` : ""}
            {gara.tipoGara ? ` · ${gara.tipoGara}` : ""}
          </div>

          {gara.linkFci && (
            <a
              href={gara.linkFci}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sun-500 hover:text-sun-500/80 mt-4"
            >
              Vedi su FCI
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Banner success/error */}
      {success !== null && (
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-6">
          <div className="bg-grass-50 border border-grass-100 rounded-[var(--radius-md)] p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-grass-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[14px] font-semibold text-grass-700">
                Richiesta inviata
                {success > 0 ? ` per ${success} ${success === 1 ? "figlio" : "figli"}` : ""}.
              </div>
              <div className="text-[13px] text-ink mt-0.5">
                Ti contatteremo per la conferma. Puoi controllare lo stato qui o nella scheda del figlio.
              </div>
            </div>
          </div>
        </div>
      )}
      {sp.error === "no-selection" && (
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-6">
          <div className="bg-ember-50 border border-ember-100 rounded-[var(--radius-md)] p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-ember-700 flex-shrink-0 mt-0.5" />
            <div className="text-[14px] text-ember-700">Seleziona almeno un figlio prima di inviare la richiesta.</div>
          </div>
        </div>
      )}

      {/* Layout 2-col */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-4">
          {gara.note && (
            <section className="bg-white border border-line rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
              <h2 className="text-base font-bold mb-2">Descrizione</h2>
              <p className="text-[14px] leading-relaxed text-ink whitespace-pre-line">{gara.note}</p>
            </section>
          )}

          <section className="bg-white border border-line rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-bold mb-2">Informazioni</h2>
            <KvRow k="Data" v={formatDateIT(gara.data)} />
            <KvRow k="Luogo" v={gara.luogo} />
            {gara.classe && <KvRow k="Classe" v={gara.classe} />}
            {gara.tipoGara && <KvRow k="Tipologia" v={gara.tipoGara} />}
            {gara.comitatoRegionale && <KvRow k="Comitato" v={gara.comitatoRegionale} />}
            {gara.idGaraFci && <KvRow k="ID FCI" v={gara.idGaraFci} />}
          </section>

          <section className="bg-white border border-line rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-bold mb-1">Cosa succede dopo</h2>
            <ol className="mt-3 space-y-2.5">
              <Step n={1} text="Invii la richiesta dal modulo a destra." />
              <Step n={2} text="La segreteria conferma o rifiuta la richiesta entro qualche giorno." />
              <Step n={3} text="Quando lo stato passa a 'Confermata', il tuo figlio è iscritto. Lo vedrai nella scheda del figlio (tab Gare)." />
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <CardIscriviFigli gara={gara} bambini={bambini} iscrizioniGenitore={iscrizioniGenitore} />
        </aside>
      </div>
    </div>
  );
}

function KvRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2 py-2 border-b border-bg-muted last:border-b-0">
      <div className="w-24 flex-shrink-0 text-[11px] font-mono uppercase tracking-wide text-ink-muted">{k}</div>
      <div className="flex-1 text-[14px] text-ink font-medium">{v}</div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-2.5 items-start text-[13px] text-ink leading-relaxed">
      <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-bg-muted text-ink-muted font-mono text-[11px] font-bold flex-shrink-0 mt-0.5">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
