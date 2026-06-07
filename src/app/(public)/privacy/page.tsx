import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { LEGAL, CONTACT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Informativa privacy",
  description:
    "Informativa privacy del sito Triono Racing (A.S.D. CIEMME) ai sensi del Reg. UE 2016/679 (GDPR): titolare, finalità, basi giuridiche, responsabili, diritti.",
  alternates: { canonical: "/privacy" },
};

const LAST_REVISION = "7 giugno 2026";

export default function PrivacyPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <BreadcrumbJsonLd items={[{ name: "Privacy", url: "/privacy" }]} />

      <div className="reveal">
        <SectionHeader
          eyebrow="Informativa privacy"
          title="Come trattiamo i tuoi dati."
          subtitle="Informativa resa ai sensi degli artt. 13-14 del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 e s.m.i. (Codice Privacy)."
        />
      </div>

      <div className="mt-12 space-y-10 reveal reveal-delay-1">
        <Section title="1. Titolare del trattamento">
          <p>
            Il Titolare del trattamento è <strong>{LEGAL.name}</strong> (Associazione Sportiva
            Dilettantistica; marchio commerciale: <em>{LEGAL.brand}</em>), con sede legale in{" "}
            <strong>{LEGAL.legalAddress}</strong> — sede operativa presso il Ciclodromo Renato
            Perona, Terni.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 mt-2">
            <li>
              Partita IVA: <strong>{LEGAL.vat}</strong> — Codice Fiscale:{" "}
              <strong>{LEGAL.taxCode}</strong>
            </li>
            <li>
              Legale rappresentante: <strong>{LEGAL.rep}</strong>
            </li>
            <li>
              E-mail:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-navy-700 underline underline-offset-2 font-semibold"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              — PEC: <strong>{LEGAL.pec}</strong>
            </li>
          </ul>
          <p>
            Il Titolare <strong>non ha nominato un Responsabile della Protezione dei Dati
            (DPO/RPD)</strong>, non ricorrendone gli obblighi di legge (art. 37 GDPR): il
            trattamento non costituisce attività principale né avviene su larga scala. Per ogni
            questione relativa ai dati personali è possibile usare i recapiti indicati sopra.
          </p>
        </Section>

        <Section title="2. Tipologie di dati, finalità e basi giuridiche">
          <p>Trattiamo dati personali nei contesti seguenti.</p>
          <LegalBlock
            origin="a) Modulo di contatto pubblico"
            url="/contatti"
            data={[
              "Nome, cognome (facoltativo), e-mail, telefono (facoltativo)",
              "Motivo della richiesta e testo del messaggio, consenso al trattamento",
              "Per sicurezza e anti-spam: User-Agent e URL di provenienza",
            ]}
            purpose="Rispondere alla richiesta e gestire il follow-up."
            base="Art. 6.1.b GDPR (riscontro a tua richiesta / misure precontrattuali); per il messaggio libero, art. 6.1.a (consenso)."
            retention="24 mesi dall'ultimo contatto, salvo che ne derivi un'iscrizione (vedi lett. b)."
          />
          <LegalBlock
            origin="b) Area riservata e iscrizione alla Scuola di Ciclismo"
            url="/portale"
            data={[
              "Credenziali di accesso (e-mail e password gestite dal fornitore di autenticazione)",
              "Dati anagrafici del genitore/tutore e dei figli minori iscritti",
              "Certificato medico sportivo (categoria particolare, vedi §3)",
              "Taglie per il kit, ricevute e stato dei pagamenti, eventuali foto caricate",
            ]}
            purpose="Costituzione e gestione del rapporto associativo e dell'iscrizione ai corsi, tesseramento federale, gestione di quote e documenti, adempimenti amministrativi e fiscali."
            base="Art. 6.1.b GDPR (esecuzione del contratto/rapporto associativo); art. 6.1.c (obblighi di legge, es. fiscali e federali); per i dati sanitari art. 9.2.a (consenso esplicito)."
            retention="Per la durata dell'iscrizione e, successivamente, per il tempo richiesto dagli obblighi fiscali e federali (di norma 10 anni); i certificati medici per il periodo di validità e comunque non oltre quanto necessario."
          />
          <LegalBlock
            origin="c) Pagamenti"
            data={[
              "Importo, causale, stato e riferimenti della transazione, trattati tramite il fornitore di pagamento (vedi §6)",
              "Il Titolare non memorizza i dati completi della carta",
            ]}
            purpose="Incasso di quote e rate."
            base="Art. 6.1.b (contratto) e art. 6.1.c (obblighi contabili/fiscali)."
          />
          <LegalBlock
            origin="d) Navigazione e cookie"
            url="/cookie"
            data={[
              "Cookie tecnici necessari (sessione, sicurezza, preferenze di consenso)",
              "Con il tuo consenso: cookie statistici (Google Analytics) e di terze parti (Google Maps)",
            ]}
            purpose="Funzionamento del sito; misurazione statistica anonima; visualizzazione mappa."
            base="Art. 6.1.f (legittimo interesse) ed esenzione consenso per i soli cookie tecnici; art. 6.1.a (consenso) per cookie statistici e di terze parti."
          />
        </Section>

        <Section title="3. Categorie particolari di dati (salute dei minori)">
          <p>
            Per l&apos;idoneità alla pratica sportiva trattiamo il <strong>certificato
            medico</strong> dei minori iscritti, che costituisce dato relativo alla salute
            (categoria particolare, art. 9 GDPR). Tale trattamento avviene{" "}
            <strong>sulla base del consenso esplicito</strong> prestato dal genitore/tutore
            esercente la responsabilità genitoriale (art. 9.2.a), è limitato alle finalità di
            idoneità e tesseramento, ed è accessibile solo al personale autorizzato. Il documento
            è conservato in forma protetta presso il fornitore di storage indicato al §6 e
            cancellato quando non più necessario.
          </p>
        </Section>

        <Section title="4. Minori">
          <p>
            I servizi della Scuola sono rivolti a minori, ma{" "}
            <strong>gli account e i consensi sono gestiti esclusivamente dai
            genitori/tutori</strong>. I dati dei minori sono trattati sulla base del
            contratto/rapporto associativo e, per i dati sanitari, del consenso esplicito del
            genitore. Non effettuiamo profilazione dei minori né marketing rivolto a essi.
          </p>
        </Section>

        <Section title="5. Modalità del trattamento e sicurezza">
          <p>
            Il trattamento avviene con strumenti elettronici, adottando misure tecniche e
            organizzative adeguate (controllo degli accessi, autenticazione, cifratura in
            transito, conservazione su infrastrutture con accesso limitato). I dati sono
            accessibili solo a soggetti autorizzati e ai responsabili esterni di seguito indicati.
          </p>
        </Section>

        <Section title="6. Destinatari e responsabili esterni (data processor)">
          <p>
            Per erogare i servizi ci avvaliamo di fornitori che trattano dati per nostro conto,
            nominati Responsabili del trattamento ex art. 28 GDPR. Nessun dato è venduto o ceduto
            a terzi per finalità di marketing.
          </p>
          <ProcessorTable />
          <p className="mt-4">
            I cookie statistici e di terze parti (Google) sono attivati{" "}
            <strong>solo previo consenso</strong>.
          </p>
        </Section>

        <Section title="7. Trasferimento dei dati fuori dall'Unione Europea">
          <p>
            Alcuni fornitori hanno sede negli Stati Uniti. I trasferimenti avvengono in presenza
            di garanzie adeguate ai sensi del Capo V del GDPR: certificazione{" "}
            <strong>EU-US Data Privacy Framework</strong> del soggetto importatore e/o{" "}
            <strong>Clausole Contrattuali Standard</strong> approvate dalla Commissione europea,
            con misure supplementari ove necessario. Puoi richiederci copia delle garanzie
            adottate.
          </p>
        </Section>

        <Section title="8. Periodi di conservazione">
          <RetentionTable />
        </Section>

        <Section title="9. Diritti dell'interessato">
          <p>
            Puoi esercitare in ogni momento i diritti previsti dagli artt. 15-22 GDPR: accesso,
            rettifica, cancellazione, limitazione, portabilità, opposizione, e revoca del consenso
            (senza pregiudizio per i trattamenti già svolti). Per esercitarli scrivi a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-navy-700 underline underline-offset-2 font-semibold"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            (oggetto: &quot;Richiesta dati GDPR&quot;); risponderemo entro 30 giorni.
          </p>
          <p>
            Hai inoltre diritto di proporre{" "}
            <strong>reclamo all&apos;Autorità Garante per la protezione dei dati
            personali</strong>{" "}
            (Piazza Venezia 11, 00187 Roma —{" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-700 underline underline-offset-2"
            >
              www.garanteprivacy.it
            </a>
            ).
          </p>
        </Section>

        <Section title="10. Modifiche">
          <p>
            Aggiorniamo la presente informativa quando cambiano i trattamenti o gli strumenti
            utilizzati. L&apos;ultima revisione è del <strong>{LAST_REVISION}</strong>.
          </p>
        </Section>

        <Section title="11. Cancellazione dati da accesso social (Facebook)" id="cancellazione-dati">
          <p>
            Se hai effettuato l&apos;accesso tramite Facebook, puoi richiedere la cancellazione
            dei dati associati al tuo account in due modi:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 mt-2">
            <li>
              <strong>Dall&apos;area riservata</strong>: accedi a{" "}
              <Link href="/portale" className="text-navy-700 underline underline-offset-2">
                /portale
              </Link>{" "}
              e cancella il tuo account dalle impostazioni del profilo.
            </li>
            <li>
              <strong>Via e-mail</strong>: scrivi a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-navy-700 underline underline-offset-2 font-semibold"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              con oggetto &quot;Cancellazione dati&quot;: elaboriamo la richiesta entro 30 giorni.
            </li>
          </ul>
          <p>
            A seguito della cancellazione, i dati personali vengono rimossi dai nostri sistemi,
            fatto salvo quanto richiesto da obblighi di legge (cfr. §8).
          </p>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-navy-100 flex flex-wrap items-center justify-between gap-4 reveal">
        <Badge variant="info">Ultima revisione: {LAST_REVISION}</Badge>
        <div className="text-sm text-ink-muted flex gap-4">
          <Link href="/cookie" className="text-navy-700 underline underline-offset-2">
            Cookie policy
          </Link>
          <Link href="/condizioni" className="text-navy-700 underline underline-offset-2">
            Condizioni di Servizio
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id}>
      <h2 className="text-2xl font-bold text-navy-900 leading-tight mb-3">{title}</h2>
      <div className="text-ink leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

interface LegalBlockProps {
  origin: string;
  url?: string;
  data: string[];
  purpose: string;
  base: string;
  retention?: string;
}

function LegalBlock({ origin, url, data, purpose, base, retention }: LegalBlockProps) {
  return (
    <div className="mt-5 bg-bg-soft border border-navy-100 rounded-[var(--radius-lg)] p-5 lg:p-6 space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-bold text-navy-900">{origin}</h3>
        {url && (
          <Link
            href={url}
            className="text-xs font-mono text-sky-600 hover:text-sky-700 underline underline-offset-2"
          >
            {url}
          </Link>
        )}
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Dati</span>
        <ul className="list-disc pl-5 mt-1.5 text-sm space-y-1">
          {data.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <Row label="Finalità" value={purpose} />
      <Row label="Base giuridica" value={base} />
      {retention && <Row label="Conservazione" value={retention} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-sky-600">{label}</span>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}

const PROCESSORS: Array<{ name: string; role: string; place: string; transfer: string }> = [
  { name: "Vercel Inc.", role: "Hosting del sito", place: "USA", transfer: "EU-US Data Privacy Framework (DPF) e/o SCC" },
  { name: "Airtable Inc.", role: "Database contatti e iscrizioni", place: "USA", transfer: "DPF e/o Clausole Contrattuali Standard (SCC)" },
  { name: "Clerk Inc.", role: "Autenticazione area riservata", place: "USA", transfer: "DPF e/o SCC" },
  { name: "SumUp Limited", role: "Gestione dei pagamenti", place: "UE (Irlanda)", transfer: "Trattamento nell'UE" },
  { name: "Cloudflare Inc. (R2)", role: "Storage documenti e foto", place: "USA / UE", transfer: "DPF e/o SCC" },
  { name: "Cloudinary Ltd", role: "Hosting e ottimizzazione immagini", place: "Israele / USA", transfer: "Decisione di adeguatezza (Israele) e/o SCC" },
  { name: "Make (Celonis)", role: "Automazioni amministrative", place: "UE", transfer: "Trattamento nell'UE" },
  { name: "Google LLC", role: "Google Maps e Google Analytics", place: "USA", transfer: "EU-US Data Privacy Framework (DPF)" },
  { name: "F.C.I. — Federazione Ciclistica Italiana", role: "Tesseramento federale", place: "Italia", transfer: "—" },
];

function ProcessorTable() {
  return (
    <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-navy-100">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-bg-soft text-left">
            <Th>Fornitore</Th>
            <Th>Funzione</Th>
            <Th>Sede</Th>
            <Th>Base trasferimento extra-UE</Th>
          </tr>
        </thead>
        <tbody>
          {PROCESSORS.map((p) => (
            <tr key={p.name} className="border-t border-navy-100 align-top">
              <Td className="font-semibold text-navy-900">{p.name}</Td>
              <Td>{p.role}</Td>
              <Td>{p.place}</Td>
              <Td>{p.transfer}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RETENTION: Array<{ context: string; period: string }> = [
  { context: "Modulo contatti", period: "24 mesi dall'ultimo contatto" },
  { context: "Iscrizione / dati associativi e fiscali", period: "Durata dell'iscrizione + 10 anni (obblighi fiscali/federali)" },
  { context: "Certificato medico", period: "Periodo di validità, poi cancellazione" },
  { context: "Cookie", period: "Vedi Cookie policy" },
];

function RetentionTable() {
  return (
    <div className="mt-1 overflow-x-auto rounded-[var(--radius-lg)] border border-navy-100">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-bg-soft text-left">
            <Th>Contesto</Th>
            <Th>Conservazione</Th>
          </tr>
        </thead>
        <tbody>
          {RETENTION.map((r) => (
            <tr key={r.context} className="border-t border-navy-100 align-top">
              <Td className="font-semibold text-navy-900">{r.context}</Td>
              <Td>{r.period}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-sky-600">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
