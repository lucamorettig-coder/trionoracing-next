# EVO-011 — Kit Scuola: immagini nel TabTaglie del portale

- **ID**: EVO-011
- **Slug**: kit-scuola-tab-taglie
- **Data inizio**: 2026-05-23
- **Data fine**: 2026-06-06
- **Stato**: completata (PR #37 mergeata, deploy produzione READY)
- **Tipo**: arricchimento visivo (modifica feature esistente)
- **Area**: area autenticata (`/portale/iscrizioni/[id]` — tab "Taglie")
- **Priorità**: media (segue il ciclo di EVO-004)
- **Evolutiva ombrello**: [EVO-009](EVO-009-kit-scuola.md)

---

## 1. Requisiti

Eredita dall'ombrello [EVO-009](EVO-009-kit-scuola.md) — vedi sezione 1.

**Star statement (UX)**: il genitore, in fase di iscrizione, ritrova esattamente le stesse foto del kit viste sul sito pubblico — senza dubbi, riconosce capi già amati e sceglie la taglia con sicurezza.

**Scope di EVO-011**:
- Ristrutturare ogni riga `<TagliaSelect>` in `TabTaglie.tsx` con thumbnail capo + label/select affiancati
- Caso speciale "Taglia tuta" → 2 thumbnail (felpa + pantalone-felpa) sopra al selettore unico
- Microcopy: link "Trovi la guida taglie..." può puntare a `/la-scuola#kit-scuola`

---

## 2. Ambito

### In scope

- `src/components/portale/iscrizioni/tabs/TabTaglie.tsx` (ristrutturazione layout, no logica nuova)
- Import e consumo di `src/lib/kit-scuola.ts` (prodotto da EVO-010)
- Microcopy link aggiornato

### Out of scope

- Sezione pubblica `/la-scuola` (→ EVO-010)
- Modifiche schema Airtable
- Modifiche al wizard nuova iscrizione

### Dipendenze critiche

- **Blocca EVO-011 finché**:
  1. EVO-010 mergiata in `main` (file `src/lib/kit-scuola.ts` esistente)
  2. Branch `evo-004-portale-iscrizioni` aggiornato con `main` (via `git merge main` o rebase)

---

## 3. Analisi as-is

Vedi [EVO-009 §3](EVO-009-kit-scuola.md#3-analisi-as-is). Punti specifici:

- `TabTaglie.tsx` oggi: 3 `<TagliaSelect>` semplici, `max-w-xl`, struttura `<section>` con `bg-white border-line rounded-xl shadow-sm`
- Componente custom `TagliaSelect` interno (label + select stile DS)
- Stato gestito via `useState` + PATCH a `/api/portale/iscrizioni/[id]`

---

## 4. Soluzione e WBS

### Soluzione proposta

Refactor di `<TagliaSelect>` da `<label>` semplice a layout flex `[thumbnail][label+select]` per maglia e pantaloncino. Per "Taglia tuta" introduce variante speciale con due thumbnail affiancate sopra al select. Tutto consuma `src/lib/kit-scuola.ts` per URL e descrizioni.

### WBS

1. **Pre-requisito** (S)
   - 1.1 Verificare che EVO-010 sia mergiata in `main`
   - 1.2 Sul branch `evo-004-portale-iscrizioni`, fare `git merge main` per portare `kit-scuola.ts`

2. **Refactor TabTaglie (M)**
   - 2.1 Ristrutturare `TagliaSelect` con prop `thumbnailSrc`, `thumbnailAlt`
   - 2.2 Caso speciale "Taglia tuta" — nuovo componente `TagliaTutaSelect` con 2 thumbnail
   - 2.3 Aggiornare microcopy link guida taglie

3. **Quality gate (S)**
   - 3.1 Lint + typecheck + build sul branch
   - 3.2 Smoke test in dev: aprire iscrizione di test, verificare layout TabTaglie

### Rischi

- **R1**: se EVO-004 viene mergiata in `main` prima di EVO-010, il merge del branch evo-004 con main porterà comunque kit-scuola.ts senza conflitti (file nuovo)
- **R2**: se in futuro `TabTaglie.tsx` viene modificato in altri PR sul branch evo-004, possibile conflitto locale (basso impatto, scope contenuto)

---

## 5. Verifica coerenza

_Completata [2026-06-06]._

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | Nessun token nuovo. Riuso `next/image fill object-contain` + `bg-bg-soft` + `rounded-[var(--radius-xl)]` da `SezioneKitScuola`. Thumbnail piccole accanto al select. |
| Architettura | ✅ | Solo refactor di `TabTaglie.tsx` (client). Nessuna modifica a stato, API o schema. Consuma `KIT_SCUOLA` + `cloudinaryOptimized` da `src/lib/kit-scuola.ts`. |
| i18n | ✅ n/a | Portale solo IT. |
| SEO | ✅ n/a | Area autenticata non indicizzata. |
| Microcopy | ⚠️→fix | Link guida taglie oggi `https://trionoracing.it` generico → puntare a `/la-scuola#kit-scuola` (verificare esistenza anchor; fallback `/la-scuola`). |

**Dipendenze già soddisfatte**: `src/lib/kit-scuola.ts` in `main` (con helper `cloudinaryOptimized` + mapping `campoTaglia`); `next.config.ts` autorizza già `res.cloudinary.com/duezeronove/**`.

---

## 6. UX/UI

_Completata [2026-06-06] — percorso (b) skill `design:design-system`._

- **Mockup**: [`visual/tab-taglie-mockup.html`](EVO-011-kit-scuola-tab-taglie/visual/tab-taglie-mockup.html) — due stati (da-confermare / confermate). Box colorati = placeholder delle immagini Cloudinary reali (validazione layout).
- **Layout**: riga `[thumbnail 84px][label + select]` per maglia e pantaloncino. Caso "Taglia tuta" = label full-width + 2 thumbnail (felpa + pantalone-felpa) affiancate sopra un select unico → la rottura di griglia comunica "misura unica per due capi".

### Esito `design:design-critique`

Nessun blocker. Correzioni recepite nel prompt Claude Code:
1. **Chevron sui select** — `appearance:none` toglie l'indicatore dropdown → aggiungere `ChevronDown` (lucide) posizionata assoluta a destra del select.
2. **`alt` reali + `<label htmlFor>`** — collegare ogni select alla label (`htmlFor`/`id`) e usare `capo.alt` da `kit-scuola.ts` come alt delle thumbnail.
3. **Gap verticale uniforme** 16px tra tutte le righe incluso il blocco tuta.
- Confermati buoni: touch target select 44px ✅, contrasto colori ✅, riuso linguaggio visivo pubblico ✅, distinzione "tuta" giustificata ✅.

---

## 7. Prompt per Claude Code

_Compilato [2026-06-06]._ Vedi [`EVO-011-kit-scuola-tab-taglie/prompt-claude-code.md`](EVO-011-kit-scuola-tab-taglie/prompt-claude-code.md) (anche mostrato in chat).

### Deploy: pattern del progetto

Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`). Pattern: branch dedicato → PR → merge su `main` → deploy automatico. Mai push diretto su `main`, mai merge senza OK utente.

---

## 8. Verifica e go-live

_Chiusa [2026-06-06]._

- **Esito**: ✅ coerente. Implementazione allineata al prompt + correzioni in iterazione (taglie reali dallo schema, micro foto da `kit-scuola.ts`, microcopy rimosso su richiesta utente, fix design-critique).
- **PR**: [#37](https://github.com/lucamorettig-coder/trionoracing-next/pull/37) — squash merge, commit `2ff3110`.
- **Deploy produzione**: Vercel `dpl_5ksZ2MA…` stato **READY**, target production.
- **URL**: https://trionoracing-next.vercel.app/portale/iscrizioni/[id] → tab "Taglie" (area autenticata).

### Verifica per dimensione

| Dimensione | Esito | Nota |
|---|---|---|
| Funzionale | ✅ | 3 select con opzioni corrette dallo schema; "Taglia tuta" con misura unica + 2 foto. |
| Bug latente | ✅ risolto | Opzioni `XS–XXL` hardcoded → 422 al salvataggio. Allineate a `5XS–XS` / `110/120`–`130/140` via `TAGLIE_PER_CAMPO`. |
| Design system | ✅ | Solo token esistenti; riuso `next/image fill object-contain` + `bg-bg-soft`. Nessun token nuovo. |
| Architettura | ✅ | Refactor isolato di `TabTaglie.tsx` + additivo su `kit-scuola.ts`. Nessuna modifica a stato/API/schema. |
| A11y | ✅ | `<label htmlFor>`, `alt` reali, chevron sui select, touch target 44px. |
| Quality gate | ✅ | typecheck + lint + build puliti (sul codice reale dopo fix del mismatch worktree/repo). |

### Nota di processo

Durante la sessione gli edit sono inizialmente finiti nel repo principale (path assoluto su `main`) invece che nel worktree del branch feature; i primi quality gate/dev server giravano quindi sul codice non modificato. Risolto spostando le modifiche sul branch via `git stash` (object store condiviso tra worktree) e rieseguendo i gate sul codice reale. Lezione → in CLAUDE.md/AGENTS.md.

---

## Log fasi

### [2026-05-23] Creata da split di EVO-009

EVO-009 ombrello, EVO-011 = arricchimento TabTaglie portale. Fasi 1-4 ereditate dall'ombrello (vedi `EVO-009-kit-scuola.md`). Bloccata in attesa di:
1. Completamento e merge di EVO-010 in `main`
2. Aggiornamento del branch `evo-004-portale-iscrizioni` con `main`

### [2026-06-06] Ripresa + implementazione (dipendenze risolte)

EVO-004 + EVO-010 entrambe già in `main`: la dipendenza/coordinamento branch è caduta, si è lavorato da branch fresco `feat/evo-011-kit-scuola-tab-taglie`.

**Scoperta in implementazione (oltre lo scope visivo originale)**: le opzioni delle 3 singleSelect Airtable `TABELLA_ISCRIZIONI` non erano `XS–XXL` come hardcoded nel codice, ma:
- `TAGLIA_MAGLIA` / `TAGLIA_PANTALONCINO` → `5XS, 4XS, 3XS, 2XS, XS`
- `TAGLIA_TUTA` → `110/120, 130/140`

→ bug latente: salvare i valori vecchi avrebbe dato 422 `INVALID_MULTIPLE_CHOICE_OPTIONS`. Fix: nuova const `TAGLIE_PER_CAMPO` in `kit-scuola.ts` (mirror schema Airtable, single source of truth) consumata da `TabTaglie`.

**Decisioni utente in iterazione**:
- Foto: usare le 4 Cloudinary già in `kit-scuola.ts` (rese piccole via `cloudinaryOptimized(url, 200)`); nessun asset nuovo.
- Taglie: hardcode mirror come TS const (non fetch dinamico).
- **Microcopy "guida taglie" RIMOSSO** su richiesta utente (la riga 24/34/98 della scheda — link `/la-scuola#kit-scuola` — non è stata implementata; `SezioneKitScuola.tsx` resta intatta, nessun anchor aggiunto).

Fix design-critique applicati: chevron `ChevronDown` sui select `appearance-none`, `<label htmlFor>` + `alt` reali, gap verticale uniforme, difesa valore legacy nelle option. Quality gate (typecheck/lint/build) puliti.
