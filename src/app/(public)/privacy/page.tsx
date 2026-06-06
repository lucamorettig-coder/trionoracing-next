import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "@/components/ui/icons";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Informativa privacy",
  description:
    "Informativa privacy del sito Triono Racing (ASD CIEMME) ai sensi del Reg. UE 2016/679 (GDPR).",
  alternates: { canonical: "/privacy" },
  robots: { index: false }, // bozza tecnica, non indicizzare finché legale non valida
};

const LAST_REVISION = "20 maggio 2026";

export default function PrivacyPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <BreadcrumbJsonLd items={[{ name: "Privacy", url: "/privacy" }]} />

      <div className="reveal">
        <SectionHeader
          eyebrow="Informativa privacy"
          title="Come trattiamo i tuoi dati."
          subtitle="Documento ai sensi del Reg. UE 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modifiche."
        />
      </div>

      {/* Banner stato documento */}
      <div className="mt-8 bg-sun-50 border-l-4 border-sun-500 px-5 py-4 rounded-r-[var(--radius-md)] reveal">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-sun-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-ink leading-relaxed">
            <strong>Bozza tecnica in attesa di revisione legale.</strong>{" "}
            Questo testo descrive accuratamente quali dati il sito raccoglie e come, ma
            l&apos;informativa privacy definitiva deve essere prodotta da uno strumento legale
            (es. <a href="https://www.iubenda.com" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">iubenda</a>)
            o redatta da un avvocato. Per qualsiasi richiesta sui tuoi dati scrivici a{" "}
            <a href="mailto:info@trionoracing.it" className="text-navy-700 underline underline-offset-2 font-semibold">info@trionoracing.it</a>.
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-10 reveal reveal-delay-1">
        <Section title="1. Titolare del trattamento">
          <p>
            Il titolare del trattamento è <strong>ASD CIEMME</strong> (brand commerciale:
            Triono Racing), con sede operativa al Ciclodromo Renato Perona, Terni (TR).
            Per qualsiasi richiesta puoi scriverci a{" "}
            <a href="mailto:info@trionoracing.it" className="text-navy-700 underline underline-offset-2">info@trionoracing.it</a>.
          </p>
        </Section>

        <Section title="2. Quali dati raccogliamo, da dove, perché">
          <p>Il sito raccoglie dati personali in tre contesti distinti:</p>
          <DataBlock
            origin="Form contatti pubblico"
            url="/contatti"
            data={[
              "Nome (obbligatorio)",
              "Cognome (opzionale)",
              "Email (obbligatoria)",
              "Telefono (opzionale)",
              "Motivo della richiesta (Scuola / Tesseramento / Marathon / Altro)",
              "Testo del messaggio",
              "Consenso esplicito al trattamento (checkbox obbligatoria)",
              "User-Agent del browser e URL di provenienza (per debugging e anti-spam)",
            ]}
            purpose="Rispondere alla tua richiesta di informazioni e archiviare la conversazione per follow-up."
            base="Art. 6.1.b GDPR (esecuzione di misure precontrattuali su tua richiesta)."
            retention="2 anni dall'ultimo contatto, salvo successivo tesseramento (vedi punto 3)."
            storage="Tabella Airtable CONTATTI, base privata di ASD CIEMME, accesso limitato ai responsabili Triono."
          />
          <DataBlock
            origin="Area riservata genitori (futuro)"
            url="/portale"
            data={[
              "Email + password (gestiti da Clerk, provider terzo certificato GDPR)",
              "In Fase 3 anche: dati anagrafici tuoi, dati anagrafici figli iscritti, certificato medico, ricevute pagamento",
            ]}
            purpose="Gestire le iscrizioni alla Scuola di Ciclismo, le quote e i documenti."
            base="Art. 6.1.b GDPR (esecuzione del contratto di iscrizione) + Art. 9 GDPR (categorie particolari, certificato medico, con consenso esplicito)."
            retention="Per la durata dell'iscrizione + 10 anni (obblighi fiscali e federali FCI)."
            storage="Clerk per autenticazione; Airtable per dati anagrafici e documenti."
          />
          <DataBlock
            origin="Navigazione e cookie tecnici"
            url="/cookie"
            data={[
              "Cookie di sessione strettamente necessari (vedi pagina Cookie)",
              "Nessun cookie di profilazione o tracker di terze parti",
            ]}
            purpose="Far funzionare il sito (sessione utente, anti-CSRF, prevenzione frode)."
            base="Art. 6.1.f GDPR (legittimo interesse) + esenzione consenso cookie tecnici (Provv. Garante 8 maggio 2014)."
            retention="Durata della sessione browser, salvo cookie persistenti tecnici (max 12 mesi)."
            storage="Browser dell'utente. Nessun trasferimento a server di profilazione."
          />
        </Section>

        <Section title="3. Conservazione dati form contatti">
          <p>
            Se dalla richiesta nasce un&apos;iscrizione alla Scuola, i dati confluiscono nella
            scheda iscritto e seguono le regole di conservazione del punto 2 area riservata.
            Se rimane una richiesta informativa senza follow-up, conserviamo i dati per 2
            anni dall&apos;ultimo contatto, poi cancellazione automatica.
          </p>
        </Section>

        <Section title="4. Trasferimento dati a terzi">
          <p>I tuoi dati sono trattati da questi <em>responsabili esterni</em> in qualità di processor:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong>Vercel Inc.</strong> (USA): hosting del sito web. Trasferimento extra-UE
              su base di Standard Contractual Clauses (SCC).
            </li>
            <li>
              <strong>Airtable Inc.</strong> (USA): database dei contatti e delle iscrizioni.
              Trasferimento extra-UE su base SCC.
            </li>
            <li>
              <strong>Clerk Inc.</strong> (USA): autenticazione area riservata. SCC.
            </li>
            <li>
              <strong>Google LLC</strong> (USA): embed mappa per pagina home (sezione Come
              raggiungerci). Quando carichi la pagina, Google riceve il tuo IP.
            </li>
          </ul>
          <p className="mt-4">
            Nessun dato è venduto, ceduto o utilizzato per profilazione pubblicitaria.
          </p>
        </Section>

        <Section title="5. I tuoi diritti">
          <p>In qualsiasi momento puoi esercitare i diritti previsti dagli artt. 15-22 GDPR:</p>
          <ul className="list-disc pl-6 space-y-1.5 mt-3">
            <li>Accesso ai dati che abbiamo su di te</li>
            <li>Rettifica o aggiornamento</li>
            <li>Cancellazione (&quot;diritto all&apos;oblio&quot;)</li>
            <li>Limitazione del trattamento</li>
            <li>Portabilità dei dati in formato strutturato</li>
            <li>Opposizione al trattamento</li>
            <li>Revoca del consenso (per quanto basato sul consenso)</li>
            <li>Reclamo all&apos;Autorità Garante per la Protezione dei Dati Personali</li>
          </ul>
          <p className="mt-4">
            Per esercitare uno qualsiasi di questi diritti, scrivici a{" "}
            <a href="mailto:info@trionoracing.it" className="text-navy-700 underline underline-offset-2 font-semibold">
              info@trionoracing.it
            </a>{" "}
            con oggetto &quot;Richiesta dati GDPR&quot;. Rispondiamo entro 30 giorni.
          </p>
        </Section>

        <Section title="6. Modifiche all'informativa">
          <p>
            Aggiorniamo questa pagina ogni volta che cambiano i trattamenti dei dati o gli
            strumenti tecnici utilizzati. L&apos;ultima revisione è del <strong>{LAST_REVISION}</strong>.
          </p>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-navy-100 flex flex-wrap items-center justify-between gap-4 reveal">
        <Badge variant="warning">Bozza · ultima revisione {LAST_REVISION}</Badge>
        <div className="text-sm text-ink-muted">
          Vedi anche:{" "}
          <Link href="/cookie" className="text-navy-700 underline underline-offset-2">
            Cookie policy
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-navy-900 leading-tight mb-3">{title}</h2>
      <div className="text-ink leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

interface DataBlockProps {
  origin: string;
  url: string;
  data: string[];
  purpose: string;
  base: string;
  retention: string;
  storage: string;
}

function DataBlock({ origin, url, data, purpose, base, retention, storage }: DataBlockProps) {
  return (
    <div className="mt-5 bg-bg-soft border border-navy-100 rounded-[var(--radius-lg)] p-5 lg:p-6 space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-bold text-navy-900">{origin}</h3>
        <Link href={url} className="text-xs font-mono text-sky-600 hover:text-sky-700 underline underline-offset-2">
          {url}
        </Link>
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Dati raccolti</span>
        <ul className="list-disc pl-5 mt-1.5 text-sm space-y-1">
          {data.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </div>
      <Row label="Finalità" value={purpose} />
      <Row label="Base giuridica" value={base} />
      <Row label="Conservazione" value={retention} />
      <Row label="Dove sono memorizzati" value={storage} />
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
