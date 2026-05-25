# DS Extend — EVO-018 Admin Pagamenti & Tariffe

Spec dei pattern DS Triono nuovi e estesi introdotti da EVO-018. Da consolidare in `AGENTS.md` post-merge (sezione `### Pattern appresi in EVO-018`).

---

## 1. New Component: `BulkSegnaPagatoModal`

### Problem

In EVO-018 l'admin deve poter marcare come pagati N titoli selezionati con un'unica operazione, applicando lo stesso metodo + data + provider + note a tutti. La modal singola `SegnaTitoloPagatoModal` (EVO-017) lavora su 1 titolo alla volta — non è scalabile per workflow bulk (es. bonifico cumulativo famiglia, registrazione contanti fine giornata).

### Existing Patterns

| Related Component | Similarity | Why It's Not Enough |
|-------------------|------------|---------------------|
| `SegnaTitoloPagatoModal` (EVO-017) | Stesso pattern `AdminFormDialog`, stessi campi form, stesso submit success | Singolo titolo; nessun riepilogo aggregato; nessun sync `markPrimaRataPagata` iterativo |
| `ConfirmDialog` (EVO-016) | Pattern conferma azione + bottoni | Solo conferma sì/no, nessun form |
| `BulkActionBar` (EVO-016) | Fixed bottom bar con `selectedCount` + actions | Trigger della modal, non la modal stessa |

### Proposed Design

#### API / Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | — | Stato apertura controllato |
| `onOpenChange` | `(open: boolean) => void` | — | Callback chiusura |
| `titoli` | `TitoloPagamento[]` | — | Array titoli selezionati (no singolo) |
| `onClearSelection` | `() => void` | — | Chiamato dopo submit successo per resettare selezione DataTable |

#### Variants

Variante unica — non parametrizzabile per ora.

#### States

| State | Behavior | Notes |
|-------|----------|-------|
| Default | Form vuoto con default (metodo=bonifico, provider=Altro, data=now), context card mostra N titoli + totale aggregato | — |
| Loading | Form disabilitato (opacity 0.6 + pointer-events:none) durante submit | Pattern `AdminFormDialog.internalLoading` |
| Success | Modal si chiude, `onClearSelection` triggerato, `revalidatePath` ricarica tabella | — |
| Partial success | Alcuni titoli skip (già pagati): mostrare toast/feedback "{processed} aggiornati · {skipped} ignorati" | UX gentile — non bloccare per skip idempotenti |

#### Layout chiave (dal mockup `bulk-segna-pagati-modal.html`)

- Header `iconTone="grass"` con icona `<CheckCircle/>` + titolo "Segna pagati in blocco" + descrizione "Registra manualmente il pagamento di N titoli con lo stesso metodo e data"
- Context card `bg-grass-50 border-grass-100 rounded-md`:
  - Header "N titoli selezionati"
  - Lista titoli (`max-h-[140px] overflow-y-auto`): per ogni titolo riga con `<Avatar>` + nome bambino + descrizione titolo (`#CODICE_TITOLO`) + importo `font-mono` allineato a destra
  - Footer card: "Totale aggregato" `text-2xl font-bold text-grass-700`
- Sync hint conditionally rendered: se `titoli.some(t => t.fields.NUMERO_RATA === 1)`, mostra banner `bg-sky-50 border-sky-200` "**N titoli sono 1ª rata**: verranno aggiornati anche **PRIMA_RATA_PAGATA** sulle relative iscrizioni."
- Form fields: `grid-2` (Metodo + Provider select) + Data datetime-local + Note text input
- Footer: hint sinistra "Idempotente: titoli già pagati vengono ignorati silenziosamente." + bottoni Annulla (ghost) + "Segna N pagati" (success grass)

#### Tokens Used

- Colors: `--grass-50/100/600/700`, `--sky-50/200/700`, `--navy-50/700`, `--ink/muted`, `--bg-soft/muted`, `--line/soft`
- Spacing: `--r-md` (10px) per card, `--r-lg` (16px) per modal
- Typography: Inter 400/600/700/800, JetBrains Mono per importi
- Shadow: `--sh-lg` per modal

### Accessibility

- **Role**: `dialog` (Radix `<Dialog>`)
- **Keyboard**: Tab cycle tra form fields, Esc chiude (disabled durante loading), Enter submit
- **Screen reader**: titolo modal letto come `<DialogTitle>`, sync hint con `role="alert"` se condizionalmente reso

### Implementation file

`src/components/admin/pagamenti/BulkSegnaPagatoModal.tsx` — riadattamento `SegnaTitoloPagatoModal` parametrizzato per array. Server Action `bulkSegnaPagato({ids, metodo, dataPagamento, provider, note?})` in `src/lib/actions-admin.ts`.

### Open Questions

- **Performance**: per N>50 titoli, considerare chunk 25 alla volta per non saturare timeout Vercel Hobby (~10s). Default loop sequenziale per rispettare rate limit Airtable 5 req/s. Da validare in smoke test.
- **Partial success UI**: toast `{processed}/{skipped}` o modal di conferma post-submit? Per ora andiamo con redirect+revalidate (resta semplice).

---

## 2. New Component: `TariffaCard`

### Problem

Visualizzare in modo immediato e riconoscibile le 3 tariffe trimestrali (Q1/Q2/Q3) per anno selezionato in `/portale/admin/tariffe`, con focus su importi + stato attiva + conteggio iscrizioni collegate. Necessità di colpo d'occhio Q-by-Q.

### Existing Patterns

| Related Component | Similarity | Why It's Not Enough |
|-------------------|------------|---------------------|
| `KPICard` (EVO-016) | Card compatta con label + value + icon | Troppo piccola e generica, no header colorato, no breakdown campi |
| `CardGara` (EVO-005) — tile colorato per tipo gara | Tile colorato pieno per categorizzazione visiva | Tile compatto, non card grande con breakdown |
| `Card` (DS base) | Container generico bg-white border | Manca header colorato, manca pattern overlay |

### Proposed Design

#### API / Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tariffa` | `Tariffa` | — | Record Airtable TABELLA_TARIFFE |
| `quarterColor` | `'grass' \| 'ember' \| 'sky'` | — | Colore header (Q1=grass, Q2=ember, Q3=sky) |
| `iscrizioniCount` | `number` | — | Conteggio iscrizioni collegate da `countIscrizioniByTariffa` |
| `onEdit` | `() => void` | — | Apre `TariffaFormDialog` con tariffa selezionata |

#### Variants

| Variant | Use When | Visual |
|---------|----------|--------|
| `default` | Tariffa attiva (`ATTIVA: true`) | Header gradient pieno + stat "✓ Attiva" + body completo |
| `in-preparazione` | Quarter futuro o tariffa non attiva | Header gradient con stat "⏱ In preparazione" + bordo header con opacity ridotta sul badge |

#### States

| State | Behavior | Notes |
|-------|----------|-------|
| Default | Hover sul bottone "Modifica" attiva interazione | Card stessa non clickable (azione esplicita) |
| Hover Modifica | Bottone outline → bordo navy-700 più definito | Standard `btn btn-outline btn-sm` |

#### Layout chiave (dal mockup F3 `tariffe-lista.html`)

- Container: `bg-white border border-line rounded-[var(--radius-xl)] shadow-sm overflow-hidden flex flex-col`
- **Header colorato**:
  - `padding: 18px 20px; color: white; position: relative; overflow: hidden`
  - Background gradient `linear-gradient(135deg, var(--{color}-500), var(--{color}-600))` (Q1=grass, Q2=ember, Q3=sky)
  - Pattern overlay assoluto `inset: 0; background-image: url('/assets/pattern.svg'); background-size: 180px 180px; opacity: 0.15`
  - Children con `position: relative; z-index: 1`
  - Quarter label `font-mono text-[10.5px] uppercase opacity-80` (es. "Quarter 1 · 2026")
  - Titolo h2 `text-[22px] font-extrabold` (es. "Gennaio → Aprile")
  - Periodo `font-mono text-[12.5px] opacity-85` (es. "4 mesi · 16 settimane di corso")
  - Status row: chip `bg-white/18 rounded-full px-2.5 py-1 text-[11.5px] font-semibold` "✓ Attiva" + counter "22 iscrizioni" `opacity-80`
- **Body**: padding `18px 20px`, lista campi con divider sottile `border-bottom: 1px solid var(--line-soft)`, ogni riga `flex justify-between` con `.k` (muted) e `.v` (ink font-semibold tabular-nums)
- **Footer**: `bg-bg-soft border-top` con conteggio iscrizioni + bottone Modifica outline

#### Tokens Used

- Colors gradient header: `--grass-500/600` (Q1), `--ember-500/600` (Q2), `--sky-500/600` (Q3)
- Pattern asset: `/public/assets/pattern.svg` (Triono geometric pattern SVG)
- Spacing: `--r-xl` (22px) card radius, `--sh-sm` shadow
- Typography: Inter, JetBrains Mono per quarter label/periodo

### Accessibility

- **Role**: `article` (card semantica)
- **Heading hierarchy**: h2 per quarter title dentro card
- **Color contrast**: testo bianco su gradient — verificato contrast ratio ≥4.5:1 su tutti i gradient color pairs (grass-500/600 OK, ember-500/600 OK, sky-500/600 OK)
- **Keyboard**: bottone Modifica focusable, tab order naturale

### Implementation file

`src/components/admin/tariffe/TariffaCard.tsx`. Mapping `NOME_TARIFFA` Airtable → `quarterColor`:
- `Q1` (o "Quarter 1") → `'grass'`
- `Q2` (o "Quarter 2") → `'ember'`
- `Q3` (o "Quarter 3") → `'sky'`

### Open Questions

- **Edge case multi-tariffa attiva per Quarter**: se admin salva 2 tariffe attive per Q1, la lista mostra entrambe come card? O solo la più recente? Per ora soft warning su upsert + visualizzazione di tutte (admin gestisce). Da rifinire post-MVP se diventa problema.

---

## 3. New Pattern: `WarningSoftBanner` (riusabile)

### Problem

Comunicare all'admin che un'azione ha conseguenze importanti ma **non bloccanti** — tipico caso "modifica con N iscrizioni collegate non retroattiva". Necessità di pattern visivo distinto da error/destructive (che è bloccante).

### Existing Patterns

| Related Component | Similarity | Why It's Not Enough |
|-------------------|------------|---------------------|
| `<Alert variant="warning">` (DS base) | Banner colorato ember | Standard ma manca enfasi su "non bloccante" + spesso usato per errori soft |
| `ConfirmDialog` (EVO-016) | Avviso prima di azione critica | Bloccante (richiede conferma esplicita), pattern diverso |

### Proposed Design

#### API / Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `children` | `ReactNode` | — | Testo del warning (può contenere `<strong>`) |
| `icon` | `LucideIcon` | `<Info/>` | Icona opzionale |
| `className` | `string` | — | Override classi opzionale |

#### Variants

Variante unica `soft` — è il punto del pattern.

#### Visual

```
background: var(--ember-50);
border: 1px solid var(--ember-100);
border-left: 3px solid var(--ember-500);   ← accent bordo sinistro per distinguere da semplici banner
border-radius: var(--r-md);
padding: 12px 14px;
font-size: 12.5-13px;
color: var(--ember-700);
display: flex; gap: 10px; align-items: flex-start;
```

#### Use Cases EVO-018

1. **Modifica tariffa con iscrizioni collegate** (mockup `tariffa-form-modal.html`): "**22 iscrizioni storiche collegate** (incluse eventuali annullate). Le modifiche **non sono retroattive**..."
2. **Soft warning anno tariffe attive** (mockup F3 `tariffe-lista.html`): "**Stai modificando le tariffe 2026.** Le iscrizioni esistenti mantengono la loro tariffa originale."

### Implementation file

Non serve componente dedicato — è abbastanza semplice da inline come `<div className="warning-soft">` ricorrente, oppure se l'utente vuole riusabilità completa estraibile in `src/components/admin/WarningSoftBanner.tsx`. Decisione rinviata al momento di scriverlo.

---

## 4. Extended Pattern: `MethodTag` per `METODO_PAGAMENTO`

### Problem

Riga DataTable pagamenti deve mostrare velocemente il metodo di pagamento usato — necessario per riconciliazione contabile (l'admin scorre 47 righe cercando "che metodo è stato usato per X").

### Existing Patterns

Pattern già introdotto in mockup F3 `pagamenti-lista.html`. Va promosso a componente DS riusabile.

### Proposed Design

#### API / Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `metodo` | `'app' \| 'bonifico' \| 'contanti' \| 'pos_segreteria'` | — | Valore Airtable `METODO_PAGAMENTO` |

#### Variants visual

| Metodo | Background | Color | Label |
|--------|------------|-------|-------|
| `app` | `linear-gradient(135deg, #1c79e6, #00b86b)` | `#fff` | "SUMUP" (gradient brand SumUp) |
| `bonifico` | `var(--sky-100)` | `var(--sky-700)` | "BONIFICO" |
| `contanti` | `var(--bg-muted)` | `var(--ink)` | "CONTANTI" |
| `pos_segreteria` | `var(--ember-100)` | `var(--ember-700)` | "POS SEGRET." |

#### Shared style

```
display: inline-flex; align-items: center; gap: 5px;
padding: 3px 8px;
border-radius: 4px;
font-family: var(--f-mono);
font-size: 10.5px;
font-weight: 700;
letter-spacing: 0.04em;
text-transform: uppercase;
```

### Implementation file

`src/components/admin/pagamenti/MethodTag.tsx`. Mapping case-insensitive in helper `methodTagVariant(metodo: string)` — applica fallback "Altro" `bg-bg-muted text-ink-muted` per valori non riconosciuti.

---

## 5. Pattern: KPI strip con `valueTone` semantic

### Problem

Le 3 KPI top di `/portale/admin/pagamenti` (Incassato YTD / Da incassare / Scaduti) richiedono colori diversi per il `value` numerico — verde grass per positivo, neutral per neutro, rosso flag per critico. `KPICard` di EVO-016 ha già `valueTone` ma pattern non era documentato.

### Existing Patterns

| Related Component | Similarity | Why It's Not Enough |
|-------------------|------------|---------------------|
| `KPICard` (EVO-016) con `valueTone="critical"` | Già supporta tone | Pattern non documentato, va promosso a convention |

### Proposed Convention

| KPI tipo | `valueTone` | Color result |
|----------|-------------|--------------|
| Successo / positivo (Incassato YTD, Bambini attivi) | `'success'` (DA AGGIUNGERE — al momento solo `default/critical`) | `var(--grass-700)` |
| Neutro / informativo (Da incassare, Iscrizioni anno) | `'default'` | `var(--ink)` |
| Critico / azione richiesta (Scaduti, Pagamenti pending) | `'critical'` | `var(--flag-600)` |
| Warning soft (es. Iscrizioni in stallo) | `'warning'` (DA AGGIUNGERE) | `var(--ember-700)` |

### Action

Estendere `KPICard` con varianti `success` e `warning` su `valueTone` (file `src/components/admin/KPICard.tsx`). Backward compatible — `default` resta come oggi.

---

## Riepilogo file da modificare/creare

| File | Tipo | Pattern coperti |
|------|------|-----------------|
| `src/components/admin/pagamenti/BulkSegnaPagatoModal.tsx` | NEW | 1 |
| `src/components/admin/tariffe/TariffaCard.tsx` | NEW | 2 |
| `src/components/admin/pagamenti/MethodTag.tsx` | NEW | 4 |
| `src/components/admin/WarningSoftBanner.tsx` | NEW (opt) | 3 |
| `src/components/admin/KPICard.tsx` | EXTEND | 5 (`valueTone` success/warning) |

## Note per Claude Code

- I 4 nuovi componenti devono essere **typed strict** (no `any`), client-side dove serve interattività, server-side altrimenti.
- Usare **token CSS variables** (es. `var(--grass-500)`) o classi Tailwind native (`bg-grass-500`), MAI hex hardcoded.
- Per `TariffaCard`: l'asset `pattern.svg` è già in `/public/assets/pattern.svg` (verificare path nel repo).
- Per `BulkSegnaPagatoModal`: riusare `AdminFormDialog` come wrapper, NON reinventare la modal.
- Per pattern soft warning ember: il colore `ember-700` su `ember-50` ha contrast ratio sufficiente (~5.2:1), AA WCAG compliant.

---

## Da consolidare in `AGENTS.md` post-merge

Pattern da promuovere in sezione `### Pattern appresi in EVO-018 (2026-05-XX)`:

1. **Bulk modal con riepilogo aggregato** → quando si introduce un'azione bulk su DataTable, sempre mostrare lista titoli selezionati + totale aggregato + sync hint per side-effect non ovvi (es. `PRIMA_RATA_PAGATA`).
2. **TariffaCard header colorato gradient + pattern SVG** → pattern admin per visualizzazione card con categorizzazione visiva forte (NON `.photo-bg-{color}` di EVO-012, che è editoriale bitmap).
3. **WarningSoftBanner ember + border-left accent** → pattern per warning NON bloccanti (modifiche non retroattive, contesti informativi). Distinto da `<Alert variant="warning">` standard.
4. **MethodTag come componente DS** → tag mono uppercase per metodi di pagamento, colore semantico per metodo (SumUp gradient brand, Bonifico sky, Contanti neutral, POS ember).
5. **`KPICard.valueTone` standardizzato** → 4 tone (`default`, `success`, `warning`, `critical`) per KPI semantic — non lasciare colore al consumer ad-hoc.
