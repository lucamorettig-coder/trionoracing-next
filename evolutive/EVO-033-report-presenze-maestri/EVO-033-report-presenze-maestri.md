# EVO-033 — Report presenze maestri (export rimborsi da admin)

- **ID**: EVO-033
- **Slug**: report-presenze-maestri
- **Data inizio**: 2026-07-08
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: area admin (portale, autenticata)
- **Priorità**: alta

---

## 1. Requisiti

### Descrizione (dall'utente)

L'admin, dalla pagina `/portale/admin/presenze-maestri` (già esistente da EVO-020), deve poter generare un report scaricabile in formato immagine (PNG) che riepiloga i rimborsi da pagare ai maestri per il mese/anno filtrato in pagina. Il report riprende il design del PNG di esempio allegato dall'utente (header brand navy Triono con logo, tabella per maestro con colonne Lez. MTB / Lez. Strada / Gare / Totale / Importo, riga TOTALE finale in evidenza, footer con nome club e stagione). Sono richieste due varianti: "Amministrazione" (con colonna Importo, per uso interno contabilità) e "Maestri" (stessa tabella senza colonna Importo, pensata per far confermare le presenze all'istruttore). Il report usa i dati già gestiti in produzione nella tabella `PRESENZE_MAESTRI` (tariffa configurabile per maestro, importo snapshot) — non il calcolo flat €15/presenza di un tool separato usato finora manualmente fuori dall'app.

### Obiettivo principale

Funzionalità abilitante — elimina il passaggio manuale/fuori-app (skill locale standalone) per produrre il report mensile rimborsi, portandolo dentro il flusso admin già esistente e allineandolo ai dati reali (tariffe/pagato) invece che a un calcolo flat approssimato.

### Target utente

Admin (unico ruolo con accesso a `/portale/admin/*`).

### Dipendenze esterne note

Nessuna nuova. Riusa la tabella Airtable `PRESENZE_MAESTRI` e `TABELLA_MAESTRI` già introdotte in EVO-020; richiede probabilmente di risalire al `TIPO_SESSIONE` (MTB/Strada) della `TABELLA_LEZIONI` collegata a ogni presenza di tipo lezione, per scomporre il conteggio (dato non ancora aggregato in questa forma nell'admin esistente — da verificare in fase 3).

---

## 2. Ambito

### In scope

- Bottone "Genera report" su `/portale/admin/presenze-maestri` (vista aggregata con filtri Mese/Anno)
- Generazione server-side di un'immagine PNG per ciascuna delle 2 varianti (Amministrazione con Importo, Maestri senza Importo), stesso design del PNG di esempio (header navy + logo, tabella, riga Totale, footer)
- Dati aggregati per maestro nel mese/anno filtrato: Lez. MTB, Lez. Strada, Gare, Totale presenze, Importo (da `PRESENZE_MAESTRI`, non dal calcolo flat della skill standalone)
- Join necessario per scomporre Lez. MTB vs Lez. Strada (via `TIPO_SESSIONE` della lezione collegata a ogni presenza tipo "lezione")
- Download diretto del/dei PNG dal browser (no invio email, no storage permanente)

### Out of scope

- Formato PDF (rimandato, scelto PNG)
- Selettore periodo dedicato nel modal (si usa il filtro pagina esistente)
- Invio automatico del report ai maestri (email/notifica)
- Storico/archivio dei report generati (si rigenera al volo ogni volta)
- Firma digitale o campo note aggiuntivo sul report
- Modifica del calcolo tariffe/pagato esistente (EVO-020) — il report è solo una vista/export, non tocca la logica di dominio

---

## 3. Analisi as-is

### Stack tecnologico

Next.js (App Router) + React + TypeScript, Tailwind v4, Clerk (auth), Airtable REST API (no SDK). Script quality gate reali (`package.json`): `npm run lint` (eslint), `npm run typecheck` (tsc --noEmit), `npm run build` (next build). Nessuno script di test. Nessuna dipendenza già installata per generare immagini/PDF server-side (niente `puppeteer`, `playwright`, `@vercel/og`, `@sparticuz/chromium` in `dependencies`/`devDependencies`) — **da introdurre da zero**.

### Design system as-is

Pagina `/portale/admin/presenze-maestri` già esistente (EVO-020), scaffold DS riusato: `DataTable<T>`, `AdminFilters`, `KPICard.valueTone`, `ExportCSVButton`, `AdminFormDialog`. Il PNG di esempio ricalca già la palette navy/DS del progetto (navy-900 `#1c1f52`, accento sky `#7DD3FC`) — coerente con i token esistenti, non introduce nuovi colori.

### Localizzazione (i18n)

n/a — progetto mono-lingua italiano, nessuna libreria i18n.

### SEO as-is

n/a — area admin autenticata, nessuna pagina indicizzabile coinvolta.

### File rilevanti per l'evolutiva (mappati via Explore)

**Route/UI esistenti** (`/portale/admin/presenze-maestri`):
- `src/app/portale/(portal)/admin/presenze-maestri/page.tsx` — vista aggregata, KPI dovuto/pagato/residuo, già include `ExportCSVButton` (entity `presenze-maestri` e `presenze-riepilogo`)
- `src/app/portale/(portal)/admin/presenze-maestri/[maestroId]/page.tsx` — drill-down per maestro/mese/anno
- `src/app/portale/(portal)/admin/presenze-maestri/actions.ts` — Server Actions esistenti (`segnaPresenzePagateAction`, `aggiornaTariffaMaestroAction`, `aggiungiPresenzaManualeAction`) — qui va aggiunta l'azione/endpoint per il nuovo report
- `src/components/admin/presenze-maestri/PresenzeAggregatoTable.tsx` — dove va agganciato il bottone "Genera report"
- `src/components/admin/ExportCSVButton.tsx` — pattern riusabile (POST → blob → download client-side) per il nuovo bottone report

**Backend Airtable**:
- `src/lib/airtable-admin.ts:1374-1656` — `PresenzaAggregata` (già ha `maestroNome/Cognome/Qualifica/nLezioni/nGare/dovuto/pagato/residuo`, **ma `nLezioni` non distingue MTB/Strada**), `getPresenzeAggregato(filters)` (già filtra per mese/anno), `getPresenzeMaestroPeriodo`, entity CSV `presenze-riepilogo` in `src/app/api/admin/csv/[entity]/route.ts:320-348`
- `src/lib/airtable-portale.ts:1675-1752` — `PresenzaMaestro` (`TIPO: "lezione"|"gara"`, `LEZIONE?: string[]`, `GARA?: string[]`, `IMPORTO_DOVUTO`), `Lezione.TIPO_SESSIONE` (`"Lezione MTB Ciclodromo" | "Lezione BDC Ciclodromo" | "Gara Giovanissimi"`), `Maestro` (`IMPORTO_RIMBORSO_LEZIONE/GARA`)

**Verificato via Airtable MCP (schema reale, PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`, speculare)**:
- `PRESENZE_MAESTRI.LEZIONE` è un link diretto a `TABELLA_LEZIONI` → si può risalire a `TIPO_SESSIONE` per scomporre MTB/Strada **senza nuovo schema**, con un fetch aggiuntivo delle lezioni collegate alle presenze tipo "lezione" del periodo
- Nessun gap di schema PROD/DEV

**Gap identificato**: `getPresenzeAggregato` aggrega oggi `nLezioni` (lezioni+gare insieme, senza breakdown) — va estesa (o affiancata da una nuova funzione) per produrre il breakdown `{lezMTB, lezStrada, gare, totale, importo}` per maestro nel periodo, leggendo anche `TIPO_SESSIONE` delle lezioni collegate.

**Infrastruttura di rendering immagine**: assente, da introdurre. Opzioni valutate in Fase 4.

---

## 4. Soluzione e WBS

### Soluzione proposta

Si aggiunge un nuovo endpoint Route Handler (`ImageResponse` da `next/og`, motore **`@vercel/og`**) che genera il PNG branded a partire da un breakdown per-maestro (Lez. MTB / Lez. Strada / Gare / Totale / Importo) calcolato da una nuova funzione di aggregazione che estende `getPresenzeAggregato` risalendo, per ogni presenza tipo "lezione" del periodo filtrato, al `TIPO_SESSIONE` della `Lezione` collegata (via `PRESENZE_MAESTRI.LEZIONE`). Il template del report è un componente JSX satori-compatible (niente `<table>` reale, righe/colonne in flexbox) che replica fedelmente la palette/i layout del PNG di esempio (header navy + logo `logo-scuola.png` già in `public/assets/`, tabella, riga Totale, footer). Due varianti (`amministrazione` con colonna Importo, `maestri` senza) sono lo stesso template con un prop `includeImporto`. In UI, un nuovo bottone (pattern analogo a `ExportCSVButton` ma con `<a href=".../api/admin/report-presenze?...">` diretto, essendo l'output un'immagine scaricabile e non un blob costruito lato client) accanto agli export CSV esistenti in `PresenzeAggregatoTable`, con due opzioni (Amministrazione / Maestri), rispetta i filtri Mese/Anno già selezionati in pagina.

### WBS

1. **Backend — breakdown MTB/Strada/Gare per maestro**
   - 1.1 Nuova funzione `getReportPresenzeMaestri(filters: {mese, anno})` in `src/lib/airtable-admin.ts`: per il periodo, fetch presenze `TIPO=lezione` del periodo + batch fetch delle `Lezione` collegate (`RECORD_ID() OR(...)`, pattern già in uso) per leggere `TIPO_SESSIONE` → bucket `lezMTB`/`lezStrada`; presenze `TIPO=gara` → bucket `gare`; somma `IMPORTO_DOVUTO` → `importo`. Ordina per cognome. Escludi maestri con totale 0 nel periodo. — file: `src/lib/airtable-admin.ts` — stima: **M** — dipende da: _nessuna_
   - 1.2 Type `ReportPresenzeMaestroRow` (`maestroNome`, `maestroCognome`, `lezMTB`, `lezStrada`, `gare`, `totale`, `importo`) esportato per essere riusato dal template. — stessa file — stima: **S** — dipende da: 1.1
2. **Template report (satori/@vercel/og)**
   - 2.1 Componente `ReportPresenzeTemplate({periodo, generatedAt, righe, includeImporto})` in `src/lib/report-presenze-template.tsx` (o cartella dedicata): JSX con divs flex per header (logo + titoli + badge periodo + data generazione), "tabella" a righe flex (colonne Maestro/Lez.MTB/Lez.Strada/Gare/Totale/[Importo]), riga Totale in evidenza, footer (nome club + stagione). Palette hardcoded coerente col PNG di esempio (navy `#1c1f52`, accento sky `#7DD3FC`) — nessun nuovo token DS globale, è output stampabile non UI applicativa. — file: nuovo — stima: **M** — dipende da: 1.2 (contratto tipo dati)
   - 2.2 Caricamento logo (`public/assets/logo-scuola.png`) come immagine nel JSX (via URL assoluto risolto da `req` o fs+base64, da verificare in esecuzione quale approccio richiede `next/og` in questa versione di Next). — stessa file — stima: **S** — dipende da: _nessuna_ (parallelo a 2.1)
3. **Endpoint generazione immagine**
   - 3.1 Route Handler `src/app/api/admin/report-presenze-maestri/route.ts`: `GET` con query `mese`, `anno`, `variante` (`amministrazione`|`maestri`); `requireAdmin()` guard; chiama 1.1, passa i dati a 2.1, ritorna `ImageResponse` PNG. — file: nuovo — stima: **M** — dipende da: 1.1, 2.1, 2.2
4. **UI — bottone "Genera report"**
   - 4.1 Nuovo componente `GeneraReportButton.tsx` (dropdown/2 link "Amministrazione" / "Maestri" con icona download, stile coerente `ExportCSVButton`) che punta a `/api/admin/report-presenze-maestri?mese=X&anno=Y&variante=...` (i valori mese/anno presi dai filtri pagina già in URL). — file: `src/components/admin/presenze-maestri/GeneraReportButton.tsx` — stima: **S** — dipende da: 3.1
   - 4.2 Wiring nel componente `PresenzeAggregatoTable`/pagina esistente accanto ai bottoni Export CSV. — file: `src/app/portale/(portal)/admin/presenze-maestri/page.tsx` — stima: **S** — dipende da: 4.1

### Ordine di esecuzione

1. 1.1 → 1.2 (backend aggregazione)
2. 2.1 + 2.2 in parallelo (template + logo) — possono partire subito insieme a 1.x, sul contratto dati concordato
3. 3.1 (endpoint, integra 1.x + 2.x)
4. 4.1 → 4.2 (UI)

### Piano di parallelizzazione (wave)

- **Wave 1** (3 task indipendenti, file disgiunti): 1.1+1.2 (`airtable-admin.ts`) · 2.1 (`report-presenze-template.tsx`, sviluppato contro il contratto tipo concordato in WBS, non contro il codice 1.x) · 2.2 (stesso file di 2.1, ma task piccolo isolabile — in pratica 2.1+2.2 vanno allo stesso subagente per evitare conflitti sullo stesso file)
- **Wave 2** (1 task, dipende da tutta wave 1): 3.1 endpoint
- **Wave 3** (1 task): 4.1 + 4.2 UI (stesso subagente, file correlati)

Effettivamente: **Wave 1** = 2 subagenti paralleli (A: backend 1.1-1.2, B: template 2.1-2.2) su worktree isolati → integrazione → **Wave 2** = 1 task sequenziale (3.1) → **Wave 3** = 1 task sequenziale (4.1-4.2). Evolutiva piccola, il grosso del beneficio di parallelizzazione è la wave 1.

### Rischi e assunzioni

- **Fedeltà visiva `@vercel/og`/satori vs PNG di esempio**: satori non renderizza `<table>` reale né tutte le feature CSS (box-shadow limitato, no `text-overflow`, font custom richiedono embedding esplicito) → il template sarà una ricostruzione fedele ma non un porting 1:1 pixel-perfect dell'HTML della skill standalone. Da validare visivamente in fase 6/7 prima del merge.
- **Verificare in `node_modules/next/dist/docs/` il pattern `ImageResponse`/`next/og`** per questa versione custom di Next (il progetto ha breaking change rispetto al Next noto) prima di implementare l'endpoint — **vincolante** per l'executor (vedi nota AGENTS.md in cima al progetto).
- **N+1 su fetch lezioni collegate**: mitigare con batch fetch `OR(RECORD_ID()=...)` (pattern già consolidato in `getPresenzeMaestroPeriodo`), non un fetch per presenza.
- **Font**: se il progetto non ha un font custom già embeddabile in satori, usare il font di sistema di default supportato da satori (nessuna nuova dipendenza font).
- **Assunzione**: il logo da usare è `public/assets/logo-scuola.png` (branding "Triono Scuola Ciclismo", coerente col PNG di esempio), non `logo-triono-racing.png`.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riuso completo scaffold admin esistente (`ExportCSVButton` pattern, folder `admin/presenze-maestri/`). Il template del report è output "stampabile" fuori dal DS applicativo (come il pattern già noto "PDF branded da design system": HTML self-contained con palette del progetto), non introduce nuovi token globali — palette navy/sky hardcoded nel template coerente coi colori DS esistenti. |
| Struttura/architettura | ✅ | Route Handler in `src/app/api/admin/`, `requireAdmin()` guard (pattern esistente su tutte le route admin), nuova funzione in `airtable-admin.ts` coerente con le altre `getXxxAggregato`, componenti in `components/admin/presenze-maestri/` (folder-per-area già in uso). |
| Localizzazione (i18n) | n/a | Progetto mono-lingua italiano, testo del report hardcoded in italiano (coerente con gli export CSV esistenti, stessa convenzione). |
| SEO | n/a | Area admin autenticata, non indicizzata. |
| Accessibilità | ⚠️ → corretto | Bottone/i "Genera report" devono avere label testuali chiare (non solo icona) e le 2 varianti vanno esposte con un menu **tastiera-navigabile**. Correzione: riusare `@radix-ui/react-dropdown-menu` (già dipendenza, già usato altrove in admin — es. kebab menu gare) invece di un dropdown custom, per coerenza a11y col resto dell'app. |
| Performance | ⚠️ → nota | Generazione on-demand, dataset piccolo (1 mese), nessun impatto su altre pagine/bundle client (il render è server-side, il client scarica solo il PNG finale). Attenzione a non fare N+1 sul fetch delle lezioni collegate (mitigato in WBS 1.1 con batch fetch `OR(RECORD_ID()=...)`, pattern già consolidato). Nessuna azione aggiuntiva richiesta. |

### Correzioni applicate alla WBS

- **4.1 aggiornato**: `GeneraReportButton` implementato con `DropdownMenu` Radix (trigger + 2 `DropdownMenuItem` "Amministrazione"/"Maestri", ognuno con `aria-label` esplicito e icona download), non con 2 bottoni separati o markup custom — riuso pattern a11y già presente nell'admin.

---

## 6. UX/UI

### Percorso scelto

**(b) `design:design-system`** — pattern già definito (il PNG di esempio dell'utente), nessuna esplorazione visiva ampia necessaria. Nessun handoff Claude Design, nessuna pausa.

### Spec prodotta

[`visual/DS-NOTES-evo-032.md`](visual/DS-NOTES-evo-032.md) — spec completa del componente JSX satori-compatible: struttura flexbox riga-per-riga, props (`periodo`, `generatedAt`, `righe`, `includeImporto`), 2 varianti (Amministrazione 820px / Maestri 720px), decisione cromatica (token DS `navy-900`+`sky-300` al posto degli hex letterali del PNG originale, con fallback esplicito documentato), token/spacing/font usati.

### Note di design

- **Divergenza cromatica intenzionale**: il PNG di riferimento usa hex "a mano" (`#1c1f52`/`#7DD3FC`); il template usa i token DS ufficiali del progetto (`--color-navy-900` `#050E3F`, `--color-sky-300` `#7FB8EC`) per coerenza col resto dell'app — leggero scostamento visivo accettato, documentato non nascosto.
- **Opacità testi minori come nel PDF branded pattern**: bianco a più livelli di opacità hardcoded nel template (non tokenizzato nel DS globale) — stesso principio già usato per i documenti PDF branded del progetto, coerente per un output "stampabile" fuori dal flusso applicativo.
- **design-critique**: nessun blocco. 1 correzione applicata (opacità testi minori footer/gen-date alzata da 25-30% a 38-40% per leggibilità su stampa/compressione), esito registrato in fondo a `DS-NOTES-evo-032.md`.

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](prompt-claude-code.md). Il prompt copre l'intero ciclo: implementazione, test, smoke dev, branch + PR, merge (con OK utente), verifica post-deploy, auto-verifica via `verify-implementation`.

---

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo._

- **URL produzione**: _{url}_
- **Pull Request**: _{link}_
- **Commit di merge**: _{hash}_
- **Data go-live**: _{YYYY-MM-DD}_
- **Report verifica**: [`verifica.md`](verifica.md)

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ / ⚠️ / ❌ | _..._ |
| Localizzazione (i18n) | ✅ / ⚠️ / ❌ / n/a | _..._ |
| SEO | ✅ / ⚠️ / ❌ / n/a | _..._ |
| Fedeltà ai visual | ✅ / ⚠️ / ❌ | _..._ |
| Criteri di accettazione | ✅ / ⚠️ / ❌ | _..._ |
| Smoke test dev | ✅ / ❌ | _..._ |
| Smoke test produzione | ✅ / ❌ | _..._ |

### Apprendimenti riusabili (riportati anche in CLAUDE.md)

_Pattern, regole, decisioni emerse che valgono per future evolutive._

---

## 9. Evolutive correlate (opzionale)

_Compila questa sezione SOLO se l'evolutiva è un'ombrello con sotto-evolutive, oppure ha dipendenze con altre evolutive._

- _EVO-XXX — descrizione_
- _EVO-XXX — descrizione_

---

## Log fasi

> Append automatico a fine di ogni fase, con timestamp.
