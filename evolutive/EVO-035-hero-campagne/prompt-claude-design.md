# Prompt Claude Design — EVO-035 Hero homepage dinamica multi-campagna + pagina /diventa-maestro

> Incolla questo prompt in claude.ai/design con il repo `trionoracing-next` collegato.
> Al termine esporta screenshot/bundle in `evolutive/EVO-035-hero-campagne/visual/` e torna in Cowork dicendo "visual pronti per EVO-035".

---

Sei il designer dell'evolutiva EVO-035 del sito **trionoracing.it** (Triono Racing / Scuola di Ciclismo, Terni — Next.js 16, Tailwind v4, design system custom nel repo). Lingua: solo italiano.

## Cosa devi disegnare

### Deliverable 1 — Hero homepage dinamica: 3 VARIANTI a confronto (desktop 1440px + mobile 390px)

La hero attuale (`src/components/ui/hero.tsx` + `src/components/home/HomeHero.tsx`) mostra un solo messaggio statico. Deve poter veicolare **3 comunicazioni contemporaneamente attive** (gestite da Airtable). Disegna le 3 varianti così le confrontiamo:

- **Variante A — Rotazione**: una comunicazione visibile per volta, transizione fade/slide, indicatori + **controllo pausa visibile** (obbligatorio, WCAG 2.2.2), frecce opzionali.
- **Variante B — Hero + fascia di card**: la hero resta la scena principale (messaggio primario), con una fascia di 3 tile cliccabili ancorata al bordo inferiore o subito sotto, una per comunicazione.
- **Variante C — Split multi-pannello**: messaggio principale a sinistra + colonna con 2 mini-card verticali per le altre comunicazioni, tutto above-the-fold.

**Le 3 comunicazioni reali da usare nei mockup:**

1. **VOGLIO TE** (campagna reclutamento Maestri) — eyebrow: "SCUOLA TRIONO CERCA TE" · titolo: "VOGLIO TE" (con "TE" evidenziato in giallo sun) · sottotitolo: "Diventa Maestro della nostra Scuola di Ciclismo" · CTA: "Scopri come" → /diventa-maestro · visual: cutout Nino o Vittoria che puntano il dito (asset: vedi sotto)
2. **Iscrizioni aperte** — eyebrow: "Scuola di Ciclismo · 5-12 anni" · titolo: "Le iscrizioni sono aperte" · sottotitolo: "Strada e mountain bike al Ciclodromo Renato Perona di Terni, con maestri federali" · CTA: "Iscrivi tuo figlio" → /portale/iscrizioni
3. **Allenarsi a casa** — eyebrow: "Consigli della Scuola" · titolo: "Allenarsi giocando, anche a casa" · sottotitolo: "Slalom in giardino, balance bike, prime uscite: le guide dei nostri maestri" · CTA: "Leggi le guide" → /la-scuola#allenarsi

### Deliverable 2 — Pagina pubblica `/diventa-maestro` (desktop + mobile)

Versione web del carosello social della campagna. Sezioni, dal copy kit definitivo:

1. **Hero manifesto** — omaggio "I Want You": cutout mascotte che punta il dito, eyebrow "SCUOLA TRIONO CERCA TE", h1 "VOGLIO TE" ("TE" in giallo sun su navy), sottotitolo "Diventa Maestro della nostra Scuola di Ciclismo". Valuta il riuso del primitivo `Hero` (`variant="pattern" align="center"`) prima di inventare un layout nuovo.
2. **Chi cerchiamo** — "Persone appassionate di ciclismo che vogliono trasmettere sicurezza e passione ai più giovani." Requisiti: maggiorenni · tempo libero il pomeriggio durante la settimana.
3. **Cos'è la TI2** — "TI2 = Tecnico Istruttore di 2° livello della Federazione Ciclistica Italiana, il titolo riconosciuto per insegnare in una scuola di ciclismo." Dettagli: formazione di almeno un anno, ti accompagniamo noi · date del corso FCI secondo calendario federale · nessun costo a tuo carico. **NON includere alcun riferimento a "categorie Giovanissimi 7–12 anni"** (claim non verificato).
4. **Cosa farai** — "Affiancherai i nostri giovani atleti durante le lezioni del martedì e del giovedì al ciclodromo, mettendo al centro sicurezza, divertimento e crescita."
5. **Contattaci (CTA finale)** — "Scrivici o chiamaci e raccontaci la tua passione." Tel 329 2040821 · segreteria.scuola@trionoracing.it. Seconda mascotte che punta, per chiudere il cerchio con l'hero.

_(L'admin CRUD non va disegnato: riusa 1:1 il template esistente codici-sconto.)_

## Design system — usa i token reali del repo (`src/app/globals.css`)

- **Colori**: navy-900 `#050E3F` (fondo hero/manifesto) · navy-700 `#1F2D5A` (primario) · sun-500 `#EFE63A` (accento giallo, per "TE" e highlight — a piccole dosi) · bg-soft `#FAFBFD` (chiaro) · secondari con parsimonia: sky/grass/ember. ⚠️ Il "ink" del brief campagna = `navy-900`, NON il token DS `ink` (#14193A).
- **Font**: Inter (titoli bold/extrabold + body) · JetBrains Mono per eyebrow/dati. Niente Anton (è del brand gara 209).
- **Componenti/utility esistenti da rispettare**: primitivo `Hero` (min-h 520/640px, grid 7+5, eyebrow sun con trattino, h1 clamp 40-80px), `Button` (size lg; nota: esiste `variant="hero"` pill navy-900 mai usata — proponi tu se introdurla o restare sullo stile bianco attuale `bg-white text-navy-900`), `.pattern-navy` (sfondo geometrico navy), `VideoBackdrop` (overlay navy 0.50→0.88 — la hero può avere video di sfondo caricato da Airtable), `BrandBackdrop` per sfondi pagina.
- **Asset mascotte**: cutout campagna `nino-iwantyou.png` (1384×2035) e `vittoria-iwantyou.png` (1260×1933) — pose "punta il dito", sfondo trasparente; sfondo geometrico `sfondo-geo.png`. Altre pose esistenti nel repo: `public/nino/*.webp`, `public/vittoria/*.webp`. Pattern di ancoraggio cutout: in basso, drop-shadow, come `SicurezzaReel`/`SezioneCorsi`.

## Vincoli non negoziabili (dalla verifica coerenza)

1. **H1 della homepage resta il claim statico** "In bici, sicuri, insieme." — il titolo della campagna è un elemento visivamente prominente ma semanticamente non-h1. Progetta la gerarchia visiva di conseguenza.
2. **Niente variante "vintage poster" cream + evidenza gialla**: sun su chiaro ha contrasto 1.3:1 (fallisce AA). Il giallo si usa solo su navy.
3. Se proponi la rotazione (Variante A): controllo pausa **visibile**, indicatori con tap target ≥24px (44px consigliato), tutte le slide della stessa altezza (min-h fissa esistente, no CLS).
4. Testi comunicazione con lunghezza vincolata (titolo ≤60 char, sottotitolo ≤140) — non progettare layout che reggono solo con testi più corti.
5. Mobile-first: la colonna stats attuale è nascosta sotto lg — decidi tu se le stats restano, dove, o se lasciano spazio alle comunicazioni.
6. Le 4 stats attuali (11 anni squadra · 5 maestri federali · 4 anni Scuola · 6 edizioni Marathon) possono restare, spostarsi o uscire dalla hero: proponi.
7. Niente emoji. Tono caldo, sicuro, energico ma mai aggressivo (pubblico: genitori + adulti appassionati).
8. Stato di **fallback**: mostra anche come appare la hero quando NESSUNA comunicazione è attiva (= hero statica attuale).

## Export finale

Esporta ogni artboard (3 varianti hero desktop+mobile, fallback, /diventa-maestro desktop+mobile) come screenshot/bundle in `evolutive/EVO-035-hero-campagne/visual/` del repo. Poi torna nella sessione di pianificazione e di' **"visual pronti per EVO-035"**.
