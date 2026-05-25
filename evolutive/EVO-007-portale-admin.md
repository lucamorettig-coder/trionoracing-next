# EVO-007 — Portale admin (F3.6)

- **ID**: EVO-007
- **Slug**: portale-admin
- **Data inizio**: 2026-05-24
- **Data fine**: _da compilare a chiusura_
- **Stato**: ombrello (split in 5 sotto-evolutive figlie il 2026-05-25)
- **Tipo**: nuova feature (area `RUOLO = ADMIN`) — ombrello contenitore
- **Area**: area autenticata `/portale/admin/*` (cross-cutting su 8 tabelle Airtable)
- **Priorità**: alta (target go-live MVP "iscrizioni + bambini + pagamenti + tariffe" entro 2 settimane)
- **Evolutiva ombrello**: [EVO-001 — Portale F3](EVO-001-portale-f3.md) (super-ombrello)
- **Sotto-evolutive figlie**: EVO-016, EVO-017, EVO-018, EVO-019, EVO-020 (vedi §9)

---

## 1. Requisiti

### Descrizione (dall'utente)

Dare a Luca (e a eventuali collaboratori segreteria) il controllo end-to-end della Scuola di Ciclismo direttamente dal portale Next.js, **senza dover aprire Airtable** per i task operativi quotidiani: gestire iscrizioni, vedere chi ha pagato e chi no, approvare richieste gara dei genitori, registrare pagamenti in contanti/bonifico, modificare tariffe, vedere il diario di tutte le lezioni dei maestri, gestire anagrafiche genitori e bambini, esportare CSV per la contabilità.

Airtable resta accessibile come fonte di verità ma non deve più essere il "centro operativo".

### Obiettivo principale

Sblocco operativo + chiusura Fase 3 portale. È l'ultima evolutiva grossa della Fase 3 prima della migrazione utenti Clerk (EVO-008) e del cutover DNS.

### Target utente

1-3 account ADMIN, oggi a regime un solo utente operativo (Luca). Tutti vedono e fanno tutto — non ci sono permessi differenziati tra admin diversi. Maestri (RUOLO=ISTRUTTORE) **non** vedono nulla di admin (già garantito dal middleware `proxy.ts`).

### Dipendenze esterne note

- Nessuna nuova integrazione esterna: tutte le tabelle Airtable usate esistono già (`TABELLA_GENITORI`, `TABELLA_BAMBINI`, `TABELLA_ISCRIZIONI`, `TABELLA_LEZIONI`, `TABELLA_MAESTRI`, `Gare Giovanili Umbria 2026`, `TITOLI_PAGAMENTO`, `TARIFFE`).
- Make.com scenari di notifica (4086727 PROD + 5141784 DEV) restano out-of-band: le azioni admin che mandano email passano da Make come oggi (es. notifica approvazione gara).
- Clerk produzione (D-15) **non** è bloccante per EVO-007 — l'admin lavora già su instance dev/test attualmente operativa.

### Decisioni utente 2026-05-24 (kick-off EVO-007)

1. **Urgenza**: alta — target produzione entro 2 settimane.
2. **CRUD**: CRUD completo da subito su tutte le 11 schermate. No "read-only first".
3. **Audit log**: rinviato a EVO futura (coerente con UX_DETTAGLIO_ADMIN.md §"Decisioni di scope chiuse" #1). Airtable già traccia `Modificato il/da` sui record, basta per MVP.
4. **Export CSV**: in scope su tutte le pagine elenco (iscrizioni, bambini, pagamenti, lezioni, presenze maestri, genitori).

### Decisioni di scope già chiuse il 2026-05-21 (UX_DETTAGLIO_ADMIN.md)

Ereditate senza modifiche:
1. **Audit log**: post-launch (vedi decisione 3 sopra).
2. **Spotlight ⌘K ricerca globale**: post-launch.
3. **Tipo titolo "saldo"** esposto in form "Aggiungi titolo manuale".
4. **Certificato medico**: nessun override admin — sempre file caricato (scan cartaceo se serve).
5. **Annullamento iscrizione**: soft-delete (stato → "annullata"), rimborsi out-of-band.
6. **Cambio ruolo**: UI in `/portale/admin/genitori` con AlertDialog conferma.
7. **Export contabilità**: CSV standard (data, importo, metodo, provider, id titolo, bambino, genitore, codice fiscale, causale).
8. **Maestri come admin**: ruolo accumulabile (`RUOLO=ADMIN` + record TABELLA_MAESTRI coesistono).
9. **Bulk approvazione gare**: modal con toggle "Notifica genitori via email" (default on).
10. **Report/statistiche automatici**: post-launch. MVP = dashboard KPI + export CSV manuale.

---

## 2. Ambito

### In scope

**Schermate (11) — UX_DETTAGLIO_ADMIN.md autoritativo**
- A-1 Dashboard `/portale/admin` — KPI annuali + Today's tasks + trend iscrizioni + breakdown corsi + quick actions
- A-2 Iscrizioni `/portale/admin/iscrizioni` — tabella + filtri sticky + bulk + export CSV + paginazione 50
- A-3 Dettaglio iscrizione `/portale/admin/iscrizioni/[id]` — 5 tab (Stato/override · Modulistica · Taglie · Pagamenti admin · Storia/log)
- A-4 Bambini `/portale/admin/bambini` — tabella + filtri certificato + dettaglio bambino con tab iscrizioni storiche e storia lezioni
- A-5 Pagamenti `/portale/admin/pagamenti` — tabella + KPI top + filtri + modal "Segna pagato" + export
- A-6 Gare `/portale/admin/gare` — CRUD + toggle Future/Passate/Bozze + assegnazione maestri + upload copertina R2
- A-7 Iscrizioni gara `/portale/admin/gare/[id]/iscrizioni` — workflow approva/rifiuta + bulk + modal con toggle notifica genitore
- A-8 Lezioni `/portale/admin/lezioni` — storico globale + filtri + stats (totali, presenze medie, maestro più attivo)
- A-9 Presenze maestri `/portale/admin/presenze-maestri` — tabella aggregata mese/maestro + dettaglio lezioni
- A-10 Genitori `/portale/admin/genitori` — anagrafica + cambio ruolo + dettaglio profilo + filtri
- A-11 Tariffe `/portale/admin/tariffe` — 3 card Q1/Q2/Q3 + form CRUD con warning iscrizioni collegate

**Funzionalità trasversali**
- Bulk selection con sticky bar "{n} selezionati" + dropdown azioni
- Export CSV con filtri correnti su 6 pagine elenco (A-2/A-4/A-5/A-8/A-9/A-10)
- AlertDialog di conferma su azioni distruttive (annulla, rifiuta, marca pagato, cambia ruolo, elimina tariffa)
- NavBar admin: link aggiuntivi visibili solo se `RUOLO=ADMIN` in `PortaleNavBar.tsx` / `NavLinks.tsx` / `MobileMenu.tsx`
- Modal "Segna pagato" con METODO_PAGAMENTO (app/bonifico/contanti/pos_segreteria), DATA_PAGAMENTO, NOTE, PROVIDER_PAGAMENTO
- Modal "Annulla iscrizione" con motivo libero (soft-delete → STATO_ISCRIZIONE=`annullata`, pagamenti restano)
- Modal "Approva/Rifiuta iscrizione gara" con toggle "Notifica genitore via email" (default ON)
- Modal "Aggiungi titolo manuale" con TIPO_TITOLO (prima_rata/rata_successiva/saldo) + IMPORTO + DATA_SCADENZA + NOTE
- **Cambio ruolo con sync immediato Clerk**: scrive `TABELLA_GENITORI.RUOLO` + `clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role } })`
- Upload immagine copertina gara via R2 (riusa `src/lib/r2.ts` di EVO-003)
- Helper aggregatori cross-tabella in `src/lib/airtable-admin.ts` (nuovo)
- Stato `annullata` aggiunto a `STATO_ISCRIZIONE` (campo Airtable singleSelect)

### Out of scope

- **Audit log** azioni admin (post-launch — Airtable già traccia `Modificato il/da`)
- **Spotlight ⌘K** ricerca globale (post-launch)
- **Reports/statistiche periodici** automatici (post-launch)
- **Notifiche email automatiche** (restano gestite da Make.com out-of-band — l'admin attiva/disattiva via toggle in modal, ma il send è Make)
- **Override certificato medico** (decisione UX #4 — sempre file caricato, anche scan cartaceo)
- **Disabilita account** lato admin: rinviato a post-launch / EVO-008 (per ora si fa via Clerk Dashboard manualmente)
- **Migrazione utenti Supabase → Clerk** (è EVO-008 dedicata)
- **Comunicazioni/newsletter** broadcast agli iscritti
- **Modifiche al portale genitore o maestro** lato UI (admin vede tutto, ma le viste genitore/maestro non vengono toccate)
- **Bulk send reminder modulistica** automatico (UX A-2 lo cita ma è dipendente da notifiche Make, fuori scope)

### Dipendenze interne

- **Sblocca**: chiusura sostanziale di Fase 3 portale (resta solo EVO-011 kit-taglie e EVO-008 migrazione Clerk)
- **Bloccata da**: nulla a livello tecnico (Clerk dev sufficiente, R2/SumUp già in produzione)
- **Coesiste con**: EVO-011 — branch indipendenti, no sovrapposizione file

---

## 3. Analisi as-is

### Stack tecnologico

| Layer | Tecnologia | Note |
|---|---|---|
| Framework | **Next.js 16.2.6** (App Router) | Convenzione `proxy.ts` (ex-middleware), già configurato |
| Runtime | Node 20 + React 19.2.4 | |
| Auth | **@clerk/nextjs ^7.3.7** | `clerkClient()` server-side già usato nel layout per `updateUserMetadata` |
| Stile | Tailwind v4 + custom theme tokens | `globals.css` definisce CSS variables `--color-navy-*`, `--color-sky-*`, `--color-grass-*`, `--color-ember-*`, `--color-flag-*`, `--color-sun-*`, `--color-bg/-soft/-muted`, `--color-line/-soft`, `--color-ink/-muted`, `--radius-xs/sm/md/lg/xl`, `--shadow-xs/sm/md/lg` |
| Linguaggio | TypeScript 5 | Niente errori di build sui PR precedenti |
| Database | Airtable REST API (no SDK) | Token + base ID via env |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3 ^3.1052.0` | Endpoint custom, client già in `src/lib/r2.ts` |
| Webhook | svix ^1.94.0 | Per Clerk `user.created` |
| Validation | zod ^4.4.3 | Già usato in API routes esistenti |
| Icons | lucide-react 0.468.0 (pinned per Footer DS) | |

### Design system as-is

**Token CSS** (sorgente: `src/app/globals.css`) coerenti con DS Triono v0.1: palette navy/sky/grass/ember/flag/sun + neutrali tinted + radius + shadow. Niente da introdurre per EVO-007 a livello di token.

**10 componenti UI base** (`src/components/ui/`):
- `Badge` (7 varianti: default, neutral, success, warning, error, info, sun · 2 size)
- `Button` (primary, secondary, outline, ghost, link, destructive, hero · size sm/md/lg/icon · loading · asChild · iconOnly · shape circle)
- `Card` (default, feature, accent)
- `Footer`, `Hero`, `NavBar` (pubblica), `NewsCard`, `SectionHeader`
- `Form` (FormField, Label, Input, Textarea, Select, Checkbox, Radio, FormHelper, FormError)
- `Icons` (5 custom Triono + re-export Lucide)

**🚨 Gap rilevante per EVO-007**: **nessun componente Dialog/Modal/AlertDialog nel DS**. Le viste admin richiedono pesantemente conferme distruttive (annulla iscrizione, marca pagato, cambia ruolo, rifiuta gara). EVO-007 deve introdurre:
- `@radix-ui/react-dialog` + `@radix-ui/react-alert-dialog` come dipendenze
- `src/components/ui/dialog.tsx` (Modal generico per form)
- `src/components/ui/alert-dialog.tsx` (conferma distruttiva con `trionoClerkAppearance`-like styling)
- Eventuale `src/components/ui/dropdown-menu.tsx` per bulk actions sticky bar (Radix dropdown-menu)

**Pattern liste portale esistenti**:
- `PagamentiLista.tsx` — pattern "card-row" con `divide-y`, foto thumb, badge stato, CTA right. Riusabile per A-5 ma servirà colonne tabellari per A-2/A-4/A-8/A-10.
- `IscrizioniLista.tsx` — Client Component con filtri stateful (`useMemo` + `useState`).
- Pattern "tabella vera" con header colonne, sort, paginazione **non esiste ancora** — è il principale building block da introdurre per le pagine admin.

### Localizzazione (i18n)

**n/a**. Il progetto è italiano-only (PROGETTO_MASTER §3 chiude D-11). Niente next-intl, niente locales/, niente hreflang. Tutte le stringhe sono hardcoded in italiano nei componenti. EVO-007 segue lo stesso pattern.

### SEO as-is

**n/a per l'area admin** (`/portale/admin/*` è protetta, `noindex` implicito per via dell'auth + middleware). Le pagine admin non necessitano metadata SEO, sitemap entry, structured data, OG image. Il `src/lib/seo.ts` resta non toccato.

### File rilevanti per EVO-007

**Da consumare (sola lettura, niente refactor)**:
- `src/lib/airtable-portale.ts` (1410 righe) — esporta già: `getBambiniByGenitore`, `getIscrizioniByGenitore`, `getTitoliByGenitore`, `getGareFuture`, `getLezioniByMaestro`, `getMaestroByEmail`, `getAllMaestriAttivi`, `calcTariffa`, `stripReadOnlyFields`, `stripBambinoReadOnlyFields`, `stripIscrizioneReadOnlyFields`, `stripTitoloReadOnlyFields`, `stripLezioneReadOnlyFields`, `stripMaestroReadOnlyFields`. Tutti i field schema + writable sets sono già definiti.
- `src/lib/portale-utils.ts` (402 righe) — helper formatDateIT, formatEUR, badge variants, statoIscrizioneBadge, certBadgeVariant, daysUntil, calcCategoriaFCI, `getStatoIscrizioneAnnoCorrente`.
- `src/lib/r2.ts` — client S3 per R2 (upload immagini gare).
- `src/lib/clerk-appearance.ts` — `trionoClerkAppearance` per eventuali sign-in admin.
- `src/proxy.ts` — **guard `/portale/admin/*` già configurato per `RUOLO=ADMIN`** (riga `isAdminOnly`). Niente da modificare nel middleware.

**Da estendere (modifiche additive)**:
- `src/components/portale/NavLinks.tsx` — già contiene 4 link admin abbozzati (Dashboard, Iscrizioni, Bambini, Pagamenti). Aggiungere 7 link mancanti (Gare, Lezioni, Presenze maestri, Genitori, Tariffe — i dettagli vivono sotto le rispettive sezioni).
- `src/components/portale/PortaleNavBar.tsx` — funzione `getLinksForRole("ADMIN")` da estendere.
- `src/components/portale/MobileMenu.tsx` — riceve i link da NavBar, niente refactor.
- `src/app/portale/(portal)/admin/page.tsx` — oggi è placeholder "in costruzione". Sostituire con dashboard reale (A-1).
- `src/app/portale/(portal)/layout.tsx` — `syncGenitore` già sync `publicMetadata.role`. Riusare lo stesso pattern per cambio ruolo lato admin.

**Da creare (file nuovi)**:
- `src/lib/airtable-admin.ts` — pattern aggregatore admin (helper `getAllIscrizioni`, `getAllBambini`, `getAllPagamenti`, `getAllGenitori`, `getAllLezioni`, `getAllMaestri`, `getAllGare`, `getAllTariffe`, `getDashboardKPI`, `getTodayTasks`, `csvExport*`). Tutti i fetch con paginazione Airtable (offset).
- `src/components/admin/*` — componenti riusabili admin (DataTable generico, AdminFilters, BulkActionBar, AdminPageHeader, ConfirmDialog, ExportCSVButton, KPICard).
- `src/components/ui/dialog.tsx` + `alert-dialog.tsx` + (opz.) `dropdown-menu.tsx` — primitivi Radix.
- `src/app/portale/(portal)/admin/{iscrizioni,bambini,pagamenti,gare,lezioni,presenze-maestri,genitori,tariffe}/page.tsx` + relativi `[id]/page.tsx` dove serve (A-3 iscrizione, A-6 gara, A-7 iscrizioni gara).
- `src/app/portale/(portal)/admin/*/actions.ts` — Server Actions per CRUD (pattern già usato in `gare/[id]/actions.ts` e `lezioni/actions.ts`).
- `src/app/api/admin/csv/[entity]/route.ts` — endpoint export CSV streaming (per file grandi).

**Schema Airtable — impatti**:
- `TABELLA_ISCRIZIONI` — campo `STATO_ISCRIZIONE` è **formula** (oggi: `COMPLETA | INCOMPLETA`). Per supportare lo stato `annullata` (decisione UX #5):
  - **Opzione A** (raccomandata): aggiungere campo `ANNULLATA` (checkbox) + `MOTIVO_ANNULLAMENTO` (long text) + `DATA_ANNULLAMENTO` (date). Estendere la formula: `IF(ANNULLATA, "ANNULLATA", IF(AND(... 4 condizioni esistenti ...), "COMPLETA", "INCOMPLETA"))`. Compatibile con UI/code esistenti (basta gestire il valore "ANNULLATA" come terzo stato).
  - **Opzione B** (rischiosa): trasformare `STATO_ISCRIZIONE` in singleSelect manuale — rompe l'autoritativa formula su cui dipende EVO-014 (FiglioCard, banner reassurance). **Scartata.**
- `TABELLA_GENITORI` — niente campi nuovi (RUOLO già singleSelect con `GENITORE | ISTRUTTORE | ADMIN`). Niente flag `ACCOUNT_DISABILITATO` (rinviato).
- `TITOLI_PAGAMENTO` — niente nuovi campi (schema già supporta NOTE + TIPO_TITOLO + METODO_PAGAMENTO + PROVIDER_PAGAMENTO).
- Nessuna nuova tabella (audit log rinviato).

### Pattern emersi da AGENTS.md applicabili a EVO-007

- **Lazy sync in layout** (EVO-002): non serve nuovo middleware admin, il pattern attuale copre già.
- **Helper aggregatori cross-iscrizione** (EVO-013): replicare in `src/lib/airtable-admin.ts` per le viste admin che fanno fetch massivi.
- **Formula `STATO_ISCRIZIONE` autoritativa** (EVO-014): vincola la scelta sull'opzione A sopra.
- **Sync TITOLI_PAGAMENTO → ISCRIZIONE per prima rata** (EVO-014): l'azione admin "Segna pagato" deve replicare lo stesso pattern (setta `PRIMA_RATA_PAGATA = true` se titolo è `NUMERO_RATA === 1`).
- **`return_url` SumUp obbligatorio** (EVO-004 hotfix): non applicabile (admin non crea checkout SumUp, lavora su pagamenti manuali).
- **R2 via AWS SDK S3** (EVO-003): riusare `src/lib/r2.ts` per upload copertina gare.
- **ARRAYJOIN su linked records Airtable** (EVO-006): evitare `SEARCH(value, ARRAYJOIN(linkedField))` nei filterByFormula degli helper admin. Usare inverse relationship o email match.

---

## 4. Soluzione e WBS (livello ombrello)

### Soluzione proposta

Costruire `/portale/admin/*` come layer trasversale read+write sopra le tabelle Airtable esistenti. Riuso massivo di `airtable-portale.ts` (1410 righe già coprono ~70% dei fetch necessari) + nuovo modulo aggregatore `src/lib/airtable-admin.ts` per le viste cross-iscrizione. Il design system viene esteso con primitivi mancanti (Dialog, AlertDialog, DropdownMenu) e con un ecosistema di componenti admin (DataTable generico + AdminFilters + BulkActionBar + AdminPageHeader + ExportCSVButton + KPICard + ConfirmDialog). Le 11 schermate sono App Router server-rendered con Server Actions per mutations e route handlers dedicati per export CSV streaming. Schema Airtable cambia solo per `STATO_ISCRIZIONE` (formula estesa con `ANNULLATA`).

### WBS di alto livello (10 macro-task)

| # | Macro-task | Schermate UX | Effort | Sotto-EVO |
|---|---|---|---|---|
| 1 | Scaffold DS & Infra admin | A-1 minimal | M-L | **EVO-016** |
| 2 | Iscrizioni admin (list + dettaglio 5 tab + 4 modal) | A-2, A-3 | L | **EVO-017** |
| 3 | Bambini admin (list + dettaglio) | A-4 | M-L | **EVO-017** |
| 4 | Pagamenti admin (list + KPI + modal segna pagato) | A-5 | M | **EVO-018** |
| 5 | Gare admin (CRUD + approvazioni + R2) | A-6, A-7 | L | **EVO-019** |
| 6 | Lezioni admin (storico + stats) | A-8 | M | **EVO-020** |
| 7 | Presenze maestri (aggregato + drill) | A-9 | M | **EVO-020** |
| 8 | Genitori admin (list + cambio ruolo Clerk) | A-10 | M | **EVO-020** |
| 9 | Tariffe admin (CRUD Q1/Q2/Q3) | A-11 | M | **EVO-018** |
| 10 | Export CSV streaming (route handler unificato) | trasversale | S-M | **EVO-016** (skeleton) + ogni sotto-EVO (entity) |

WBS dettagliata di livello 2 vive nelle singole sotto-evolutive figlie.

### Ordine di esecuzione (sotto-evolutive)

1. **EVO-016** infra+DS+dashboard minimal — bloccante per tutte
2. **EVO-017** iscrizioni+bambini (priorità operativa massima)
3. **EVO-018** pagamenti+tariffe (priorità operativa fiscale)
4. **EVO-019** gare (post-MVP iscrizioni, parallelizzabile)
5. **EVO-020** lezioni+presenze+genitori (chiude scope completo)

Dopo EVO-016, le altre 4 sono **parallelizzabili** se gestite su branch indipendenti (niente collisioni di file: ciascuna tocca un sottodominio dell'admin distinto).

### Rischi e assunzioni (livello ombrello)

- **R1**: la formula `STATO_ISCRIZIONE` estesa con `ANNULLATA` deve essere testata su iscrizioni live (FiglioCard genitore EVO-014). Mitigazione: estendere `getStatoIscrizioneAnnoCorrente` in `portale-utils.ts` per gestire "ANNULLATA" come "non iscritto".
- **R2**: rate limit Airtable (5 req/s per base). Mitigazione: cache server-side a 60s sui fetch admin + lazy load tab dettaglio.
- **R3**: `clerkClient.users.updateUserMetadata` invalida sessione utente target → richiede re-login. Comunicare in modal.
- **R4**: Upload immagine gara via R2 — valutare bucket dedicato `gare-pubbliche` (vs `certificati-medici`). Decisione in EVO-019.
- **R5**: `DataTable` generico in EVO-016 deve essere ben fatto da subito — ogni sotto-evolutiva lo eredita.
- **R6**: timing 2 settimane → realisticamente arriva live EVO-016 + EVO-017 + EVO-018. EVO-019 + EVO-020 nelle settimane successive.

### Decisioni utente 2026-05-25 (split)

1. **Granularità**: 5 sotto-evolutive (EVO-016→020) come proposto.
2. **Schema Airtable**: campo `ANNULLATA` + formula estesa applicati all'**inizio di EVO-016** via MCP Airtable, con backup record prima.
3. **Dashboard A-1 in EVO-016**: versione **minimal** (KPI + Today's tasks + quick actions). Trend chart + breakdown corsi rinviati a sotto-evolutiva successiva (candidata: EVO-018 o nuova EVO post-MVP).

---

## 5. Verifica coerenza

_Da compilare in Fase 5._

---

## 6. UX/UI

_Da compilare in Fase 6._

---

## 7. Prompt per Claude Code

_Da compilare in Fase 7._

---

## 8. Verifica e go-live

_Da compilare in Fase 8 dopo go-live._

---

## 9. Evolutive correlate

### Sotto-evolutive figlie

| ID | Slug | Cosa include | Effort | Priorità | Dipende da |
|---|---|---|---|---|---|
| [EVO-016](EVO-016-admin-infra-ds.md) | `admin-infra-ds` | ✅ **completata** (2026-05-25, PR #29 commit `edffe5f`, live https://trionoracing-next.vercel.app/portale/admin). Scaffold DS (Dialog/AlertDialog/DropdownMenu/DataTable/AdminFilters/BulkActionBar/AdminPageHeader/ConfirmDialog/ExportCSVButton/KPICard/TodayTaskRow) + skeleton `airtable-admin.ts` + 7 wrapper minimal + estensione NavBar (9 link admin) + schema Airtable PROD+DEV (campi `ANNULLATA`/`MOTIVO_ANNULLAMENTO`/`DATA_ANNULLAMENTO` + formula estesa) + dashboard A-1 minimal (KPI + Today's tasks + quick actions). | ~1gg effettiva | 🔴 1 | nessuna |
| [EVO-017](EVO-017-admin-iscrizioni-bambini.md) | `admin-iscrizioni-bambini` | ✅ **completata** (2026-05-25, PR #30 commit `6478670` + fix `f613cf0`, live https://trionoracing-next.vercel.app/portale/admin/iscrizioni). A-2 iscrizioni list+filtri+export CSV · A-3 dettaglio 5 tab + 4 modal (annulla/forza/titolo manuale/segna pagato) · A-4 bambini list+filtri+export CSV · dettaglio bambino+elimina guard. Post-smoke: 7 UI fix (client boundary, max-width, ModulisticaIcons tooltip, rm filtro corso, cert badge label, card iscrizioni bambino, anno badge). | ~5-6gg effettiva | 🔴 2 | EVO-016 |
| [EVO-018](EVO-018-admin-pagamenti-tariffe.md) | `admin-pagamenti-tariffe` | A-5 pagamenti list + KPI top (Incassato YTD / Da incassare / Scaduti) + filtri + export CSV · A-11 tariffe CRUD Q1/Q2/Q3 con warning iscrizioni collegate | ~3-4gg | 🟡 3 | EVO-016 |
| [EVO-019](EVO-019-admin-gare.md) | `admin-gare` | A-6 gare CRUD (form completo + upload copertina R2 + flag in evidenza + assegnazione maestri) · A-7 iscrizioni gara workflow approva/rifiuta + bulk + modal notifica genitore | ~3-4gg | 🟡 4 | EVO-016 |
| [EVO-020](EVO-020-admin-lezioni-maestri-genitori.md) | `admin-lezioni-maestri-genitori` | A-8 lezioni storico globale + stats · A-9 presenze maestri aggregato + drill · A-10 genitori list + cambio ruolo (Airtable + Clerk publicMetadata sync) + dettaglio + export CSV | ~3-4gg | 🟢 5 | EVO-016 |

Dopo EVO-016, le 4 figlie successive sono parallelizzabili su branch indipendenti.

### Lavori rinviati post-MVP

- Dashboard A-1 versione **completa** (trend chart iscrizioni + breakdown corsi attivi) — candidata EVO-018 o nuova EVO dedicata "admin-dashboard-trend"
- Audit log azioni admin (post-launch — decisione UX #1)
- Spotlight ⌘K ricerca globale (post-launch — decisione UX #2)
- Reports/statistiche periodici automatici (post-launch — decisione UX #10)
- Disabilita account admin (rinviato a EVO-008 o successiva)

### Super-ombrello padre

[EVO-001 — Portale F3](EVO-001-portale-f3.md).

---

## Log fasi

### [2026-05-24] Fase 0 — Bootstrap completato

Identificata root progetto, letti CLAUDE.md/AGENTS.md/memory.md, ID assegnato (EVO-007 già preregistrata nell'ombrello EVO-001). Slug confermato: `portale-admin`. Pattern di deploy: Vercel auto-deploy su merge `main`.

### [2026-05-24] Fase 1 — Requisiti raccolti

4 decisioni utente registrate (urgenza alta, CRUD completo, audit log rinviato, export CSV in scope). Coerenza con UX_DETTAGLIO_ADMIN.md verificata: 10/10 decisioni di scope già chiuse il 2026-05-21 confermate senza modifiche. Scope di massima: 11 schermate, CRUD pieno + bulk + export, no audit/spotlight/reports automatici.

### [2026-05-25] Fase 2 — Ambito chiuso

In scope consolidato: 11 schermate + 9 funzionalità trasversali (bulk, export CSV, alert dialog, navbar admin, 4 modal CRUD, upload R2, helper aggregatori, stato `annullata` su STATO_ISCRIZIONE). 3 decisioni 🟡 chiuse: (1) Cambio ruolo sincronizza Airtable + Clerk publicMetadata immediato via `clerkClient`; (2) Disabilita account rinviato post-launch; (3) Aggiungi titolo manuale in scope con form completo (TIPO_TITOLO prima_rata/rata_successiva/saldo). Out of scope: audit log, spotlight ⌘K, reports automatici, notifiche email auto, override cert medico, disabilita account, migrazione Clerk.

### [2026-05-25] Fase 3 — Analisi as-is completata

Stack: Next.js 16.2.6 + Tailwind v4 + Clerk 7.3.7 + Airtable REST + R2 AWS-S3 + zod 4.4.3 + Radix slot. **3 scoperte chiave**:
1. **Gap DS critico**: nessun componente Dialog/AlertDialog/DropdownMenu — EVO-007 introduce `@radix-ui/react-dialog` + `@radix-ui/react-alert-dialog` come dipendenze + crea i primitivi UI corrispondenti.
2. **Middleware admin già pronto**: `src/proxy.ts` ha già il guard `isAdminOnly` su `/portale/admin(.*)` (riga 24). Niente da modificare lato auth.
3. **Stato `annullata`**: il campo `STATO_ISCRIZIONE` è formula autoritativa (vincolo EVO-014). Soluzione = aggiungere campi `ANNULLATA` checkbox + `MOTIVO_ANNULLAMENTO` long text + `DATA_ANNULLAMENTO` date su `TABELLA_ISCRIZIONI` ed estendere la formula `IF(ANNULLATA, "ANNULLATA", existing)`.

File nuovi previsti: `src/lib/airtable-admin.ts` (aggregatori), `src/components/admin/*` (DataTable, AdminFilters, BulkActionBar, AdminPageHeader, ConfirmDialog, ExportCSVButton, KPICard), `src/components/ui/{dialog,alert-dialog,dropdown-menu}.tsx`, 11 route pages sotto `src/app/portale/(portal)/admin/*`, relative `actions.ts`, `src/app/api/admin/csv/[entity]/route.ts` per export CSV streaming. i18n/SEO: n/a (italiano only + area protetta noindex implicito).

### [2026-05-25] Fase 4 — WBS chiusa, split in 5 sotto-evolutive

WBS di alto livello con 10 macro-task mappati su 5 sotto-evolutive figlie: **EVO-016** (infra+DS+dashboard minimal, sbloccante), **EVO-017** (iscrizioni+bambini, MVP critico), **EVO-018** (pagamenti+tariffe, fiscale), **EVO-019** (gare+approvazioni), **EVO-020** (lezioni+presenze+genitori). Effort totale stimato: 17-22 giornate. In 2 settimane (target alto) si chiudono realisticamente EVO-016+017+018 (MVP "iscrizioni live"). Le 4 sotto-evolutive post-EVO-016 sono parallelizzabili su branch indipendenti. Dashboard A-1 in EVO-016 in versione **minimal** (KPI + Today's tasks + quick actions), trend chart + breakdown corsi rinviati post-MVP. Schema Airtable modificato all'inizio di EVO-016 via MCP. EVO-007 diventa **ombrello**; il flusso evolutive-workflow riparte dalla prima figlia EVO-016 quando l'utente è pronto.
