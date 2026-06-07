import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { LEGAL, CONTACT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Condizioni di Servizio",
  description:
    "Termini e condizioni d'uso del sito Triono Racing e dell'area riservata di A.S.D. CIEMME: account, iscrizione alla Scuola, pagamenti, responsabilità, legge e foro.",
  alternates: { canonical: "/condizioni" },
};

const LAST_REVISION = "7 giugno 2026";

export default function CondizioniPage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <BreadcrumbJsonLd items={[{ name: "Condizioni", url: "/condizioni" }]} />

      <div className="reveal">
        <SectionHeader
          eyebrow="Condizioni di Servizio"
          title="Termini d'uso del sito e del portale."
          subtitle="Termini e condizioni d'uso del sito Triono Racing e dell'area riservata di A.S.D. CIEMME."
        />
      </div>

      <div className="mt-12 space-y-10 reveal reveal-delay-1">
        <Section title="1. Premessa e titolare">
          <p>
            Le presenti Condizioni di Servizio (&quot;Condizioni&quot;) disciplinano l&apos;uso del
            sito web e dell&apos;area riservata (&quot;Portale&quot;) di{" "}
            <strong>{LEGAL.name}</strong> (marchio <em>{LEGAL.brand}</em>), con sede legale in{" "}
            {LEGAL.legalAddress}, P.IVA {LEGAL.vat}, C.F. {LEGAL.taxCode}, legale rappresentante{" "}
            {LEGAL.rep} (di seguito &quot;Associazione&quot; o &quot;noi&quot;). Contatti:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-navy-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            — PEC {LEGAL.pec}.
          </p>
        </Section>

        <Section title="2. Definizioni">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              <strong>Sito:</strong> le pagine pubbliche informative.
            </li>
            <li>
              <strong>Portale:</strong> l&apos;area riservata accessibile previa registrazione
              (iscrizioni, gestione figli, pagamenti, gare).
            </li>
            <li>
              <strong>Utente:</strong> chi naviga il Sito o utilizza il Portale; per i corsi
              rivolti a minori, l&apos;Utente è il <strong>genitore/tutore</strong> esercente la
              responsabilità genitoriale.
            </li>
            <li>
              <strong>Servizi:</strong> corsi della Scuola di Ciclismo, eventi, e funzioni del
              Portale.
            </li>
          </ul>
        </Section>

        <Section title="3. Accettazione delle Condizioni">
          <p>
            L&apos;uso del Sito comporta l&apos;accettazione delle presenti Condizioni. La
            registrazione al Portale e l&apos;iscrizione ai Servizi richiedono l&apos;accettazione
            espressa delle Condizioni e dell&apos;
            <Link href="/privacy" className="text-navy-700 underline underline-offset-2">
              Informativa privacy
            </Link>
            . Se non accetti, non utilizzare il Sito né il Portale.
          </p>
        </Section>

        <Section title="4. Descrizione dei Servizi">
          <p>
            Il Sito fornisce informazioni sull&apos;Associazione, sulla Scuola di Ciclismo e sugli
            eventi. Il Portale consente al genitore/tutore di: registrare un account, iscrivere i
            figli alla Scuola, gestirne i dati e i documenti, iscriversi alle gare, visualizzare e
            pagare quote e rate. I Servizi sono erogati nei limiti della natura dilettantistica e
            associativa dell&apos;Associazione.
          </p>
        </Section>

        <Section title="5. Registrazione e account">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              La registrazione avviene tramite il fornitore di autenticazione (Clerk).
              L&apos;Utente deve essere <strong>maggiorenne</strong> e fornire dati veritieri e
              aggiornati.
            </li>
            <li>
              L&apos;Utente è responsabile della riservatezza delle credenziali e delle attività
              svolte tramite il proprio account.
            </li>
            <li>
              L&apos;account è personale; gli account dei minori non sono previsti: è il
              genitore/tutore a operare per loro conto.
            </li>
            <li>
              Possiamo sospendere o chiudere account in caso di violazione delle Condizioni, di
              dati non veritieri o di uso illecito.
            </li>
          </ul>
        </Section>

        <Section title="6. Iscrizione alla Scuola di Ciclismo">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              L&apos;iscrizione perfeziona un <strong>rapporto associativo e sportivo
              dilettantistico</strong>; non è una vendita di prodotti.
            </li>
            <li>
              L&apos;iscrizione richiede: dati anagrafici del minore,{" "}
              <strong>certificato medico</strong> idoneo all&apos;attività sportiva, accettazione
              del regolamento interno e degli eventuali consensi (incluso quello per i dati
              sanitari).
            </li>
            <li>
              L&apos;attività comporta il{" "}
              <strong>tesseramento alla F.C.I. (Federazione Ciclistica Italiana)</strong> e la
              relativa copertura assicurativa secondo le regole federali.
            </li>
            <li>
              L&apos;iscrizione si intende valida una volta completati i passaggi richiesti
              (documenti e pagamento della prima quota/rata).
            </li>
          </ul>
        </Section>

        <Section title="7. Quote, corrispettivi e pagamenti">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              Le quote di iscrizione e le eventuali rate sono indicate nel Portale al momento
              dell&apos;iscrizione.
            </li>
            <li>
              I pagamenti online sono gestiti dal fornitore <strong>SumUp</strong>; non trattiamo
              né conserviamo i dati completi della carta.
            </li>
            <li>
              Le rate hanno le scadenze indicate nel Portale. Il mancato pagamento nei termini può
              comportare la sospensione dell&apos;accesso ai Servizi e, in caso di persistente
              inadempimento, la decadenza dall&apos;iscrizione, fermo restando l&apos;obbligo di
              corrispondere le quote maturate.
            </li>
            <li>
              Le quote associative e di tesseramento, una volta avviato il rapporto, non sono di
              norma rimborsabili salvo quanto previsto al §8 e dalla legge.
            </li>
          </ul>
        </Section>

        <Section title="8. Recesso e disdetta">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              Ove l&apos;iscrizione sia qualificabile come contratto a distanza con un{" "}
              <strong>consumatore</strong>, questi ha diritto di recesso entro{" "}
              <strong>14 giorni</strong> ai sensi del Codice del Consumo (D.Lgs. 206/2005). Il
              recesso si esercita scrivendo a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-navy-700 underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </li>
            <li>
              L&apos;Utente prende atto che, <strong>richiedendo l&apos;avvio immediato del
              Servizio</strong>, in caso di recesso potrà essergli addebitato l&apos;importo
              proporzionale alle prestazioni già fruite; il diritto di recesso non si applica ai
              servizi pienamente eseguiti su sua richiesta prima della scadenza dei 14 giorni.
            </li>
            <li>Per le quote di tesseramento federale valgono inoltre le regole della F.C.I.</li>
            <li>
              La disdetta dell&apos;iscrizione per i periodi successivi si effettua con le modalità
              indicate nel regolamento interno.
            </li>
          </ul>
        </Section>

        <Section title="9. Obblighi e condotta dell'Utente">
          <p>
            L&apos;Utente si impegna a: fornire informazioni veritiere; usare il Sito e il Portale
            in modo lecito; non tentare accessi non autorizzati, non interferire con il
            funzionamento dei sistemi, non caricare contenuti illeciti o lesivi di diritti altrui;
            rispettare il regolamento della Scuola e le indicazioni dei maestri durante le attività.
          </p>
        </Section>

        <Section title="10. Proprietà intellettuale">
          <p>
            Marchi, logo &quot;Triono Racing&quot;, testi, grafica, foto e contenuti del Sito sono
            di proprietà dell&apos;Associazione o dei rispettivi titolari e sono protetti dalla
            legge. Non è consentito copiarli, riprodurli o utilizzarli senza autorizzazione
            scritta, salvo i normali usi di consultazione del Sito.
          </p>
        </Section>

        <Section title="11. Contenuti e servizi di terze parti">
          <p>
            Il Sito può integrare servizi di terzi (es. Google Maps, fornitore di pagamenti).
            L&apos;uso di tali servizi è soggetto ai relativi termini e informative. Non
            rispondiamo dei contenuti o del funzionamento di siti terzi collegati.
          </p>
        </Section>

        <Section title="12. Limitazione di responsabilità">
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              La pratica ciclistica comporta rischi tipici dell&apos;attività sportiva:
              l&apos;Utente/genitore ne è consapevole e si attiene alle norme di sicurezza e alle
              indicazioni dei maestri. Le coperture assicurative sono quelle previste dal
              tesseramento F.C.I.
            </li>
            <li>
              Ci impegniamo a erogare i Servizi con diligenza, ma non garantiamo che il
              Sito/Portale sia sempre privo di errori o ininterrottamente disponibile.
            </li>
            <li>
              Nei limiti consentiti dalla legge, non rispondiamo di danni indiretti derivanti
              dall&apos;uso del Sito/Portale. Nessuna clausola limita le responsabilità non
              escludibili per legge (incluse quelle verso i consumatori).
            </li>
          </ul>
        </Section>

        <Section title="13. Dati personali">
          <p>
            Il trattamento dei dati personali è descritto nell&apos;
            <Link href="/privacy" className="text-navy-700 underline underline-offset-2">
              Informativa privacy
            </Link>{" "}
            e nella{" "}
            <Link href="/cookie" className="text-navy-700 underline underline-offset-2">
              Cookie policy
            </Link>
            .
          </p>
        </Section>

        <Section title="14. Modifiche alle Condizioni">
          <p>
            Possiamo aggiornare le presenti Condizioni; le modifiche rilevanti saranno comunicate
            tramite il Sito o il Portale. L&apos;uso successivo alla pubblicazione comporta
            l&apos;accettazione delle Condizioni aggiornate.
          </p>
        </Section>

        <Section title="15. Legge applicabile e foro competente">
          <p>
            Le presenti Condizioni sono regolate dalla <strong>legge italiana</strong>. Per ogni
            controversia è competente il <strong>Tribunale di Terni</strong>; resta fermo, per gli
            Utenti qualificabili come consumatori, il foro inderogabile del luogo di residenza o
            domicilio del consumatore ai sensi di legge.
          </p>
        </Section>

        <Section title="16. Contatti">
          <p>
            Per qualsiasi domanda sulle presenti Condizioni:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-navy-700 underline underline-offset-2 font-semibold"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            — PEC <strong>{LEGAL.pec}</strong>.
          </p>
          <p>
            Ultima revisione: <strong>{LAST_REVISION}</strong>.
          </p>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-navy-100 flex flex-wrap items-center justify-between gap-4 reveal">
        <Badge variant="info">Ultima revisione: {LAST_REVISION}</Badge>
        <div className="text-sm text-ink-muted flex gap-4">
          <Link href="/privacy" className="text-navy-700 underline underline-offset-2">
            Informativa privacy
          </Link>
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
