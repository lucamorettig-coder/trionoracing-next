# EVO-011 — Kit Scuola: immagini nel TabTaglie del portale

- **ID**: EVO-011
- **Slug**: kit-scuola-tab-taglie
- **Data inizio**: 2026-05-23
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione (sbloccata da EVO-010 ✅ il 2026-05-23 — resta da coordinare con il branch `evo-004-portale-iscrizioni`)
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

_Da compilare a fine fase 5._

---

## 6. UX/UI

_Da compilare a fine fase 6._

---

## 7. Prompt per Claude Code

_Da compilare a fine fase 7._

---

## 8. Verifica e go-live

_Da compilare in fase 8._

---

## Log fasi

### [2026-05-23] Creata da split di EVO-009

EVO-009 ombrello, EVO-011 = arricchimento TabTaglie portale. Fasi 1-4 ereditate dall'ombrello (vedi `EVO-009-kit-scuola.md`). Bloccata in attesa di:
1. Completamento e merge di EVO-010 in `main`
2. Aggiornamento del branch `evo-004-portale-iscrizioni` con `main`
