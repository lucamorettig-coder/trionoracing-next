# DS Triono — Estensioni introdotte da EVO-017

> Output skill `design:design-system extend` — documenta i 3 nuovi pattern UI introdotti da EVO-017 nel design system Triono v0.1. Da promuovere a pattern canonici se confermati post-deploy e riusati in EVO-018/019/020.

---

## 1. `AdminFormDialog` — Modal con form multi-field

### Problem
I 4 modal admin di EVO-017 si dividono in 2 famiglie:
- **2 modal "conferma + motivo"** (`Annulla iscrizione`, `Forza completata`) → usano il `ConfirmDialog` EVO-016 già esistente con `motivoLabel/Required`. **Pattern coperto, nessun gap.**
- **2 modal "form multi-field"** (`Aggiungi titolo manuale`, `Segna titolo pagato`) → richiedono un layout con header + body scrollable + footer sticky + 4-6 campi diversi. **Nessun wrapper esistente.**

Senza un wrapper, ogni modal multi-field rischia di inventare un layout proprio (padding/sizing/footer/loading state inconsistenti). Servono almeno 4 modal multi-field anche in EVO-018 (titolo pagamenti) e EVO-020 (cambio ruolo, edit genitore) → vale la pena estrarre il pattern ora.

### Existing patterns
| Componente | Similarità | Perché non basta |
|---|---|---|
| `ConfirmDialog` (EVO-016) | Wrapper Dialog Radix con title + description + actions | Pensato per conferma single-action con eventuale textarea motivo. Non gestisce form multi-field, contextCard, footer hint, loading per Submit con icon. |
| `Dialog` primitivo Radix (EVO-016) | Modal grezzo con overlay + content + close | Solo scheletro, nessun layout. Forza ogni callsite a reinventare header/footer/scroll. |

### Proposed design

#### API / Props
| Property | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Stato apertura controllato |
| `onOpenChange` | `(open: boolean) => void` | — | Callback chiusura |
| `title` | `string` | — | Heading 16px bold |
| `description` | `ReactNode` | — | Sottotitolo grigio 12.5px sotto il title |
| `icon` | `ReactNode` | — | Lucide icon 18px nel cerchio header (vedi `iconTone`) |
| `iconTone` | `"navy" \| "grass" \| "ember" \| "sky" \| "flag"` | `"navy"` | Colore cerchio icon (bg-50, color-700) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 460 / 520 / 640 px width |
| `submitLabel` | `string` | `"Conferma"` | Label bottone Submit |
| `submitVariant` | `"primary" \| "destructive" \| "success"` | `"primary"` | Stile bottone Submit |
| `submitIcon` | `ReactNode` | — | Icon Lucide a sinistra del label submit |
| `cancelLabel` | `string` | `"Annulla"` | Label bottone Cancel |
| `footerHint` | `ReactNode` | — | Testo 11.5px grigio a sinistra del footer (es. "Idempotente", "Verrà loggato") |
| `loading` | `boolean` | `false` | Disabilita Submit + mostra spinner |
| `onSubmit` | `() => Promise<void>` | — | Async handler; chiude al success |
| `children` | `ReactNode` | — | Form fields nel body |

#### Variants
| Variant | Use When | Visual |
|---|---|---|
| **Navy default** (`iconTone="navy"`, `submitVariant="primary"`) | Azioni neutre/additive (es. aggiungi titolo manuale, edit anagrafica) | Icon cerchio navy-50/navy-700, submit navy-700 |
| **Grass success** (`iconTone="grass"`, `submitVariant="success"`) | Conferme positive (es. segna pagato, attiva account) | Icon cerchio grass-100/grass-700, submit grass-500 |
| **Ember warning** (`iconTone="ember"`) | Azioni con consigli/cautela (es. modifica importo già pagato) | Icon cerchio ember-100/ember-700, submit ember-500 |
| **Flag destructive** (`iconTone="flag"`, `submitVariant="destructive"`) | Azioni irreversibili NON soft-deletable (per quelle soft → ConfirmDialog) | Icon cerchio flag-50/flag-700, submit flag-500 |

#### States
| State | Behavior | Notes |
|---|---|---|
| Default | Form interattivo, Submit attivo se validation OK | — |
| Loading | Submit disabled + spinner, body con `pointer-events: none` ma scrollabile | onSubmit chiama `setLoading(true)` |
| Validation error | Inline error per field (riusa Form components esistenti DS) | Submit resta attivo, blocca submit con `e.preventDefault()` |
| Server error | Toast destructive sopra il modal + modal resta aperto | Riusa pattern toast esistente (se manca, fallback: `<div className="bg-flag-50 border-flag-200 ...">` sopra fields) |
| Closing | Animazione 150ms fade-out (Radix default) | onOpenChange(false) |

#### Tokens used
- Colors: `--navy-50/100/700` · `--grass-50/100/500/700` · `--ember-50/100/500/700` · `--flag-50/100/500/700` · `--sky-50/100/500/700` · `--ink/ink-muted` · `--line/line-soft` · `--bg-soft`
- Spacing: padding header `18 20 14`, body `18 20`, footer `14 20`
- Radius: `--r-xl` (modal), `--r-sm` (field), `50%` (icon-circle)
- Typography: title Inter 16/700/-0.01em, desc 12.5/400/1.4, label 12/600, field 13.5/500, hint 11.5/400
- Shadow: `0 24px 60px -10px rgba(0,0,0,0.3)` per il modal
- Backdrop: `rgba(20, 25, 58, 0.55)` + `backdrop-filter: blur(6px)` (navy-900 alpha)

### Accessibility
- **Role**: `dialog` con `aria-labelledby` puntato a `id` del title
- **Keyboard**: Tab cycle tra fields → Cancel → Submit (Radix gestisce focus trap), Escape chiude (chiama `onOpenChange(false)`), Enter su Submit invia
- **Screen reader**: title annunciato all'open, description letta come parte del dialog, hint footer come `aria-describedby`

### Code skeleton
```tsx
// src/components/admin/AdminFormDialog.tsx
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AdminFormDialog({
  open, onOpenChange, title, description, icon, iconTone = "navy",
  size = "md", submitLabel = "Conferma", submitVariant = "primary",
  submitIcon, cancelLabel = "Annulla", footerHint, loading, onSubmit, children
}: AdminFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size}>
        <div className="afd-header">
          <div className={cn("afd-header-icon", `afd-icon-${iconTone}`)}>{icon}</div>
          <div className="afd-header-body">
            <DialogTitle className="afd-title">{title}</DialogTitle>
            <DialogDescription className="afd-desc">{description}</DialogDescription>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="afd-body">{children}</div>
          <div className="afd-footer">
            {footerHint && <div className="afd-footer-hint">{footerHint}</div>}
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} type="button">{cancelLabel}</Button>
            <Button variant={submitVariant} size="sm" type="submit" loading={loading}>
              {submitIcon}{submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|---|---|
| Usa per modal con ≥3 campi distinti | Usa per single-confirm + motivo → `ConfirmDialog` |
| Includi sempre `footerHint` con info su sync/log/idempotenza | Ometti context-card se l'azione è ambigua sul "su quale entity sto operando" |
| `iconTone` coerente con la natura dell'azione (vedi Variants) | Mix di colori semantici (es. icon navy + submit destructive) |
| Validation inline + Submit attivo (blocco solo al submit) | Submit disabled finché tutto perfect — frustrante UX |

### Open questions
- Mobile (<420px): full-screen takeover vs centered con padding. **Decisione EVO-017**: centered con `width: calc(100vw - 32px)` e `max-height: calc(100vh - 64px)`. Riconsiderare se feedback "troppo stretto su mobile" in EVO-018.

---

## 2. `ModulisticaIcons` — Cella DataTable 4-icon status

### Problem
La list iscrizioni admin A-2 ha una colonna "Modulistica" che mostra lo stato di 4 documenti (Privacy minore, Regolamento Triono, Modulo Triono, Modulo FCI) — ognuno in stato OK/manca/pending. Inserire 4 badge testuali per riga occuperebbe ~200px di larghezza colonna (insostenibile su DataTable con 9 colonne). Servono 4 icon Lucide compatte (12-14px) con tone color + tooltip.

Senza un componente dedicato si rischia inline duplicato in DataTable cell + tab Modulistica del dettaglio.

### Existing patterns
| Componente | Similarità | Perché non basta |
|---|---|---|
| `Badge` (DS v0.1) | Stato + label + icon | Pensato per badge single, non per cluster di 4 status compatti |
| `Tooltip` (se esiste in DS — verificare) | Hover spiegazione | Wrapper, non semantica visiva |

### Proposed design

#### API / Props
| Property | Type | Default | Description |
|---|---|---|---|
| `privacy` | `"ok" \| "manca" \| "pending"` | — | Stato Privacy minore |
| `regolamento` | `"ok" \| "manca" \| "pending"` | — | Stato Regolamento firmato (`FLAG_REGOLAMENTO`) |
| `moduloTriono` | `"ok" \| "manca" \| "pending"` | — | Stato `MODULO_TRIONO_STATO` |
| `moduloFCI` | `"ok" \| "manca" \| "pending"` | — | Stato `MODULO_FCI_STATO` |
| `size` | `"xs" \| "sm"` | `"xs"` | 12px (cell DataTable) / 14px (dettaglio) |

#### Visual
4 icon Lucide affiancate, gap 4px:
1. `shield-check` (Privacy)
2. `file-signature` (Regolamento)
3. `file-text` (Modulo Triono)
4. `award` (Modulo FCI)

Tone color per ogni icon:
- `ok` → `text-grass-500`
- `manca` → `text-flag-500`
- `pending` → `text-ember-500`

Tooltip al hover su ogni icon: `"Privacy minore: firmata 18 gen 2026"` / `"Regolamento: in attesa di firma"` / `"Modulo FCI: approvato"` ecc.

### Accessibility
- **Role**: `img` con `aria-label` per ogni icon (es. `aria-label="Privacy minore firmata"`)
- **Screen reader**: legge "Modulistica: Privacy firmata, Regolamento mancante, Modulo Triono approvato, Modulo FCI approvato"

### Code skeleton
```tsx
// src/components/admin/iscrizioni/ModulisticaIcons.tsx
const ICONS = {
  privacy: { icon: ShieldCheck, label: "Privacy minore" },
  regolamento: { icon: FileSignature, label: "Regolamento" },
  moduloTriono: { icon: FileText, label: "Modulo Triono" },
  moduloFCI: { icon: Award, label: "Modulo FCI" }
} as const;

const TONE = {
  ok: "text-grass-500",
  manca: "text-flag-500",
  pending: "text-ember-500"
} as const;

export function ModulisticaIcons({ privacy, regolamento, moduloTriono, moduloFCI, size = "xs" }: ModulisticaIconsProps) {
  const items = { privacy, regolamento, moduloTriono, moduloFCI };
  const sizePx = size === "xs" ? 12 : 14;
  return (
    <div className="inline-flex gap-1" role="group" aria-label="Stato modulistica">
      {Object.entries(items).map(([key, status]) => {
        const { icon: Icon, label } = ICONS[key as keyof typeof ICONS];
        return (
          <Tooltip key={key} content={`${label}: ${labelForStatus(status)}`}>
            <Icon className={cn(TONE[status])} size={sizePx} aria-label={`${label}: ${labelForStatus(status)}`} />
          </Tooltip>
        );
      })}
    </div>
  );
}
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|---|---|
| Usa in cell DataTable list iscrizioni admin | Usa per single-status (basta `<Badge>`) |
| Mantieni ordine fisso Privacy → Regolamento → Triono → FCI | Riordinare in base allo stato (es. mancanti prima) — rompe colpo d'occhio |
| Tooltip con data firma/upload se `ok` | Solo icon senza tooltip — l'admin non capisce a quale modulo si riferisce |

### Open questions
- **Click su icon** → naviga a `?tab=modulistica` del dettaglio. Implementare in EVO-017 o rinviare? **Decisione MVP**: rinviare (cell DataTable già clickable sull'intera riga → apre dettaglio default su tab Stato. L'admin clicca lì poi naviga al tab Modulistica.)

---

## 3. Badge `info` / "Completata in deroga"

### Problem
La formula `STATO_ISCRIZIONE` non è modificabile (deciso Fase 1 EVO-017 lite). Quando l'admin clicca "Forza completata", la formula continua a restituire `INCOMPLETA` ma l'UI deve mostrare badge dedicato "Completata in deroga" basato sulla presenza di un log strutturato in `NOTE_ADMIN` (`[ISO] FORZA_COMPLETA · admin=... · motivo=...`).

DS v0.1 ha già 7 varianti `Badge` (default, neutral, success, warning, error, info, sun) secondo PROGETTO_MASTER §10.5. Da verificare in implementazione se `info` esiste ed è coerente con sky tone, o se serve una variante `sun-soft` dedicata.

### Existing patterns
- `Badge variant="warning"` ember = troppo "urgente"
- `Badge variant="info"` sky = neutro/informativo, **probabilmente la scelta giusta**
- `Badge variant="sun"` giallo Triono = enfatico, no

### Proposed design

#### Visual
- Background: `sky-50` (oppure `sun-50` se vogliamo enfatizzare la deroga)
- Border: `1px solid sky-200`
- Text: `sky-700` (oppure `navy-900` se `sun-50`)
- Icon: `shield-alert` Lucide 11px a sinistra del label
- Label: "Completata in deroga"

#### Logica derivazione
```tsx
function statoIscrizioneAdminBadge(iscrizione: Iscrizione): { label: string; variant: BadgeVariant } {
  if (iscrizione.fields.ANNULLATA) return { label: "Annullata", variant: "error" };
  if (iscrizione.fields.STATO_ISCRIZIONE === "COMPLETA") return { label: "Completata", variant: "success" };

  // Check log forza-completata in NOTE_ADMIN
  const hasForceLog = (iscrizione.fields.NOTE_ADMIN ?? "").includes("FORZA_COMPLETA");
  if (hasForceLog) return { label: "Completata in deroga", variant: "info" };

  return { label: "Incompleta", variant: "warning" };
}
```

### Open questions
- **Variant exact**: `info` (sky) o `sun-soft` (giallo). EVO-017 implementa `info` come default; se in QA appare "troppo neutra" → ribattezzare in `sun-soft`. Da validare con visual review post-deploy.

---

## Riepilogo cross-evolutiva

| Pattern | Introduce | Riuso futuro |
|---|---|---|
| `AdminFormDialog` | EVO-017 (2 modal) | EVO-018 modal pagamenti/tariffe, EVO-019 modal gare/approvazioni, EVO-020 modal cambio ruolo / edit genitore |
| `ModulisticaIcons` | EVO-017 (cell + dettaglio) | EVO-018 cell pagamenti se serve cluster status, EVO-019 cell gare per stato iscrizione+pagamento+presenza |
| Badge "in deroga" / variant info | EVO-017 | EVO-019 gara "in deroga FCI", EVO-020 lezione "presenza forzata" |

Aggiornare `AGENTS.md` post-merge EVO-017 con questi 3 pattern in sezione "Pattern appresi in EVO-017 (2026-MM-DD)".
