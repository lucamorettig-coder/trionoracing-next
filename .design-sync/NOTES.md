# design-sync — note per questo repo

Progetto Claude Design: **APEX Design System** (`1cb02c47-0aba-4ab4-962a-8f084e7815e4`).
Scope: **solo la parte pubblica** del sito (design "APEX", `src/app/(public)`).
Il portale `/portale` e l'admin sono **volutamente fuori**: usano il DS v0.1 chiaro, un
sistema diverso e più vecchio. Non aggiungerli senza una decisione esplicita.

## Perché questo repo non è un caso standard

Non è un package di libreria, è un'**app Next.js**. Quindi niente `dist/`, niente `.d.ts`
pubblicati, e i componenti dipendono da moduli che fuori da Next non esistono.
Le conseguenze sono tutte cablate in `config.json`:

- **La lista dei componenti è `componentSrcMap`, esplicita.** Senza `.d.ts` il converter
  non ha una lista autorevole: `componentSrcMap` la definisce da sola (69 voci: 65 del repo + 4 schede
  fondamenta) e insieme
  fissa il path sorgente di ciascuna. È anche il punto in cui si aggiunge/toglie un
  componente dallo scope.
- **`entry` è un barrel generato**, `.design-sync/entry.tsx`, che ri-esporta esattamente
  quei componenti più `ApexStage`. Se cambi `componentSrcMap`, rigenera anche il barrel.
- **`tsconfig` punta a `.design-sync/tsconfig.ds.json`**, che oltre a `@/*` mappa
  `next/image`, `next/link`, `next/script`, `next/navigation` e `@clerk/nextjs` sugli
  shim in `.design-sync/shims/`.

## Trappole già pagate — non ripercorrerle

- **⚠️ Niente chiavi-commento (`"//": "..."`) in `tsconfig.ds.json`.** Il
  `tsconfigPathsPlugin` del converter strippa i `//` **anche dentro le stringhe** prima di
  fare `JSON.parse`; se il parse fallisce il plugin ritorna `null` **in silenzio** e
  smette di risolvere gli alias. Sintomo: esbuild prova a bundlare il `next` vero e
  fallisce con `Could not resolve "fs" / "stream" / "zlib"` da
  `next/dist/compiled/gzip-size`. Il tsconfig deve restare JSON puro.
- **⚠️ Lo scaffolding delle preview usa SOLO stili inline, mai utility Tailwind.**
  Il CSS è compilato dai sorgenti del **sito**: una utility che compare solo dentro
  `.design-sync/previews/` può non esistere ancora nel CSS (il CSS viene compilato prima
  che la preview sia scritta), e il risultato è silenzioso — padding a zero, testo
  tagliato, e sembra un bug del componente. Le classi proprie del DS (`apex-*`,
  `accent-word`, `stroke-word`) invece ci sono sempre. Vale doppio per i sub-agenti,
  che non possono ricompilare il CSS.
- **Il palco `[data-stage]` non è opzionale.** Tutti i token APEX sono scoped su
  `[data-stage]` (per non invadere il portale) e gli accenti su `[data-livery]`. Senza
  wrapper i token sono vuoti e tutto rende senza stile. Per questo `cfg.provider` è
  `ApexStage` (`.design-sync/shims/ApexStage.tsx`), che replica
  `src/app/(public)/layout.tsx`. Livree: `racing` (default), `scuola`, `marathon`,
  `ciclocross` — una preview di un'altra livrea si avvolge da sé.
- **Gli asset di `public/` non esistono nel bundle.** Sono ancorati a
  `https://trionoracing.it` in due punti che vanno tenuti allineati: `absolutize()` in
  `shims/next-image.tsx` (per `<Image src="/...">`) e la riscrittura degli `url("/...")`
  in `build-css.mjs` (texture di brand: `sfondo-real`, `footer-bg`). **Se il dominio
  cambia, cambiano entrambi** (la fonte di verità nel codice è `SITE_URL` in
  `src/lib/seo.ts`).
- **`docsMap` + frontmatter `category` NON rigruppa i componenti.** Il gruppo lo decide il
  path sorgente; la `category` interviene solo su gruppi generici (`general`/`misc`).
  Provato e rimosso: gli stub svuotavano solo i `.prompt.md`. I gruppi rispecchiano
  `src/components/` ed è bene così.
- **`guidelinesGlob` è `[]` di proposito.** Il default pescava `docs/make-cli-guida.md`,
  che è una guida a Make.com e non c'entra col design. Le linee guida vere stanno nel
  conventions header (`.design-sync/conventions.md`).

## Esclusioni deliberate (non sono dimenticanze)

- **4 Server Component `async`** — `HomeHero`, `CtaFinale`, `CtaScuola`, `AmatoriHero`:
  fanno fetch Airtable lato server, non possono rendere in un bundle browser. Il loro
  contenuto vero è comunque nel DS come `HeroCampagne` / `ApexCta`.
- **`GoogleAnalytics`**: non è un componente visuale.
- **`CookieBanner`, `CookiePreferences`, `CookiePreferencesButton`**: lanciano un errore
  fuori da `<ConsentProvider>`, quindi l'agente di design non può comporli da soli. Sono
  nel bundle come interni e il loro rendering si vede nella card di `ConsentProvider`.

## Font

I font arrivano da `next/font/google` (`src/app/layout.tsx`) e fuori da Next non
esistono. `.design-sync/fetch-fonts.mjs` li scarica come woff2 + `@font-face`
(`cfg.extraFonts`). **Sono committati: non serve rete al re-sync.** Rilanciarlo solo se
cambiano le famiglie o gli assi in `layout.tsx`. Archivo è variabile con asse `wdth`
(`font-stretch: 62.5% 125%`) perché il token `--font-display` la usa a 125%: se scarichi
Archivo senza quell'asse, tutti i titoli display cambiano larghezza.

## Warn noti (attesi — non sono novità da inseguire)

- `[FONT_MISSING] "Arial Narrow", "Impact"` — sono fallback di sistema dentro gli stack
  font, non famiglie da spedire. Atteso.
- `[DOCS_UNMAPPED]` su tutti i componenti — non esistono doc per-componente nel repo; i
  `.prompt.md` sono sintetizzati da `.d.ts` + preview. Atteso.

## Sequenza di build

Tre passi preparatori PRIMA di `package-build.mjs` (i primi due sono `cfg.buildCmd`;
il terzo si rilancia solo se cambiano le props dei componenti):

```
node .design-sync/build-css.mjs        # → cfg.cssEntry (Tailwind compilato)
node .design-sync/build-types.mjs      # → dist/types (albero .d.ts per l'estrazione props)
node .design-sync/build-dts-props.mjs  # → cfg.dtsPropsFor (contratti che il nativo non vede)

node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/entry.tsx --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```

Per il re-sync completo (build → diff → validate → capture, un solo verdetto):

```
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/entry.tsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

## Trappole trovate dagli agenti durante la stesura delle preview

Tutte già risolte a livello di configurazione — sono qui perché il **sintomo** è
diagnostico e ricomparirebbe identico su un componente nuovo.

- **⚠️ Immagini `loading="lazy"` in un ramo `display:none` → la cattura si APPENDE per
  sempre.** `img.decode()` su un'immagine mai caricata resta pending **senza rigettare**,
  quindi il `.catch()` di `settle()` in `package-capture.mjs` non la intercetta e non c'è
  timeout. Si è manifestato su `ApexNavBar`, che monta sempre il drawer mobile (serve per
  animarne la chiusura) con dentro un secondo logo: sopra 1024px il drawer è `display:none`
  → hang. Comparso solo alzando il viewport da 900 a 1280. **Fix: lo shim `next/image`
  emette SEMPRE `loading="eager"`** — nelle preview il lazy non porta nulla. Vale per
  qualunque componente, non solo la NavBar.
- **`process is not defined` → cella completamente BIANCA con zero errori riportati.**
  Chiunque monti `ConsentProvider` (che monta `GoogleAnalytics`, che legge una
  `NEXT_PUBLIC_*`) esplodeva al primo render. La traccia esisteva solo in
  `.design-sync/.cache/review/<Nome>.json` → `pageErrs`. **Fix: `shims/process-env.ts`,
  importato per primo dal barrel.** Quando una cella è bianca senza errori, guardare
  SEMPRE `pageErrs` in quel file prima di sospettare la preview.
- **`useConsent` lancia fuori dal suo provider** → stessa cella bianca. Colpiva
  `ApexFooter` via `CookiePreferencesButton`. **Fix: shim mirato sul solo pulsante**,
  mappato in `tsconfig.ds.json` PRIMA della regola `@/*` (il plugin usa la prima regola che
  matcha). Montare il `ConsentProvider` vero dentro `ApexStage` sarebbe stato peggio: un
  cookie banner `fixed` sopra ogni card di ogni componente.
- **⚠️ Viewport di cattura: 900×700 è sotto il breakpoint `lg` (1024px).** Tutto il sito è
  costruito su `lg:` → le sezioni rendevano in forma tablet e il chrome mostrava solo
  logo+hamburger (le due story della NavBar uscivano byte-identiche). **Fix: `cardMode:
  "column"` + `viewport: "1280x1200"` in `cfg.overrides` per le 34 sezioni di pagina.**
- **`zoom` nelle preview è un ANTI-PATTERN.** Era stato usato per far stare le sezioni nei
  700px: ma lo `zoom` finisce nella card spedita (design rimpicciolito) e le media query
  restano sul viewport reale mentre il layout usa la larghezza logica → breakpoint fantasma.
  La cura è il `viewport` in `cfg.overrides`, mai comprimere.
- **L'orologio della cattura è fissato al 2024-05-15.** Qualsiasi `target` di data assoluta
  invecchia male (la 209 del 2026 dà un countdown di ~770 giorni). Le preview con date
  calcolano il target da `Date.now()`; per mostrare uno stato "evento concluso" serve una
  data anteriore al 2024.
- **Il cookie `tr_consent` è stato CONDIVISO fra tutte le celle** (stesso contesto
  browser): una preview che lo scrive e non lo pulisce cambia in silenzio le celle
  catturate dopo. Pattern da riusare: scriverlo prima del render e cancellarlo in
  `useEffect` senza emettere `tr-consent-change`.
- **Gli URL attachment di Airtable scadono** → nelle preview usare i path di `public/`.

## Contratti delle props (`.d.ts`) — il pezzo più fragile

L'estrattore nativo riconosce le props **solo** se il tipo si chiama esattamente
`<Nome>Props`. Nel repo molti componenti usano un literal inline o un `interface Props`
generico: senza intervento **64 contratti su 65 uscivano vuoti**
(`[key: string]: unknown`), cioè l'agente di design avrebbe dovuto indovinare ogni API.

Due script coprono il buco, entrambi in `cfg.buildCmd`:
- `build-types.mjs` → emette l'albero `.d.ts` in `dist/types` con `tsc` (l'app non ne ha
  uno). `findTypesRoot()` non ha knob: cerca in ordine `build/ts`, `dist/types`, `types`,
  `lib`, `dist` — da qui la scelta del path. Gli errori tsc stampati sono preesistenti e
  vivono in `portale`/`admin`: tsc emette comunque.
- `build-dts-props.mjs` → genera `cfg.dtsPropsFor` per i casi che il nativo non vede,
  leggendo i tipi VERI da `dist/types` e inlineando quelli definiti altrove
  (`Edizione209`, `HudMetric`, …), perché il `.d.ts` spedito è isolato e non può
  importarli. **Salta i componenti che hanno già un `<Nome>Props`**: lì il nativo risolve
  meglio (segue le intersezioni tipo `& Omit<ButtonHTMLAttributes…>`).

⚠️ **Un contratto troncato resta TypeScript valido** (`strin` sembra un nome di tipo) e
NESSUN gate lo segnala. Se si tocca `build-dts-props.mjs`, ri-eseguire il controllo che
ogni riga chiuda con `;`, `{` o `}`.

## Le fondamenta sono schede aggiunte da noi

`FondamentaTipografia`, `FondamentaColori`, `FondamentaSpaziature`, `FondamentaAtomi`
(in `.design-sync/fondamenta/`) **non esistono nel repo**: sono pannelli di riferimento
scritti per questo sync, perché in APEX tipografia/colori/spaziature sono token CSS e non
componenti — senza di loro il design system non aveva schede sfogliabili per le fondamenta.
Rendono i token con le `var()` reali (nessun valore ricopiato → non possono divergere) e
`FondamentaAtomi` importa il vero `ApexCta`. Sono dichiarate come "da consultare, non da
comporre" nel conventions header.

`cfg.tokensGlob` è stato rimosso: non produceva nulla e i token viaggiano comunque dentro
`_ds_bundle.css`, raggiungibile dalla closure di `styles.css`.

## Rischi per il prossimo sync (cosa può marcire in silenzio)

- **Gli asset ancorati a `trionoracing.it`**: se una foto viene rinominata o rimossa dal
  sito, la preview mostra l'alt text e **nessun gate se ne accorge** (il render check
  guarda che il root non sia vuoto, non le immagini). Un'occhiata ai contact sheet dopo
  un restyle degli asset vale il tempo che costa.
- **`componentSrcMap` è una fotografia**: un componente pubblico nuovo NON entra da solo,
  e uno rinominato/spostato fa fallire il build. Rigenerare barrel + mappa quando
  `src/components/` cambia forma.
- **Gli shim `next/*` sono approssimazioni**: `next/image` diventa un `<img>` (niente
  optimizer, niente `srcset`), `next/link` un `<a>`. Se un componente inizia a dipendere
  da comportamenti veri di Next (router, `useSearchParams` con valori), lo shim va esteso.
- **Clerk è finto come "non autenticato"**: `ApexNavBar` mostra quindi sempre la CTA da
  visitatore. È lo stato giusto per un design system pubblico, ma è una scelta, non un
  caso.
- **Le props dei componenti Marathon 209 sono inventate nelle preview** a partire dai tipi
  di `src/lib/airtable-209.ts`: se quei tipi cambiano, le preview vanno riallineate a mano.
- **Le fondamenta sono nostre, non del repo**: se APEX cambia scala tipografica, palette o
  spaziature, quelle 4 schede vanno riviste a mano — nessun gate se ne accorge (rendono
  `var()` reali, quindi i CAMPIONI si aggiornano da soli, ma l'elenco dei token e le note
  d'uso no).
- **`dist/types` è rigenerato a ogni build**: se il repo diventa type-clean o cambia
  `tsconfig`, ricontrollare che `build-types.mjs` emetta ancora (il controllo c'è: lancia
  se la cartella è vuota).
- **Gli override di viewport sono tarati sulle altezze attuali** delle sezioni (misurate
  entro 1200px). Una sezione che cresce molto verrà tagliata nella card: alzare il suo
  `viewport`, mai reintrodurre lo `zoom`.
