# Handoff: Sezione "Cosa occorre per iscriversi" — `/la-scuola` (EVO-022)

## Overview
Nuova sezione informativa della pagina pubblica `/la-scuola` (sito Triono Racing — Scuola di Ciclismo, ASD CIEMME). Spiega ai genitori, in modo semplice e rassicurante, il percorso per iscrivere il figlio: un **funnel in 4 step ordinati** (prova → registrati → iscrivi → paga) con mockup illustrati delle schermate del portale, che si chiude con una **CTA verso l'area riservata genitori**.

La sezione va inserita **dopo la galleria foto e prima della CTA finale** della pagina. Stacco di sfondo `bg-soft` per distinguerla dalla galleria sopra e dalla banda navy della CTA sotto.

## About the Design Files
I file in `prototype/` sono **reference di design realizzate in HTML/React (Babel in-browser)** — un prototipo che mostra look e comportamento attesi, **non codice di produzione da copiare**. Il compito è **ricreare questa sezione nel codebase reale** (Next.js 16 + React 19 + Tailwind v4, design system a token CSS in `@theme`) usando i pattern e i componenti già esistenti (`<SectionHeader/>`, `<Card/>`, `<Button/>`, icone Lucide + custom). I valori sono già espressi nei token del DS Triono: usali, non reintrodurre hex hardcoded.

Per aprire il prototipo: servire la cartella `prototype/` e aprire `Cosa occorre per iscriversi.html` (mostra la sezione su una design-canvas: desktop, mobile, e lo spec dello stile mockup).

## Fidelity
**High-fidelity.** Colori, tipografia, spaziature, mockup e animazioni sono definitivi e basati sul DS Triono. Ricreare la UI in modo fedele coi componenti del codebase.

## Layout di sezione (un solo H2)
Gerarchia heading: la pagina ha già un H1 → **questa sezione usa un solo `<h2>`**, i 4 titoli di step sono `<h3>`.

Container: `max-width: 1280px`, padding interno `24px` (mobile) / `48px` (desktop). Padding verticale sezione: `~104px` top / `112px` bottom desktop; `40/44px` mobile. Sfondo sezione: `bg-soft` (#FAFBFD).

Struttura desktop (dall'alto):
1. **Header** (`<SectionHeader>` pattern): eyebrow `Iscrizione` + H2 + sottotitolo, allineati a sinistra, `max-width ~760px` (sottotitolo ~540px).
2. **Connettore + nodi numerati**: riga con 4 nodi circolari (01–04) allineati alle 4 colonne sottostanti, uniti da una **linea orizzontale** che passa **dietro** i nodi.
3. **Griglia 4 colonne** (`grid-template-columns: repeat(4,1fr); gap: 24px; align-items: stretch`): le 4 card step.
4. **Banda CTA** navy-900 con pattern di brand, `margin-top: 64px`.

Mobile: stessa sequenza ma i 4 step impilati in colonna (grid `46px 1fr`), con **rail verticale numerato** (cerchio nodo + linea che scende), e **CTA a piena larghezza** in fondo.

## Contenuti (copy esatto — IT, niente lorem)
- Eyebrow: `Iscrizione`
- H2: `Iscrivere tuo figlio è semplice. Ecco come.` ("Ecco come." in `navy-500`)
- Sottotitolo: `Quattro passi, dal primo "proviamo" fino al via. Tutto online, dall'area riservata genitori.`
- **Step 01 — Vieni a provare** (`<h3>`): `Fino a 2 lezioni di prova gratuite, per capire se la scuola fa per voi. Nessun impegno.` — step **invito**, visivamente diverso: card `sun-50` con bordo giallo, icona su chip `sun-500`, badge pill `Gratis` (mono), e una **foto** (non un mockup). **Nessun pulsante proprio.**
- **Step 02 — Registrati**: `Crea il tuo account nell'area riservata genitori, bastano pochi minuti.` — mockup registrazione (campi Email/Password + pulsante "Crea account").
- **Step 03 — Crea l'iscrizione**: `Inserisci i dati di tuo figlio, carica una foto e il certificato medico valido.` — mockup form iscrizione (campi Nome/Nascita + due aree upload: Foto e Certificato medico).
- **Step 04 — Conferma e paga**: `Leggi il regolamento, salda la quota d'iscrizione e la prima rata. Sei dentro!` — mockup checkout (riepilogo voci + importo + pulsante "Paga").
- **CTA primaria**: `Inizia l'iscrizione` → **area riservata genitori**. Occhiello banda: `Pronti a partire`; titolo banda: `Bastano una foto e il certificato medico.`
- **Micro-rassicurazione** (sotto/accanto alla CTA): `Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non agonistica.`

## Componenti — specifiche dettagliate

### Eyebrow
Pattern DS esistente: inline-flex, `font-size 12px`, `font-weight 700`, `letter-spacing .1em`, `uppercase`, colore `sky-600`; trattino `::before` `width 28px; height 2px; background currentColor`, gap 12px. Variante su navy: colore `sun-500`.

### Nodo numerato (connettore)
- Cerchio `46×46px`, `border-radius 50%`. Step 01: `background sun-500`, testo `navy-900`. Step 02–04: `background navy-700`, testo `#fff`.
- Numero in **mono** (JetBrains Mono) `15px`, `font-weight 700`, `letter-spacing .04em`.
- `box-shadow: 0 0 0 6px var(--bg-soft), <shadow-sm>` → l'anello `bg-soft` "buca" la linea e fa leggere il connettore **sotto** il nodo.
- **Linea**: posizionata in `absolute`, `top: 22px` (centro nodo), `left/right: 12.5%` (= centro prima/ultima colonna), `height: 2px`, `z-index: 0`; i nodi hanno `z-index: 1`. Gradiente `linear-gradient(90deg, grass-500, sky-500, ember-500, navy-700)` a `opacity .5`.

### Card step (default 02–04)
- `background #fff`, `border 1px solid line`, `border-radius var(--radius-xl)` (20px), `box-shadow shadow-sm`, `padding 22px`, flex column, `height 100%` (stretch).
- Riga top: **chip icona** `44×44`, `border-radius radius-md` (12px), `background navy-50`, icona `navy-700` (Lucide, stroke ~1.9, size 23). (Step 01: chip `sun-500`, icona `navy-900`, + badge `Gratis`.)
- `<h3>` titolo: `21px`, `font-weight 600`, `letter-spacing -.01em`, `color ink`.
- Paragrafo: `14px`, `line-height 1.5`, `color ink-muted`.
- In fondo (flex-end): il **mockup illustrato** dentro un pannello `background bg-muted`, `border-radius radius-lg`, `padding 16px`. (Step 01: la foto, `height 188px`, `border-radius 14px`, `object-fit cover`.)

### Card invito (step 01)
- `background sun-50`, `border 1.5px solid #F2E89A`.
- Badge `Gratis`: pill mono `10.5px`/`700`/`uppercase`, `color sun-700`, `background sun-100`, `padding 5px 10px`.
- Foto: nel prototipo è un drop-slot (`<image-slot>`). In produzione → `<Image>` Next con la foto reale di bambini in bici al ciclodromo.

### Icone (Lucide)
- 01 Vieni a provare → bici (custom `BikeIcon` del DS o `Bike` Lucide)
- 02 Registrati → `UserPlus`
- 03 Crea l'iscrizione → `ClipboardList`
- 04 Conferma e paga → `CreditCard`
- Upload foto → `Image`; certificato → `HeartPulse` (idoneità medica); CTA → `ArrowRight`; checkout ok → `Check`.

### Mockup illustrati (step 02–04) — stile "disegno, non screenshot"
Vedi `screenshots/04-mockup-detail.png`. Regole:
1. **Frame finestra**: contenitore `#fff`, `border 1.5px navy-100`, `border-radius radius-lg`, shadow morbida. Barra chrome alta `30px` `background bg-muted` con 3 pallini (`#E0817E`/`#E3B765`/`#8FC07A`) e una barra URL fittizia in mono `area-genitori.triono.it`.
2. **Barre al posto dei campi**: ogni campo/voce è una barra neutra `navy-100` (o input vuoto `border line`, `background bg-soft`). **Nessun dato personale reale.**
3. **Pulsante pieno brand**: unico elemento "pieno", `background navy-700`, testo bianco, `border-radius 11px` — riprende i bottoni del sito.
4. **Accento sun**: barretta gialla `width 6px` accanto al titolo della schermata.
- Etichette consentite (chrome UI, non dati): "Crea account", "Email", "Password", "Dati del bambino", "Nome", "Nascita", "Foto", "Certificato medico", "Riepilogo e pagamento", "Paga". Importi mostrati come `€ —` (placeholder).

### Banda CTA finale
- `background navy-900`, `border-radius radius-2xl` (28px), `padding 44px 56px`, flex row space-between (wrap su mobile → colonna, bottone full-width).
- Overlay pattern di brand (`pattern.svg`) a `opacity .32` con mask gradient orizzontale (fade da sinistra). Figli con `z-index 1` sopra il pattern.
- Testo: eyebrow on-navy `Pronti a partire` (sun-500), `<h3>` `Bastano una foto e il certificato medico.` 30px/700 bianco, paragrafo micro-rassicurazione `rgba(255,255,255,.72)`.
- **Bottone** `Inizia l'iscrizione` (variante `sun`: `background sun-500`, testo `navy-900`) — è la CTA primaria, porta all'area riservata. Sotto, label mono `→ area riservata genitori`.

## Interactions & Behavior

### Entrata (scroll-in, una volta)
Gate: solo se `prefers-reduced-motion: no-preference` **E** la sezione entra nel viewport (IntersectionObserver, threshold ~0.06). Lo stato base (senza animazione) è già lo **stato finale visibile** → print/PDF/reduced-motion mostrano il contenuto. Sequenza (easing `cubic-bezier(.16,1,.3,1)`, fade-up da `translateY(18px)`/`opacity 0`):
- eyebrow `+.02s` · H2 `+.10s` · sottotitolo `+.18s`
- linea connettore: `scaleX(0→1)` da origin left, `.8s`, delay `.30s`
- nodi 01–04: pop `scale(.5→1)` (easing back `cubic-bezier(.34,1.56,.64,1)`), delay `.42s + i*.12s`
- card 01–04: fade-up, delay `.50s + i*.12s`
- banda CTA: fade-up, delay `1.05s`
- **Safety net**: dopo ~2.6s, uno stato `done` fissa tutto a visibile (`opacity 1`) anche se il clock animazioni è in pausa.

### Ambient (continue, sottili — gated reduced-motion)
- **Luce che scorre** lungo il connettore (streak bianco translucido, `~4.2s` infinite) = senso di percorso.
- Nodi: leggero "respiro" verticale (`translateY` ±3px, `4s`), scaglionato di `.5s`.
- Badge `Gratis` e i "+" degli upload: pulse `scale 1→1.07` (`2.2–2.6s`).
- Freccia CTA: nudge `translateX +4px` (`1.7s`). Bottone CTA: shadow "breathing" (`3.6s`). Pattern navy: drift lentissimo del background-position (`60s` lineare).

### Hover card (desktop)
Transizioni 220–300ms, easing DS:
- card: `translateY(-6px)` + `box-shadow shadow-lg`.
- chip icona: `scale(1.1) rotate(-5deg)` (easing back).
- mockup interno: `scale(1.03)` (origin center bottom).
- titolo: colore → `navy-600`.

## State Management
La sezione è **statica/presentazionale**: nessuno stato dati. In React serve solo lo stato locale per l'animazione d'entrata: `play` (bool, attivato da IntersectionObserver + fallback timeout ~500ms) e `done` (bool, timeout ~2600ms come safety). Nessun fetch. Il bottone CTA è un link all'area riservata.

## Design Tokens (DS Triono — già in `@theme`)
- **Navy**: 50 `#EEF1F8` · 100 `#D7DEED` · 200 `#AFBCDA` · 500 `#34528A` · 600 `#1F3D75` · **700 `#1F2D5A` (primario)** · 900 `#050E3F`
- **Sky**: 500 `#3A82C8` · 600 `#2A6BA9`
- **Sun** (accento Scuola): 50 `#FFFCE4` · 100 `#FCF6AC` · 500 `#EFE63A` · 600 `#C3BB1E` · 700 `#8C8615`
- **Grass** 500 `#5FAC36` · **Ember** 500 `#E09618` · **Flag** 500 `#C01818`
- **Neutri**: bg `#FFFFFF` · bg-soft `#FAFBFD` · bg-muted `#F2F4F9` · line `#E4E7EF` · line-soft `#EEF0F5` · ink `#14193A` · ink-muted `#6B7388`
- **Radius**: md 12 · lg 16 · xl 20 · 2xl 28 · pill 9999
- **Shadow**: sm `0 2px 6px rgba(20,25,58,.06),0 1px 2px rgba(20,25,58,.04)` · md `0 8px 20px …/.08` · lg `0 20px 40px …/.10`
- **Type**: Inter (sans) + JetBrains Mono (numerazioni/label tecniche). H2 desktop 48 / mobile 30; H3 21 (mobile 18); body 14–18; mono label 10.5–13.
- **Motion**: micro 180–220ms `ease-out`/default; entrate scroll ~600ms `cubic-bezier(.16,1,.3,1)`; stagger ~80–120ms.

## Assets
- `assets/pattern.svg` — pattern geometrico di brand (per la banda CTA navy). `assets/pattern-light.svg` incluso per riferimento.
- `assets/logo-scuola.png` — logo Scuola (riferimento brand, non usato direttamente nella sezione).
- **Foto step 01 (da fornire)**: foto reale di bambini in bici al ciclodromo durante una lezione di prova. Alt suggerita sotto.

### Alt text suggerite (SEO, IT)
- Step 01 (foto): `Bambini in bici al ciclodromo durante una lezione di prova della scuola di ciclismo Triono.`
- Step 02: `Mockup illustrato della schermata di registrazione dell'area riservata genitori.`
- Step 03: `Mockup illustrato del form di iscrizione con i dati del bambino e gli upload di foto e certificato medico.`
- Step 04: `Mockup illustrato della schermata di pagamento con riepilogo voci, importo e pulsante Paga.`

## Files (in `prototype/`)
- `Cosa occorre per iscriversi.html` — entry: monta la design-canvas con la sezione desktop, mobile e lo spec mockup.
- `iscriviti/triono.css` — token + utility (eyebrow, bottoni, pattern, keyframes entrata/ambient, hover card). **Le animazioni vivono qui.**
- `iscriviti/sections.jsx` — `DirectionA` (desktop, sezione scelta), `SectionHead`, `CtaBand`, `StepCardA`. Contiene la logica `play/done` dell'entrata.
- `iscriviti/mobile.jsx` — `MobileA` (impilato, rail numerato, CTA full-width).
- `iscriviti/mockups.jsx` — mockup illustrati (`MockRegister`, `MockIscrizione`, `MockCheckout`) + set icone (`TrIcon`).
- `iscriviti/detail.jsx` — `MockupDetail`: spec visiva dello stile mockup.
- `iscriviti/design-canvas.jsx`, `iscriviti/image-slot.js` — solo per l'anteprima (canvas + drop-foto). **Non** servono in produzione.

> Nota: `DirectionB` / `MobileB` nel sorgente sono varianti alternative non selezionate — ignorale, l'implementazione segue **A**.

## Screenshots (in `screenshots/`)
- `01-desktop-A.png` — sezione desktop completa.
- `02-mobile-A-top.png` / `03-mobile-A-bottom.png` — sezione mobile.
- `04-mockup-detail.png` — spec dello stile mockup illustrato.
