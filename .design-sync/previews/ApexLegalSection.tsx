import * as React from "react";
import { ApexLegalSection } from "trionoracing-next";

// Scaffolding SOLO con stili inline (mai utility Tailwind qui): il CSS è
// compilato dai sorgenti del sito. Le pagine legali reali incolonnano le
// sezioni in `max-w-[820px] … space-y-10`, riprodotto qui a mano.
const Colonna = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 820, padding: 32, display: "grid", gap: 40 }}>{children}</div>
);

/** L'uso base: titolo di sezione + corpo di paragrafi (Privacy §5). */
export const Base = () => (
  <Colonna>
    <ApexLegalSection title="5. Modalità del trattamento e sicurezza">
      <p>
        Il trattamento avviene con strumenti elettronici, adottando misure tecniche e organizzative
        adeguate (controllo degli accessi, autenticazione, cifratura in transito, conservazione su
        infrastrutture con accesso limitato). I dati sono accessibili solo a soggetti autorizzati e
        ai responsabili esterni di seguito indicati.
      </p>
      <p>
        I servizi della Scuola sono rivolti a minori, ma gli account e i consensi sono gestiti
        esclusivamente dai genitori/tutori. Non effettuiamo profilazione dei minori né marketing
        rivolto a essi.
      </p>
    </ApexLegalSection>
  </Colonna>
);

/** Corpo ricco: elenco puntato, `<strong>` e link accent — Privacy §1. */
export const ConElencoELink = () => (
  <Colonna>
    <ApexLegalSection title="1. Titolare del trattamento">
      <p>
        Il Titolare del trattamento è <strong>A.S.D. CIEMME</strong> (Associazione Sportiva
        Dilettantistica; marchio commerciale: <em>Triono Racing</em>), con sede legale in{" "}
        <strong>Via Cavour 1, 05100 Terni (TR)</strong> — sede operativa presso il Ciclodromo
        Renato Perona, Terni.
      </p>
      <ul className="list-disc pl-6 space-y-1.5 mt-2">
        <li>
          Partita IVA: <strong>01535700551</strong> — Codice Fiscale: <strong>91069070554</strong>
        </li>
        <li>
          Legale rappresentante: <strong>Giorgio Roselli</strong>
        </li>
        <li>
          E-mail:{" "}
          <a
            href="mailto:trionoracingteam@hotmail.com"
            className="text-accent underline underline-offset-2 font-semibold"
          >
            trionoracingteam@hotmail.com
          </a>{" "}
          — PEC: <strong>trionoracingteam@pec.it</strong>
        </li>
      </ul>
    </ApexLegalSection>
  </Colonna>
);

/** Il ritmo verticale reale: sezioni consecutive nella stessa colonna (Cookie policy §§3-5). */
export const InSequenza = () => (
  <Colonna>
    <ApexLegalSection title="3. Come gestire il consenso e le preferenze">
      <p>
        Al primo accesso compare un banner con cui puoi <strong>Accettare tutti</strong>,{" "}
        <strong>Rifiutare</strong> o <strong>Personalizzare</strong> le scelte per categoria.
        Disattivando i cookie necessari l&apos;area riservata non potrà mantenere il login.
      </p>
    </ApexLegalSection>
    <ApexLegalSection title="4. Durata del consenso">
      <p>
        La tua scelta viene ricordata per <strong>6 mesi</strong>; allo scadere, o in caso di
        modifiche rilevanti a questa policy, ti chiederemo nuovamente il consenso.
      </p>
    </ApexLegalSection>
    <ApexLegalSection title="5. Riferimenti">
      <p>
        Per il trattamento dei dati personali vedi l&apos;
        <a href="/privacy" className="text-accent underline underline-offset-2">
          Informativa privacy
        </a>
        . Ultima revisione: <strong>7 giugno 2026</strong>.
      </p>
    </ApexLegalSection>
  </Colonna>
);
