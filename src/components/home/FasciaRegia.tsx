import * as React from "react";
import {
  getComunicazioniHeroAttive,
  soloAppuntamenti,
  formatDataEvento,
} from "@/lib/comunicazioni-hero";
import { getSiteSettings } from "@/lib/site-settings";
import { whatsappHref, MESSAGGIO_PROVA } from "@/lib/whatsapp";

/**
 * Fascia di regia — il livello operativo della home (EVO-046).
 *
 * Sostituisce HomeTicker, che era hardcoded e ha annunciato per sei
 * settimane una gara del 28 giugno già passata. Qui i tre slot hanno tre
 * proprietari diversi:
 *
 *   ① LA PROVA        cablato nel codice, non può sparire
 *   ② IN PROGRAMMA    da Airtable, scade da solo per data
 *   ③ ALLENAMENTI     cablato, cambia una volta l'anno
 *
 * Lo slot ① NON ha un bottone pieno: l'azione piena la porta già la porta A
 * della hero, e ripeterla produrrebbe quattro CTA con due sole etichette
 * nel primo viewport desktop.
 */

/**
 * `**parola**` → evidenza accent di livrea. Stesso identico trattamento di
 * `renderTitolo` in `HeroCampagne.tsx` (colore/classe `accent-word`, `<em>`
 * non-italic solo per lo stile). Dopo il prossimo task `HeroCampagne.tsx`
 * viene rimosso e questa fascia resta l'unico consumatore del campo
 * `titolo` — un solo consumatore non giustifica estrarre un modulo
 * condiviso, quindi il parser vive qui, non in `comunicazioni-hero.ts`.
 */
function renderTitolo(titolo: string): React.ReactNode {
  const parts = titolo.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <em key={i} className="not-italic accent-word">
          {m[1]}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export async function FasciaRegia() {
  const [comunicazioni, settings] = await Promise.all([
    getComunicazioniHeroAttive(),
    getSiteSettings(),
  ]);

  const wa = whatsappHref(settings["scuola-telefono"], MESSAGGIO_PROVA);
  // Solo gli appuntamenti, in ordine di data: lo slot annuncia date, e una
  // campagna senza data sotto "In programma" non è un appuntamento.
  const [primo, ...altri] = soloAppuntamenti(comunicazioni);

  return (
    <section className="border-y border-stage-line bg-stage-surface">
      <div className="apex-wrap grid grid-cols-1 gap-8 py-10 md:grid-cols-3 md:gap-10">
        {/* ① La prova.
            Colore in `style`, NON con `text-accent`: `.apex-eyebrow` è una
            regola unlayered che fissa `color: var(--stage-muted)` e batte le
            utility Tailwind sullo stesso elemento — il titolo uscirebbe
            grigio come gli altri due, perdendo l'unico accento della fascia.
            Stessa trappola documentata in PorteHero. */}
        <div>
          <p className="apex-eyebrow" style={{ color: "var(--accent)" }}>
            La prova · subito
          </p>
          <p className="mt-2 text-[15px] leading-relaxed">
            Due lezioni gratuite, senza iscriversi.
          </p>
          {wa ? (
            <a
              href={wa}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
            >
              Scrivi su WhatsApp
              <span aria-hidden>→</span>
            </a>
          ) : (
            <a
              href="/prova"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
            >
              Come prenotare
              <span aria-hidden>→</span>
            </a>
          )}
        </div>

        {/* ② In programma — da Airtable, un evento alla volta */}
        <div>
          {/* Nessuna utility di colore: `.apex-eyebrow` fissa già
              `--stage-muted`, e la utility sarebbe morta. */}
          <p className="apex-eyebrow">In programma</p>
          {primo ? (
            <>
              <p className="mt-2 text-[15px] font-semibold leading-snug">
                {primo.dataEvento ? (
                  <span className="text-accent">{formatDataEvento(primo.dataEvento)} · </span>
                ) : null}
                {renderTitolo(primo.titolo)}
              </p>
              {primo.sottotitolo ? (
                <p className="mt-1 text-[14px] leading-relaxed text-stage-muted">
                  {primo.sottotitolo}
                </p>
              ) : null}
              {primo.ctaUrl && primo.ctaLabel ? (
                <a
                  href={primo.ctaUrl}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
                >
                  {primo.ctaLabel}
                  <span aria-hidden>→</span>
                </a>
              ) : null}
              {altri.length > 0 ? (
                // Generata, max 1 riga (specifica di design): con 3+ comunicazioni
                // attive `line-clamp-1` tronca con ellissi invece di andare a capo
                // e sbilanciare l'altezza delle tre colonne della fascia.
                <p className="apex-data mt-3 text-stage-muted line-clamp-1">
                  Poi:{" "}
                  {altri.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && " · "}
                      {c.dataEvento ? `${formatDataEvento(c.dataEvento)} ` : ""}
                      {renderTitolo(c.titolo)}
                    </React.Fragment>
                  ))}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[14px] leading-relaxed text-stage-muted">
              Nessun appuntamento in programma al momento.
            </p>
          )}
        </div>

        {/* ③ Allenamenti */}
        <div>
          <p className="apex-eyebrow">Allenamenti</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            Martedì strada · Giovedì MTB
            <br />
            17:00–18:30, Ciclodromo Renato Perona, Terni
          </p>
          <a
            href="/la-scuola"
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
          >
            Come funziona la Scuola
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
