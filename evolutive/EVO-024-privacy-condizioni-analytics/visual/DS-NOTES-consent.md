# DS Notes — Cookie Consent Banner + Preferences Modal (EVO-024)

Output skill `design:design-system` (modalità *extend*). Pattern nuovo coerente col DS Triono Racing.
Mockup interattivo: [`consent-banner-mockup.html`](consent-banner-mockup.html).

## Problema

Con l'introduzione di Google Analytics 4 serve un meccanismo di consenso preventivo (GDPR + linee guida Garante 2021 + Consent Mode v2). Nessun componente di consenso esiste oggi nel DS.

## Pattern esistenti riusati

| Componente | Cosa si riusa | Cosa manca |
|------------|---------------|------------|
| `Button` | varianti `primary`/`outline`/`ghost`, size, focus-ring | — |
| `Dialog` (Radix) | overlay + content + animazioni `ds-modal-in/out` | contenuto a righe-categoria |
| `Badge` | pill "Necessario"/"Statistici" | — |
| token colore/shadow/radius | tutti | nessun nuovo token |

## Decisioni di design (con razionale compliance)

1. **Pari prominenza Accetta / Rifiuta** (anti dark-pattern, EDPB 03/2022 + Garante): entrambi bottoni pieni di pari dimensione. `Accetta tutti` = `sun-500` bg + `navy-900` text (CTA brand, come "Iscrivimi" del footer); `Rifiuta` = `navy-700` bg + white (variant primary). `Personalizza` = azione terziaria (ghost/link navy-700 underline). Reject deve essere raggiungibile **con un click** allo stesso livello di Accept.
2. **Tre categorie**: `Necessari` (sempre ON, toggle disabilitato), `Statistici · Google Analytics` (default OFF), `Mappe · Google Maps` (default OFF). Default = tutto negato finché l'utente non sceglie.
3. **Toggle/switch** (nuovo micro-primitivo): track 44×24, knob 20px, ON = `grass-500` (verde "attivo" del DS), OFF = `navy-200`, disabled = `bg-muted` + knob `line`. Focus-ring `navy-700/20` come i Button. `role="switch"` + `aria-checked`.
4. **Banner**: barra fixed in basso, `bg` bianco, `border-top line`, `shadow-lg` verso l'alto, `radius` 0 (full-bleed). Su mobile i bottoni vanno full-width in colonna; su desktop testo a sinistra, azioni a destra. Max-width contenuto 1280px allineato al resto del sito.
5. **Modal preferenze**: riusa `Dialog` (overlay navy/40 + card bianca centrata, `radius-lg`, `shadow-lg`, max-width ~520px). Header titolo + X; body 3 righe categoria; footer 3 azioni (`Rifiuta tutti` ghost · `Salva preferenze` outline · `Accetta tutti` sun).
6. **Maps placeholder**: box `bg-muted` `radius-lg` border `line`, icona mappa `ink-muted`, testo "Per vedere la mappa accetta i cookie di Google Maps" + bottone `Carica la mappa` (outline) + link "Gestisci preferenze". Sostituisce l'iframe finché non c'è consenso `mappe`.

## Stati

| Elemento | Stati |
|----------|-------|
| Banner | visibile (nessuna scelta salvata) · nascosto (scelta presente e non scaduta) · re-shown (scaduto 6 mesi o versione policy cambiata) |
| Toggle | on · off · disabled-on (necessari) · focus |
| Modal | closed · open (da "Personalizza" o da "Preferenze cookie" nel footer) |
| Maps | placeholder (no consenso) · iframe caricato (consenso) |

## Accessibilità

- Banner: `role="dialog"` `aria-label="Preferenze cookie"` `aria-live` all'apparire; focus trap leggero opzionale, ma NON bloccare la navigazione del sito (il banner non è modale bloccante — l'utente può continuare a leggere; GA semplicemente non parte).
- Bottoni: tutti raggiungibili da tastiera, ordine DOM = Accetta / Rifiuta / Personalizza.
- Toggle: `role="switch"`, `aria-checked`, label collegata, attivabile con Spazio/Invio.
- Modal: gestione focus/Escape di Radix `Dialog`.
- Contrasto: testo `ink` su bianco (AAA); `navy-900` su `sun-500` verificato AA per testo bottone.

## Tokens usati

- Colori: `bg`, `bg-soft`, `bg-muted`, `line`, `ink`, `ink-muted`, `navy-200/700/900`, `sun-500/600`, `grass-500`, `sky-600` (link).
- Radius: `--radius-md` (bottoni sm), `--radius-lg` (card/modal), `--radius-pill` (toggle track).
- Shadow: `--shadow-lg` (banner + modal).
- Font: Inter (`--font-sans`).

## Open questions (risolte)

- ~~Accept/Reject prominence~~ → pari peso (deciso).
- ~~Banner bloccante?~~ → no, non-modale; il sito resta navigabile, GA gated.
- ~~Categoria Maps separata?~~ → sì, toggle dedicato (l'utente ha scelto il gating Maps in Fase 4).

## Fix da `design:design-critique` (da rispettare in implementazione)

1. **Footer modal senza bias (GDPR/EDPB)** — APPLICATO al mockup: `Salva preferenze` = primario (sun); `Rifiuta tutti` e `Accetta tutti` = pari peso (outline). Mai rendere "Accetta" più prominente di "Rifiuta" nemmeno nel modal.
2. **X del modal = cancel** — chiudere il modal (X / Escape / click overlay) NON salva alcun consenso: torna allo stato precedente (banner se nessuna scelta pregressa). Nessun consenso implicito.
3. **Riga categoria cliccabile** — l'intera riga (label + descrizione) attiva il toggle, per un target ampio; il toggle resta `role="switch"` focusabile.
4. **Badge** — in implementazione usare il primitivo `Badge` esistente (`variant="info"` per "Sempre attivi", `variant="warning"` o sun per "Google Analytics/Maps"), non un badge inline custom.
5. **Contrasto descrizioni** — `ink-muted` ≥13px (AA ~4.5:1); non scendere sotto.
6. **Copy Maps placeholder** — chiarire che "Carica la mappa" attiva e ricorda il consenso Maps (es. helper "Caricando attivi i cookie di Google Maps").

