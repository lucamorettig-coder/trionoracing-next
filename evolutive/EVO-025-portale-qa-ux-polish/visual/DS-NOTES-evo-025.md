# DS-NOTES — EVO-025 Portale QA/UX polish

Spec delle estensioni/convenzioni DS introdotte da EVO-025. **Nessun nuovo token, nessun nuovo colore**: si riusano i token Triono v0.1 e i componenti `Button`/`Card`/`Badge`/`DataTable` esistenti. Autorate dai componenti reali letti in Fase 3.

---

## 1. `BackLink` (nuovo primitivo condiviso) — rilievo #3

Estrae il pattern già presente nel dettaglio gara admin (`<Link><ChevronLeft/> Torna a Gare</Link>`) in un componente riusabile.

- **File**: `src/components/portale/BackLink.tsx` (client o server, semplice).
- **Props**: `href: string`, `label: string` (es. "Torna alle iscrizioni"). Opz. `className`.
- **Markup**: `inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4` + `<ChevronLeft size={14} aria-hidden />`.
- **Uso**: in cima alle sotto-pagine portale che oggi non hanno back: `iscrizioni/`, `pagamenti/`, dettagli `[id]/`, e sotto-pagine admin (`gare/[id]`, `genitori/[id]`, drill-down presenze, ecc.). Le pagine indice di primo livello (Dashboard) non lo richiedono.
- **Mobile**: stesso markup; il back è la primitiva chiave per dare orientamento su mobile (dove la NavBar è a drawer).

> Opzionale: se conviene, incapsulare in un `PageHeader` (back + h1 + sottotitolo + slot azioni) e adottarlo dove utile. Non obbligatorio per l'MVP del fix — il `BackLink` standalone è sufficiente.

## 2. Convenzione CTA → `Button` — rilievo #4

**Regola**: le CTA azionabili NON si rendono come `<Link>` testuali. Si usa il componente `Button` (`asChild` con `<Link>` per la navigazione).

- **Azioni primarie/secondarie** (Paga, Carica certificato, Riprendi iscrizione, Registra…): `Button variant="primary|secondary" size="sm"`.
- **Azioni neutre/di contorno** ("Vedi tutti", "Calendario gare"): `Button variant="outline" size="sm"` (già usato in alcune sezioni della dashboard — uniformare le altre).
- **NON usare** `variant="link"` per queste CTA: quella variante resta per link inline testuali veri (es. dentro un paragrafo), non per le CTA di riga.
- **Esempi da convertire**: in `DashboardGenitore.tsx` le CTA delle righe "Prossime scadenze" (`Carica nuovo certificato →`, `Paga con SumUp →`) e i "Vedi tutte" testuali; stesso pattern ovunque ricompaia nel portale genitori + admin.

## 3. Stepper mobile compatto — rilievo #1

In `StepperWizard.tsx` lo stepper a 6 cerchi+label va in overflow/sovrapposizione su viewport stretti.

- **Desktop (≥ sm)**: stepper attuale invariato → wrappare l'`<ol>` esistente in `hidden sm:block`.
- **Mobile (< sm)**: blocco `sm:hidden` con:
  - chip "Step X di N" (riuso stile chip esistente),
  - riga `Label corrente` (sinistra, font-bold) + `X / N` (destra),
  - **progress bar**: `h-2 rounded-full bg-white/14` con inner `width: (step/steps)%` `bg-sun-500` + glow `shadow-[0_0_12px_rgba(239,230,58,.5)]`,
  - opz. riga di **dots** (done=`bg-sun-500`, active=`bg-white ring`, todo=`bg-white/18`).
- Mantiene la palette navy/sun esistente, nessun nuovo token.

## 4. Card: padding responsive + de-nesting su mobile — rilievo #2

- **Padding responsive**: nei sub-componenti di `card.tsx` (`CardHeader`/`CardContent`/`CardFooter`) passare da `p-7` fisso a `p-5 sm:p-7` (o `p-4 sm:p-7` nei contesti più stretti). Valutare se applicarlo globalmente (desiderabile) o via className override solo nelle schermate wizard per contenere il blast radius.
- **De-nesting**: nelle schermate del wizard che annidano card dentro card, su mobile le card interne diventano **righe flat** (niente `border`/`shadow`, separatore `divide-y`/`border-t`), mantenendo le card solo da `sm` in su. Evita il doppio bordo+padding che strozza il contenuto.

## 5. `FormLezione` — variante admin — rilievo #6

Riuso del form esistente con una modalità admin.

- **Prop nuova**: `admin?: boolean`. Quando `true`:
  - **non** pre-include alcun maestro (oggi `MaestriSelector` ha `defaultValue=[currentMaestroId]` e copy "Sei sempre incluso") → in admin `currentMaestroId` non è forzato e il default è vuoto; copy adattata ("Seleziona il/i maestro/i che hanno tenuto la lezione").
  - banner ember informativo "Stai registrando come admin".
- **Server Action admin** separata (es. `actionCreateLezioneAdmin`) che chiama la lib `createLezione` con i `MAESTRI_PRESENTI` scelti e fa scattare l'hook `PRESENZE_MAESTRI` (come per il maestro). **Non** modificare `actionCreateLezione` maestro-scoped.
- **CTA "Registra gara"**: nessun nuovo form → `Button` che linka a `/portale/admin/gare/nuova` (flusso EVO-019 esistente).
- **Posizione CTA**: testata di `admin/lezioni` (e/o `admin/presenze-maestri`) accanto a "Esporta CSV".

## 6. Cella azionabile inline (toggle ★) — rilievo #7

Pattern "action toggle inline" già adottato nel progetto per ✓/✕ approvazioni (EVO-019) — qui esteso al toggle stella.

- In `GareDataTable.tsx`, la cella della colonna `in_evidenza` diventa un `<button>`:
  - `★` `text-sun-500 fill-sun-500` quando on, `☆` `text-ink-muted` quando off,
  - `onClick` con `e.stopPropagation()` (la riga ha `onRowClick` → non deve aprirsi),
  - update **ottimistico** dello stato locale + chiamata Server Action.
- **Server Action**: `toggleInEvidenzaAction(id: string, value: boolean)` in `admin/gare/actions.ts` — patch solo `IN_EVIDENZA` (whitelist `stripGaraReadOnly`) + `revalidatePath('/portale/admin/gare')`. Niente form completo.
- `aria-label` dinamico ("Metti in evidenza" / "Togli evidenza"); header colonna da `★` a "In evidenza" per chiarezza.

---

## Token & accessibilità
- Nessun nuovo token/colore: navy/sky/grass/ember/flag/sun + neutri esistenti.
- Target touch ≥ 36px per i nuovi button/toggle (CTA di riga = `Button size="sm"` h-9; la ★ inline deve avere hit-area ≥36px via padding). `aria-label` su icone-azione. Focus ring DS (`focus-visible:ring-4 ring-navy-700/20`) ereditato dal `Button`.
- Evitare testo essenziale a 11px con `text-ink-muted` (contrasto ~4.6:1, tight): usare ≥12px.

## Refinements recepiti da design-critique (2026-06-07)
1. **Ordinamento condizionale scadenze (#4)**: "Prossime scadenze" sopra "I miei figli" **solo se la lista non è vuota** (già rendering condizionale in `DashboardGenitore.tsx`); se vuota, "I miei figli" resta in cima. Evita di posticipare il modello mentale primario quando non ci sono urgenze.
2. **Rollback ottimistico toggle ★ (#7)**: se `toggleInEvidenzaAction` fallisce, ripristinare lo stato locale precedente + feedback errore (inline/toast). L'ottimistico non deve "mentire".
3. **Touch target (#4/#7)**: CTA di riga con `Button size="sm"` (h-9 = 36px) minimo; ★ inline con padding per hit-area ≥36px.
4. **Stepper mobile (#1)**: evitare ridondanza progress-bar + dots → tenere la **progress bar + "5/6"**; i dots sono opzionali. `aria-current="step"` sul blocco mobile.
