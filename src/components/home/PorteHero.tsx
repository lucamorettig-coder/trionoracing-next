import { ApexCta } from "@/components/apex/ApexCta";

/**
 * Le due porte d'ingresso della home.
 *
 * Non sono due intensità dello stesso atto: sono due domande con risposta
 * ovvia, ognuna col proprio prezzo d'ingresso dichiarato. Il genitore si
 * auto-seleziona su un fatto, non su un giudizio.
 *
 * IL COMPONENTE NON HA PROP, ED È VOLUTO: è la garanzia che non possano
 * diventare tre. Se serve una terza azione, non va aggiunta qui.
 */
export function PorteHero() {
  return (
    <div className="mt-8">
      <p className="apex-eyebrow text-stage-muted">Due modi per cominciare.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {/* Porta A — la prova.
            Il colore della domanda va in `style`, NON con `text-accent`:
            `.apex-data` in apex.css è una regola unlayered che imposta
            `color: var(--stage-muted)` e batte le utility Tailwind sullo
            stesso elemento. Con la utility le due domande uscirebbero
            entrambe grigie, e né build né lint né typecheck lo vedono. */}
        <div className="flex flex-col items-start">
          <p className="apex-data" id="porta-a-domanda" style={{ color: "var(--accent)" }}>
            Tuo figlio non ha mai provato?
          </p>
          <ApexCta href="/prova" className="mt-3" aria-describedby="porta-a-domanda">
            Prenota una prova
          </ApexCta>
          {/* Il prezzo eredita `--stage-muted` da `.apex-data`: nessuna
              utility di colore, sarebbe ridondante e neutralizzata. */}
          <p className="apex-data mt-3">
            Fino a 2 lezioni, gratis · basta una bici qualsiasi e il casco
          </p>
        </div>

        {/* Porta B — l'iscrizione */}
        <div className="flex flex-col items-start">
          <p className="apex-data" id="porta-b-domanda" style={{ color: "var(--accent-2)" }}>
            Hai già deciso?
          </p>
          <ApexCta
            href="/portale/iscrizioni"
            variant="support"
            className="mt-3"
            aria-describedby="porta-b-domanda"
          >
            Iscrivi tuo figlio
          </ApexCta>
          {/* Sotto i 553px di altezza utile il prezzo di porta B scende per
              progetto: è una riga da 11px per chi ha già deciso, e quei pixel
              servono a tenere entrambe le porte sopra la piega su iPhone SE. */}
          <p className="apex-data mt-3 hidden [@media(min-height:554px)]:block">
            Tutto online · foto e certificato medico
          </p>
        </div>
      </div>
    </div>
  );
}
