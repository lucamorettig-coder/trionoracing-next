# DS Extend — EVO-026 (corsi MTB-BDC / SOLO-MTB)

Spec dei pattern nuovi/estesi, prodotta con `design:design-system extend`. Token: sempre da `globals.css`, mai hex hardcoded nel codice finale.

---

## 1. Nuovo componente: `CorsoRadioCard`

### Problem

Il wizard iscrizione deve far scegliere tra 2 formule di corso con prezzo e frequenza diversi. Serve una selezione singola, visiva, mobile-first, prima del calcolo tariffa.

### Existing patterns

| Componente correlato | Cosa condivide | Perché non basta |
|---|---|---|
| `CardIscriviFigli` (EVO-005) | card cliccabili con stato selezionato | è multi-select e orientata a persone, non a opzioni tariffarie |
| `TariffaCard` (EVO-018) | breakdown prezzi | è read-only admin, non selezionabile |

### API / Props

| Prop | Tipo | Default | Descrizione |
|---|---|---|---|
| `corso` | `TipoCorso` (`"MTB-BDC" \| "SOLO-MTB"`) | — | valore dell'opzione |
| `selected` | `boolean` | `false` | stato selezione |
| `onSelect` | `(corso: TipoCorso) => void` | — | callback |
| `quotaAnnua` | `number` | — | quota del quarter corrente (da tariffe vigenti) |
| `quarter` | `"Q1" \| "Q2" \| "Q3"` | — | per la nota "quota per iscrizioni {periodo}" |
| `disabled` | `boolean` | `false` | es. tariffa non attiva per l'anno |

### Anatomia (vedi mockup-step-scegli-corso.html)

- Wrapper: `<button role="radio">` full-width, `rounded-[var(--radius-xl)]`, `border-2`, `bg-white`, `shadow-[var(--shadow-xs)]`, `p-5`, testo a sinistra.
- Riga 1: icona corso in `CardIcon`-like tile 40px (`Bike` sky per MTB-BDC, `Mountain` sun per SOLO-MTB) + nome corso `text-lg font-bold text-ink` + radio indicator a destra (cerchio 22px, `border-2 border-line`; selezionato: `border-navy-700` + dot interno `bg-navy-700`).
- Riga 2: descrizione 1 riga `text-sm text-ink-muted` ("Strada il martedì + MTB il giovedì" / "Solo MTB, il giovedì").
- Riga 3: badge giorni (riuso `Badge`: info per martedì, warning per giovedì) + prezzo a destra `font-bold text-ink`. **Il numero prominente è la quota del quarter corrente** (ciò che il genitore pagherà davvero, es. 240€ a maggio); riga secondaria muted "Quota per chi si iscrive ora ({periodo}) · anno intero: {quota piena}€". _Correzione da design-critique: mai mostrare grande la quota annua intera se non è l'importo dovuto._ Lo sconto famiglia si vede nello step Tariffa.

### Stati

| Stato | Visual | Note |
|---|---|---|
| Default | `border-line` | hover: `border-navy-300` + `shadow-[var(--shadow-sm)]` |
| Selected | `border-navy-700` + `bg-navy-50/40` + radio dot pieno | unico selezionato (radiogroup) |
| Disabled | `opacity-50 pointer-events-none` | + nota "Non disponibile per l'anno {anno}" |
| Focus | `ring-2 ring-navy-300 ring-offset-2` | keyboard |

### Accessibilità

- Wrapper gruppo: `role="radiogroup"` + `aria-label="Scegli il corso"`.
- Card: `role="radio"` + `aria-checked`; navigazione frecce ↑/↓ opzionale, Tab+Space/Enter sufficiente (2 opzioni).
- Il prezzo va nel testo accessibile della card (no solo visuale).

### Tokens usati

navy-700/navy-50 (selezione) · sky-500/sun-500 (icone corso) · line/line-soft · radius-xl · shadow-xs/sm · ink/ink-muted.

---

## 2. Badge corso (estensione mapping `Badge`)

| Valore | Variant `Badge` | Colore effettivo | Dove |
|---|---|---|---|
| `MTB-BDC` | `info` | sky | colonna lista admin, dettaglio admin, dettaglio genitore, chip header TariffaCard |
| `SOLO-MTB` | `warning` | sun/ember | idem |

Label user-facing: helper `corsoLabel(corso)` in `portale-utils.ts` → `MTB-BDC` → **"Corso MTB-BDC"** (esteso: "Strada + MTB · 2 lezioni/settimana"), `SOLO-MTB` → **"Solo Mountain Bike"** (esteso: "solo giovedì · 1 lezione/settimana"). Aggiornare il mapping esistente in `DettaglioIscrizioneAdmin` (riga 170: oggi `MTB→success`).

---

## 3. Admin tariffe: raggruppamento per corso

- La pagina passa da grid piatta a **2 sezioni** (ordine: MTB-BDC, poi SOLO-MTB), ognuna con heading: label corso `text-sm font-bold uppercase tracking-wide text-ink-muted` + badge corso + counter tariffe; sotto, la grid 1/2/3 colonne esistente.
- `TariffaCard`: eyebrow header diventa `Quarter {n} · {anno} · {corso}` (chip bianco/20 come "✓ Attiva").
- Riga "Scadenze rate" (legacy `SCADENZA_RATE`) **rimossa** dal body; al suo posto nota statica in footer body: `Scadenze: dal mese di iscrizione, una rata ogni 2 mesi` (`text-[11.5px] text-ink-muted italic`).
- `TariffaFormDialog`: + select "Corso" required (opzioni MTB-BDC / SOLO-MTB) in testa al form; − input "Scadenze rate". Validazione unicità (anno, quarter, corso) server-side in `upsertTariffa` con errore inline.
- Empty state per sezione: "Nessuna tariffa {corso} per il {anno}" + CTA crea.

---

## 4. Vetrina `/la-scuola` — SezioneCorsi riformulata

- `SectionHeader`: eyebrow "I corsi" · title "Due formule, una scuola." · subtitle che spiega la scelta (2 lezioni/sett oppure solo giovedì), **senza prezzi**.
- 2 card (grid md:grid-cols-2, riuso `Card` esistente):
  1. **Corso MTB-BDC** — icona `Bike` (default), copy strada+MTB, badge `info` "Martedì 17:00–18:30 · Strada" + badge `warning` "Giovedì 17:00–18:30 · MTB", badge default "Ciclodromo Renato Perona".
  2. **Solo Mountain Bike** — icona `Mountain` (sun), copy off-road, badge `warning` "Giovedì 17:00–18:30 · MTB", badge default sede.
- Nota sotto la grid: "Scegli la formula al momento dell'iscrizione nel portale. Puoi iscriverti tutto l'anno: la quota è proporzionata al periodo di ingresso." + CTA esistente verso iscrizione.
- `CourseJsonLd`: description aggiornata (due formule di iscrizione; le 2 `hasCourseInstance` settimanali restano valide).
- `SezioneComeIscriversi`: micro-copy allo step pertinente ("scegli la formula di corso").

---

## Open questions (per smoke/critique)

- Stepper mobile a 7 voci: verificare che la versione compatta EVO-025 non vada a capo (incluso nello smoke).
- Posizione del prezzo nella `CorsoRadioCard` su mobile ≤360px: il mockup usa wrap sotto i badge.
