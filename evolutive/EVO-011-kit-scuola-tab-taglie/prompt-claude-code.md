# Prompt Claude Code — EVO-011 · Kit Scuola: immagini nel TabTaglie del portale

## Contesto

Arricchimento visivo del tab "Taglie" della pagina iscrizione genitore (`/portale/iscrizioni/[id]`). Oggi sono 3 select impilati senza immagini. Vanno affiancate le thumbnail dei 4 capi del kit scuola, riusando lo stesso linguaggio visivo della vetrina pubblica `/la-scuola`. Obiettivo UX: il genitore ritrova le foto del kit già viste sul sito e sceglie la taglia con sicurezza.

**Solo refactor di layout.** Nessuna modifica a stato, API, schema Airtable o logica di salvataggio.

## File coinvolti

- **Da modificare**: `src/components/portale/iscrizioni/tabs/TabTaglie.tsx` (unico file)
- **Da consumare (già in `main`, NON modificare)**: `src/lib/kit-scuola.ts` — espone `KIT_SCUOLA` (array dei 4 capi con `slug`, `nome`, `imageUrl`, `alt`, `campoTaglia`) e `cloudinaryOptimized(url, width)`.
- **Riferimento di stile (NON modificare)**: `src/components/scuola/SezioneKitScuola.tsx` — pattern `next/image` `fill` + `object-contain` su `bg-bg-soft`.
- **Mockup di riferimento**: `evolutive/EVO-011-kit-scuola-tab-taglie/visual/tab-taglie-mockup.html`

## Mapping capi → select (da `kit-scuola.ts`)

- `TAGLIA_MAGLIA` → capo `maglia` ("Maglia tecnica") → select "Taglia maglia"
- `TAGLIA_PANTALONCINO` → capo `salopette` ("Salopette tecnica") → select "Taglia pantaloncino"
- `TAGLIA_TUTA` → capi `felpa` + `pantalone-felpa` (misura unica per i due) → select "Taglia tuta" con **2 thumbnail** affiancate sopra

Recupera i capi per slug da `KIT_SCUOLA` (non per indice). Es: `const maglia = KIT_SCUOLA.find(c => c.slug === "maglia")!`.

## Cosa implementare

1. **Refactor `TagliaSelect`** in layout flex `[thumbnail][label+select]`:
   - Thumbnail: box ~84px, `bg-bg-soft`, `border border-line`, `rounded-[var(--radius-lg)]`, padding interno, con `next/image` `fill` `object-contain` usando `cloudinaryOptimized(capo.imageUrl, 200)` e `alt={capo.alt}`. Passa un `sizes` ragionevole (es. `"84px"`).
   - Aggiungi prop `id` + collega `<label htmlFor={id}>` al `<select id={id}>` (accessibilità — recepito da design-critique).
   - **Chevron**: il select usa `appearance-none`; aggiungi una `<ChevronDown>` (lucide-react) posizionata assoluta a destra (`pointer-events-none`), perché senza freccia non si capisce che è un dropdown (design-critique). Aggiungi `pr-9` al select per non sovrapporre il testo.
2. **Caso "Taglia tuta"** — nuovo sotto-componente `TagliaTutaSelect` (o variante): label + caption "felpa + pantalone, misura unica" (`text-sky-500 text-xs`), poi **2 thumbnail affiancate** (felpa + pantalone-felpa, `grid grid-cols-2 gap-3`, box più alti ~120px) sopra il select unico full-width. Stesso pattern chevron/htmlFor.
3. **Microcopy link** guida taglie: sostituisci `https://trionoracing.it` con `/la-scuola#kit-scuola`. Prima verifica se l'anchor `id="kit-scuola"` esiste su `/la-scuola` (cerca in `SezioneKitScuola.tsx` / pagina `/la-scuola`); se non esiste, usa `/la-scuola` senza anchor (e nota la scelta nel commit).
4. **Stato `confermate`**: invariato — banner grass + select `disabled`. Le thumbnail restano visibili anche da confermate (sono informative).
5. **Gap verticale uniforme** 16px (`space-y-4` o `gap-4`) tra tutte le righe, incluso il blocco tuta.

Mantieni: stato `useState`, funzione `conferma()`, PATCH a `/api/portale/iscrizioni/[id]`, costante `TAGLIE`, validazione, gestione errori, bottone primary. **Non toccarli.**

## Vincoli

- Riusa solo token DS esistenti (`--radius-*`, `--shadow-sm`, colori `ink`/`ink-muted`/`line`/`bg-soft`/`grass`/`flag`/`sky`). Nessun valore hardcoded arbitrario, nessun token nuovo.
- `next/image` per le thumbnail (host `res.cloudinary.com/duezeronove/**` già autorizzato in `next.config.ts`).
- Componente resta `"use client"`. Nessuna nuova dipendenza.

## Criteri di accettazione

- TabTaglie mostra maglia, salopette e (felpa+pantalone) con immagini reali del kit, mapping corretto ai 3 campi taglia.
- Select funzionanti, chevron visibile, label collegate via `htmlFor`.
- Salvataggio e stato confermate funzionano come prima (nessuna regressione).
- Lint, typecheck e build puliti.

## Procedura operativa (end-to-end)

1. Crea branch dedicato da `main`: `feat/evo-011-kit-scuola-tab-taglie`.
2. Implementa il refactor in un commit coeso.
3. **Quality gate**: esegui lint, typecheck e build del progetto. Risolvi tutto prima di proseguire.
4. **Smoke test guidato in dev**: avvia il dev server, apri un'iscrizione di test su `/portale/iscrizioni/[id]` → tab "Taglie". Verifica con me: thumbnail caricate, mapping capi corretto, chevron, selezione + conferma, stato confermate read-only. Verifica anche mobile (touch target select ≥44px, thumbnail non rompono il layout stretto).
5. Apri PR verso `main` con descrizione + riferimento a EVO-011.
6. **Attendi il mio OK esplicito prima del merge.** Niente merge automatico, niente push diretto su `main`.
7. Dopo merge: Vercel fa deploy automatico. Verifica che il deploy in produzione sia andato a buon fine e fai uno smoke test post-deploy sull'URL live.
8. Esegui l'auto-verifica via skill `verify-implementation` se disponibile; altrimenti produci un report manuale equivalente (coerenza con prompt, design system, criteri di accettazione). Salva l'esito in `evolutive/EVO-011-kit-scuola-tab-taglie/verifica.md`.
9. Riassumi: cosa fatto, link PR, commit hash, URL live, esito verifica.

## Deploy

Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`). Branch → PR → merge su `main` → deploy automatico. Mai push diretto su `main`, mai merge senza OK utente.
