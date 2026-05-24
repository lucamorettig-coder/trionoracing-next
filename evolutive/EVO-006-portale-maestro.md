# EVO-006 — F3.5 Area maestro (lezioni + gare assegnate)

- **ID**: EVO-006
- **Slug**: portale-maestro
- **Data inizio**: 2026-05-24
- **Data fine**: 2026-05-24
- **Stato**: completata
- **Tipo**: Nuova feature
- **Area**: Area autenticata (cross-cutting middleware + nuove route `/portale/lezioni/*`, `/portale/gare-assegnate/*` + dashboard ruolo-aware)
- **Priorità**: Alta (continuazione naturale Fase 3 dopo EVO-005, propedeutico a EVO-007 admin che riusa le stesse tabelle/viste)

---

## 1. Requisiti

### Descrizione (dall'utente)

Un maestro della scuola Triono accede al portale con il proprio ruolo ISTRUTTORE, registra le lezioni a cui ha partecipato (data, co-maestri, argomento, bambini presenti, note pubbliche per i genitori e note interne per il team) e consulta lo storico delle proprie lezioni mese per mese. Vede inoltre le gare a cui è stato assegnato come accompagnatore. Se è anche genitore di un bambino della scuola, la dashboard concatena le due viste in un'unica esperienza.

### Obiettivo principale

**Nuova funzionalità abilitante** — sblocca il portale operativo per i 9 maestri della scuola: registrazione lezioni standardizzata, diario delle attività (visibile poi al genitore — gancio EVO-003 lato bambino), continuità di team via note interne, visibilità gare assegnate. Propedeutico a EVO-007 admin che dovrà avere `/portale/admin/lezioni` e `/portale/admin/presenze-maestri`.

### Target utente

- **Primario**: utenti loggati con `RUOLO = ISTRUTTORE` (9 maestri attivi linkati a `TABELLA_MAESTRI` via email match).
- **Secondario**: utenti con dual ruolo `GENITORE + ISTRUTTORE` (un maestro che è anche genitore di un bambino della scuola) — dashboard concatena le due viste.
- **NON in scope**: ADMIN puro (le viste admin sui dati lezioni/presenze sono EVO-007).

### Dipendenze esterne note

Nessuna. Stack interamente già configurato:

- Airtable (`TABELLA_LEZIONI`, `TABELLA_MAESTRI`, `TABELLA_BAMBINI`, `TABELLA_GARE`) — schema esteso da EVO-006 con +3 campi LEZIONI e +1 campo MAESTRI via MCP da Claude Code.
- Clerk già configurato (middleware `proxy.ts` ha già guard `ISTRUTTORE + ADMIN` su `/portale/lezioni/*` e `/portale/gare-assegnate/*` — vedi AGENTS.md §Middleware).
- DS aggiornato post-EVO-012 (`.photo-bg-{color}`, helper `tipoXStyle` da EVO-005, helper aggregatori `getXByGenitore` da EVO-013).

### Decisioni di scope (Fase 1)

- **Perimetro completo**: tutte e 5 le schermate UX (M-1 → M-5) in un singolo perimetro EVO-006. Decisione sul singolo vs. multi-deploy in Fase 4.
- **Modifiche schema Airtable parte di EVO-006**: `TABELLA_LEZIONI` +3 campi (`ARGOMENTO_LEZIONE` singleLineText, `NOTE_PUBBLICHE` longText, `NOTE_INTERNE` longText). `TABELLA_MAESTRI` +1 campo (`DISCIPLINE` multipleSelects: `MTB` | `Strada`). Eseguite da Claude Code via MCP Airtable in F7 prima del codice applicativo.
- **Vincolo modifica lezione**: maestro modifica entro 30 giorni dalla data lezione; oltre 30gg solo admin. Eliminazione: **sempre solo admin** (maestro non vede il bottone). Logica server-side + toast informativo.
- **Linking Clerk ↔ TABELLA_MAESTRI**: **lazy sync via email match al primo login**. Estensione del pattern EVO-002 oggi solo per GENITORI: il layout `(portal)/layout.tsx` (o un nuovo helper dedicato) al primo accesso di un utente con `publicMetadata.role = ISTRUTTORE` cerca `TABELLA_MAESTRI` per `EMAIL` match, salva `CLERK_USER_ID` sul record. Se nessun match → errore handled con messaggio "Contattare admin per associare l'account". Zero onboarding manuale per i 9 maestri esistenti — basta che le email coincidano.
- **Visual workflow**: i 5 mockup HTML in `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/maestro/` sono già stati validati nel ciclo UX (sessioni Cowork pre-2026-05-21). Vengono **copiati as-is** in `evolutive/EVO-006-portale-maestro/visual/` + accompagnati da `visual/README.md` che documenta gli scostamenti dal DS attuale (DS è cambiato post-EVO-012 con utility `.photo-bg-{color}`). **No Claude Design re-run** — saving 1-2 giorni.
- **Dual ruolo `GENITORE + ISTRUTTORE`**: supportato. Dashboard `/portale` concatena i blocchi genitore esistenti (EVO-014) in alto + sezione "Come Maestro" sotto. NavBar mostra entrambi i set di link. Logica `auth.sessionClaims?.role` → può essere stringa o array di ruoli; nei consumer normalizzare con un helper.

---

## 2. Ambito

### In scope

1. **Schema Airtable** (ridotto post-scoperta as-is): aggiunta via MCP di **solo 2 campi**:
   - `TABELLA_LEZIONI.NOTE_INTERNE` (multilineText) — unico nuovo.
   - `TABELLA_MAESTRI.DISCIPLINE` (multipleSelects: `MTB`, `BDC` — non "Strada" per coerenza con `TIPO_SESSIONE` che usa `BDC`).
   - **Riusi senza nuovi campi**: `NOTE_ATTIVITA` (esistente, "visibile ai genitori") = NOTE_PUBBLICHE UX; `ATTIVITA_SVOLTE` (multipleSelects con 10 valori predefiniti) = "Argomento" UX in chip form; `MAESTRO_COMPILATORE` (esistente) = ownership check 30gg.
2. **Linking lazy sync MAESTRI** (rivisto post-scoperta as-is): non serve nuovo `CLERK_USER_ID`. Il campo `TABELLA_MAESTRI.UTENTE` (multipleRecordLinks → `TABELLA_GENITORI`) + lookup `AUTH_USER_ID` è già impostato come canale. Helper riusabile `syncMaestroLinkedToGenitore(genitoreRecordId, email)`, chiamato dal layout `(portal)/layout.tsx` dopo `syncGenitore` quando il record genitore ha `RUOLO === 'ISTRUTTORE'`: cerca `TABELLA_MAESTRI` per `EMAIL` match e popola `UTENTE = [genitoreRecordId]` se non già linkato. Errore handled con messaggio "Contattare admin per associare l'account maestro" se email non trovata.
3. **Middleware `proxy.ts`**: verifica copertura `/portale/lezioni/*` e `/portale/gare-assegnate/*` per `ISTRUTTORE + ADMIN` (vedi AGENTS.md §Middleware). Completare se mancante.
4. **NavBar ruolo-aware**: link "Le mie lezioni" e "Gare assegnate" per ISTRUTTORE in `NavLinks.tsx` + `MobileMenu.tsx`. Nel caso dual ruolo, entrambi i set visibili.
5. **5 schermate UX**:
   - M-1: sezione "Come Maestro" nella `/portale` per utenti con role contenente ISTRUTTORE.
   - M-2: `/portale/lezioni` lista raggruppata per mese, filtri mese/anno.
   - M-3: `/portale/lezioni/nuova` form (5 sezioni come da UX_DETTAGLIO_MAESTRO).
   - M-4: `/portale/lezioni/[id]` modifica/dettaglio con guard 30gg + ownership.
   - M-5: `/portale/gare-assegnate` toggle future/passate.
6. **Backend Airtable client** in `src/lib/airtable-portale.ts`: `getMaestroByClerkId`, `getLezioniByMaestro` (filtro mese/anno + raggruppamento), `getLezioneById`, `createLezione`, `updateLezione` (guard 30gg + ownership), `deleteLezione` (solo admin), `getAllMaestriAttivi`, `getBambiniAttiviFiltratiPerDisciplina`, `getGareAssegnateAlMaestro` (future/passate). Server Actions wrapper per write.
7. **Privacy bambini lato maestro**: helper `bambinoForMaestroView()` che proietta solo `nome`, `cognome`, `foto`, `categoria_FCI`, `data_nascita`. Mai genitore/pagamenti/certificati.
8. **Caso dual ruolo** (rivisto post-scoperta as-is): `RUOLO` su Airtable resta singleSelect (un solo valore tra `GENITORE` | `ISTRUTTORE` | `ADMIN`). Il "dual ruolo" si **deriva dai dati**: utente con `RUOLO=ISTRUTTORE` e `TABELLA_BAMBINI` linkati dal record genitore → mostra entrambe le viste (Come Maestro in alto + I miei figli sotto). Nessun nuovo schema/normalizer di array. NavBar `getLinksForRole("ISTRUTTORE")` va estesa nel caso dual con "I miei figli", "Iscrizioni", "Pagamenti" prepended al menu maestro (decisione UX in F5/F6).
9. **Validazioni server**: data lezione ≤ oggi, warning soft su lezione duplicata (stesso giorno + maestro), guard 30gg, ownership check, bambino deve risultare attivo (iscritto a corso attivo dell'anno corrente).
10. **Toast/feedback**: pattern già usato in EVO-014 (banner reassurance) e EVO-005 (success param).

### Out of scope

1. **Viste admin sui dati lezioni** (`/portale/admin/lezioni`, `/portale/admin/presenze-maestri`) → EVO-007.
2. **Tab "Diario" sul profilo bambino genitore** (G-3.6 UX_REDESIGN) → gancio futuro abilitato dalla sola scrittura di `NOTE_PUBBLICHE` qui; UI sarà aggiunta in estensione separata di EVO-003 o EVO-007.
3. **Notifiche email post-lezione** → Make.com out-of-band se/quando servono.
4. **Filtri avanzati M-2** (toggle "Solo mie / Tutte con co-maestri" + filtro bambino) → iterazione successiva.
5. **Stats footer del mese M-2** ("Totale 8 lezioni · 67 presenze bambini") → nice-to-have, rinviabile.
6. **Onboarding via invito Clerk** → alternativa al lazy sync, non necessaria ora.
7. **Eliminazione lezione lato maestro** → sempre solo admin, bottone non visibile a ISTRUTTORE.
8. **Sezione admin "Bambini iscritti confermati" su pagina gara** → link M-5 punta alla pagina `/portale/gare/[id]` esistente di EVO-005, niente extra qui.
9. **Migrazione lezioni storiche da legacy Astro** → da verificare in Fase 3 se popolato; di default OUT, follow-up dedicato se serve.
10. **Backfill valori `DISCIPLINE` sui 9 record `TABELLA_MAESTRI`** → operazione manuale post-merge dell'utente. Fino al backfill il filtro discipline nel form M-3 ha fallback "Tutti".

---

## 3. Analisi as-is

### Stack tecnologico

Da `package.json` v0.1.0: Next.js **16.2.6**, React **19.2.4**, Tailwind CSS v4, Clerk `@clerk/nextjs` **7.3.7** + `svix` per webhook, `@aws-sdk/client-s3` per Cloudflare R2, `class-variance-authority` + `tailwind-merge` per varianti DS, `lucide-react` **0.468.0** (pinnato — vedi D-14), `react-easy-crop` per foto bambino, `zod` per validazioni. **Niente i18n attivo** (solo italiano). **Niente test runner** (jest/playwright assenti — quality gate = lint + typecheck + build). Lint: `eslint` v9 + `eslint-config-next`. Typecheck: implicito via `next build`.

### Design system as-is

Globals in `src/app/globals.css` (Tailwind v4 + token CSS variables + utility custom). Componenti UI in `src/components/ui/` (DS v0.1 esteso da EVO-012). Utility `.photo-bg-{color}` introdotte in EVO-012 disponibili per card decorative. Pattern coerenti con il resto del portale: `Button` con `variant="primary"` navy, `Card` rounded-3xl, helper `cn()` in `src/lib/utils.ts`. Colori per categorizzazione (riusati da EVO-005 helper `tipoXStyle`): flag/grass/ember/sky/sun/navy. Nessun nuovo token DS richiesto.

### Localizzazione (i18n)

**n/a** — l'app è monolingua italiano. Tutte le stringhe sono inline nei componenti. Convenzione: testi in italiano, error messages in italiano. **Nessun cambiamento** per EVO-006.

### SEO as-is

`src/lib/seo.ts` (hardcoded `SITE_URL` = `https://trionoracing-next.vercel.app`, sarà cambiato al cutover DNS — vedi D-27). Routes `/portale/*` sono **`noindex`** by default (area autenticata) — nessuna metadata SEO richiesta. **Nessun cambiamento SEO** per EVO-006: dimensione SEO viene marcata `n/a` in Fase 5.

### File rilevanti per l'evolutiva

**Modificare** (esistenti):
- `src/lib/airtable-portale.ts` — aggiungere nuovo blocco `// ─── TABELLA_LEZIONI + TABELLA_MAESTRI (EVO-006)` con tutte le funzioni CRUD lato maestro. Espandere l'export di `Lezione` con i campi reali (vs interfaccia minima attuale per il solo tab Diario read-only).
- `src/lib/portale-utils.ts` — aggiungere helper `lezionePuoEsereModificata(dataLezione, isAdmin) → boolean` (guard 30gg) + eventuali helper di formatting "mese · N lezioni".
- `src/app/portale/(portal)/layout.tsx` — estendere `syncGenitore` con un secondo step `syncMaestroLinkedToGenitore(genitoreRecordId, email)` quando `ruolo === 'ISTRUTTORE'`.
- `src/app/portale/(portal)/page.tsx` (dashboard `/portale`) — branchare per role: ISTRUTTORE → sezione "Come Maestro" (oggi mostra solo dashboard genitore). Dual ruolo → concatena.
- `src/components/portale/PortaleNavBar.tsx` — gestire dual ruolo (caso `ISTRUTTORE` con bambini linkati): prepend link genitore al menu maestro. Il single-role ISTRUTTORE è già coperto al rigo 18-24 del file.

**Creare** (nuovi):
- `src/app/portale/(portal)/lezioni/page.tsx` — M-2 lista lezioni.
- `src/app/portale/(portal)/lezioni/nuova/page.tsx` — M-3 form nuova lezione.
- `src/app/portale/(portal)/lezioni/[id]/page.tsx` — M-4 modifica/dettaglio.
- `src/app/portale/(portal)/gare-assegnate/page.tsx` — M-5 toggle future/passate.
- `src/components/portale/lezioni/` — nuova cartella (es. `CardLezione`, `FormLezione`, `BambiniSelector`, `MaestriSelector`, `AttivitaChips`).
- `src/components/portale/dashboard/SezioneMaestro.tsx` — blocco "Come Maestro" della dashboard ruolo-aware.
- Server Actions wrappate accanto alle pagine (Pattern EVO-005): `actions.ts` con `createLezione`, `updateLezione`, `getBambiniSelezionabiliPerMaestro`.

**Verificare ma non toccare** (già a posto):
- `src/proxy.ts` (riga 29-32) — `/portale/lezioni(.*)` e `/portale/gare-assegnate(.*)` già protette per ISTRUTTORE+ADMIN ✅.
- `src/components/portale/NavLinks.tsx` + `MobileMenu.tsx` — generici, ricevono `links: NavLink[]` ✅.
- `src/app/api/clerk/webhook/route.ts` — webhook `user.created` resta com'è; il flusso maestro passa via lazy sync layout.

### Schema Airtable verificato (via MCP, 2026-05-24)

**`TABELLA_LEZIONI`** (id `tblZcBzamh5ASweNa`) — esiste già quasi completa:
- `ID_LEZIONE` (formula primary), `DATA` (date), `progressivo` (autoNumber).
- `TIPO_SESSIONE` (singleSelect): `Lezione MTB Ciclodromo` | `Lezione BDC Ciclodromo` | `Gara Giovanissimi`.
- `ATTIVITA_SVOLTE` (**multipleSelects**, 10 valori predefiniti: Tecnica di base, Gestione curve, Frenata e discesa, Equilibrio e coordinazione, Lavoro in salita, Resistenza e condizionamento, Tattica di gara, Uscita su strada, Simulazione dinamiche di gara, Abilità fuori strada). **In EVO-006 funge da "Argomento" UX in chip form.**
- `NOTE_ATTIVITA` (multilineText, "visibile ai genitori"). **In EVO-006 è il `NOTE_PUBBLICHE` UX.**
- `BAMBINI_PRESENTI` (multipleRecordLinks → TABELLA_BAMBINI).
- `MAESTRI_PRESENTI` (multipleRecordLinks → TABELLA_MAESTRI) — co-maestri presenti alla lezione.
- `MAESTRO_COMPILATORE` (multipleRecordLinks → TABELLA_MAESTRI) — chi ha registrato la lezione. **Ownership check 30gg.**
- `GARA` (multipleRecordLinks → Gare Giovanili Umbria 2026) — solo se TIPO_SESSIONE = "Gara Giovanissimi".
- `PUBLISHED` (checkbox) — visibilità area riservata genitori.
- `DATA_COMPILAZIONE` (dateTime auto).
- **Da aggiungere in EVO-006**: `NOTE_INTERNE` (multilineText).

**`TABELLA_MAESTRI`** (id `tbllvUh6yh0S93gy0`):
- `NOME_MAESTRO`, `COGNOME_MAESTRO` (singleLineText), `EMAIL` (email), `TELEFONO` (phoneNumber).
- `CODICE_FCI` (singleLineText), `QUALIFICA` (singleSelect: `TI2 - Tecnico Istruttore` | `AT1 - Assistente Tecnico`).
- `ATTIVO` (checkbox), `PUBLISHED` (checkbox), `FOTO` (url), `NOTE` (multilineText).
- `GARE_ACCOMPAGNATE` + `Gare Giovanili Umbria 2026` (multipleRecordLinks → Gare).
- `LEZIONI_COME_MAESTRO`, `LEZIONI_COME_COMPILATORE` (multipleRecordLinks → TABELLA_LEZIONI).
- **`UTENTE`** (multipleRecordLinks → **TABELLA_GENITORI**) + **`AUTH_USER_ID`** (multipleLookupValues da UTENTE.AUTH_USER_ID). **Pattern di linking Clerk già impostato — usare questo, non aggiungere CLERK_USER_ID.**
- **Da aggiungere in EVO-006**: `DISCIPLINE` (multipleSelects: `MTB`, `BDC`).

**`Gare Giovanili Umbria 2026`** (id `tblDlFOIjAhbT0QHD`) — già usato in EVO-005:
- `Maestro Accompagnatore` (multipleRecordLinks → TABELLA_MAESTRI) — campo storico legacy.
- `TABELLA_MAESTRI` (multipleRecordLinks) — campo più recente, usato anche da legacy `patchGaraMaestri`. **In EVO-006 M-5 si filtra via `TABELLA_MAESTRI = {maestroId}` (verificare semantica: probabilmente è il campo "ufficiale" usato per assegnare i maestri).**

**Vocabolari singleSelect verificati per evitare scivolone EVO-005-style**:
- `TABELLA_GENITORI.RUOLO`: `GENITORE` | `ADMIN` | `ISTRUTTORE` ✅
- `TABELLA_LEZIONI.TIPO_SESSIONE`: `Lezione MTB Ciclodromo` | `Lezione BDC Ciclodromo` | `Gara Giovanissimi`
- `TABELLA_MAESTRI.QUALIFICA`: `TI2 - Tecnico Istruttore` | `AT1 - Assistente Tecnico`

### Helper esistenti in `portale-utils.ts` riusabili

`formatDateIT`, `meseITLabel`, `daysUntil`, `diffInYears`, `titoloLabel`, `getStatoIscrizioneAnnoCorrente`, `categoriaCompatibile`, `certBadgeVariant`, `buildScadenze`. Riuso totale, niente duplicazione.

### Pattern noti da AGENTS.md applicabili a EVO-006

- **stripReadOnlyFields()** prima di ogni write Airtable (evita 422 su formule/lookup).
- **Lazy sync in layout** (EVO-002): da estendere per il maestro.
- **Helper aggregatori `get{Risorsa}ByGenitore`** (EVO-013/015): pattern analogo `getLezioniByMaestro`, `getGareAssegnateAlMaestro`.
- **Server Action multi-write con `revalidatePath` + redirect ?success=N** (EVO-005): pattern per `createLezione`.
- **Verifica schema Airtable PRIMA di codare** (EVO-005): fatto in questa F3 via MCP `get_table_schema`.
- **Env table-name parametrizzata** (EVO-005): la tabella gare già usa `AIRTABLE_TABLE_GARE` parametrizzata, riutilizzabile.
- **Tile colorato con palette DS** (EVO-005, EVO-014): per categorizzazione TIPO_SESSIONE (MTB → flag/grass? · BDC → sky/flag? · Gara → ember/sun?) — da decidere in F6.

---

## 4. Soluzione e WBS

### Soluzione proposta

Estendere il portale Next.js con l'area maestro `(portal)/lezioni/*` + `(portal)/gare-assegnate/*` riusando middleware e NavBar ruolo-aware già pronti. Aggiungere 2 campi minimali allo schema Airtable (`NOTE_INTERNE` su LEZIONI, `DISCIPLINE` su MAESTRI). Estendere il lazy sync del layout per linkare il record `TABELLA_MAESTRI` corrispondente al record `TABELLA_GENITORI` via email match (campo `UTENTE`). Implementare il blocco "Come Maestro" nella dashboard `/portale` (con sezione concatenata per i casi dual ruolo derivati dai dati). Aggiungere ~10 funzioni CRUD/query in `airtable-portale.ts` per lezioni/maestri/gare-assegnate, server actions con guard 30gg e ownership check via `MAESTRO_COMPILATORE`, e i 5 visual UX adattati ai 4 scostamenti identificati in F3.

### WBS

**1. Schema Airtable (via MCP, in F7 prima del codice)**
- 1.1 Aggiungere `TABELLA_LEZIONI.NOTE_INTERNE` (multilineText). Stima: S.
- 1.2 Aggiungere `TABELLA_MAESTRI.DISCIPLINE` (multipleSelects, choices: `MTB`, `BDC`). Stima: S.
- 1.3 (Manuale post-merge, fuori codice): backfill `DISCIPLINE` per i 9 record MAESTRI esistenti.

**2. Tipi TypeScript + costanti (`src/lib/airtable-portale.ts`)**
- 2.1 Espandere interface `Lezione` con tutti i campi reali. Stima: S. Dip: 1.1.
- 2.2 Nuova interface `Maestro` (NOME, COGNOME, EMAIL, QUALIFICA, DISCIPLINE, FOTO, ATTIVO, UTENTE, AUTH_USER_ID). Stima: S. Dip: 1.2.
- 2.3 Costanti `TIPO_SESSIONE_VALUES`, `ATTIVITA_SVOLTE_VALUES`, `MAESTRO_QUALIFICHE`, `DISCIPLINE_VALUES` `as const readonly`. Stima: S.
- 2.4 `WRITABLE_FIELDS_LEZIONI` + `WRITABLE_FIELDS_MAESTRI` Sets per `stripReadOnlyFields()`. Stima: S.

**3. Funzioni Airtable client (`src/lib/airtable-portale.ts`)**
- 3.1 `getMaestroByEmail(email)` + `getMaestroByGenitoreId(genitoreRecordId)`. Stima: S. Dip: 2.2.
- 3.2 `linkMaestroToGenitore(maestroId, genitoreId)`. Stima: S. Dip: 2.2.
- 3.3 `getAllMaestriAttivi()` (filtro `ATTIVO=true`, sort cognome). Stima: S. Dip: 2.2.
- 3.4 `getLezioniByMaestro(maestroId, annoOpt, meseOpt)` — pattern aggregatore EVO-013/015 con UNION `MAESTRO_COMPILATORE` + `MAESTRI_PRESENTI`. Stima: M. Dip: 2.1.
- 3.5 `getLezioneById(id)` con expand co-maestri + bambini. Stima: S. Dip: 2.1.
- 3.6 `createLezione(input, maestroCompilatoreId)` — set `MAESTRO_COMPILATORE`, `DATA_COMPILAZIONE = now`, `PUBLISHED = true`, valida data ≤ oggi. Stima: M. Dip: 2.4.
- 3.7 `updateLezione(id, patch, currentMaestroId, isAdmin)` — guard: maestro = compilatore originale OR co-maestro OR admin; guard 30gg per non-admin. Stima: M. Dip: 3.5 + 6.1.
- 3.8 `getBambiniAttiviPerDisciplina(disciplinaOpt)` — leggere da `TABELLA_ISCRIZIONI` anno corrente filtrando per `CORSO` (mapping `Strada↔BDC`). Stima: M.
- 3.9 `getGareAssegnateAlMaestro(maestroId, scope: 'future'|'past')`. Stima: S.

**4. Server Actions (`src/app/portale/(portal)/lezioni/actions.ts`)**
- 4.1 `actionCreateLezione(formData)` — wrapper 3.6 + ownership via Clerk→maestro→genitore + `revalidatePath('/portale/lezioni')` + `redirect('?success=1')`. Stima: M. Dip: 3.6.
- 4.2 `actionUpdateLezione(formData)` — wrapper 3.7 + revalidate lezione + lista. Stima: M. Dip: 3.7.

**5. Layout portale: lazy sync maestro (`src/app/portale/(portal)/layout.tsx`)**
- 5.1 Estendere `syncGenitore()` con chiamata a `syncMaestroLinkedToGenitore(genitoreId, email)` quando `ruolo === 'ISTRUTTORE'`. Stima: M. Dip: 3.1+3.2.
- 5.2 Gestire errore "email non trovata in MAESTRI" non-bloccante (log warn, sezione maestro vuota con messaggio "Contattare admin").

**6. Helper `portale-utils.ts`**
- 6.1 `lezionePuoEssereModificata(dataLezione, isAdmin) → { canEdit, reason? }` (guard 30gg). Stima: S.
- 6.2 `tipoSessioneStyle(tipo) → { bg, text, shortLabel }` (pattern EVO-005 `tipoXStyle`). Stima: S.
- 6.3 `groupLezioniByMese(lezioni) → Map<chiaveMese, Lezione[]>`. Stima: S.

**7. Componenti UI portale maestro (`src/components/portale/lezioni/` + `dashboard/`)**
- 7.1 `CardLezione.tsx` (Server). Stima: M. Dip: 6.2.
- 7.2 `FormLezione.tsx` (Client) — 5 sezioni adattate F3. Stima: L. Dip: 4.1/4.2.
- 7.3 `AttivitaChips.tsx` (Client) multi-select 10 tag. Stima: S. Dip: 2.3.
- 7.4 `BambiniSelector.tsx` (Client) con filtro disciplina + ricerca testo. Stima: M. Dip: 3.8.
- 7.5 `MaestriSelector.tsx` (Client) chips multi-select (default: io). Stima: S. Dip: 3.3.
- 7.6 `CardGaraAssegnata.tsx` (Server) — riusa pattern `CardGara` di EVO-005. Stima: S. Dip: 3.9.
- 7.7 `BannerLezioneNonModificabile.tsx` (Server) ember "lezione oltre 30gg". Stima: S. Dip: 6.1.

**8. Pagine route (`src/app/portale/(portal)/`)**
- 8.1 `lezioni/page.tsx` (M-2) — lista raggruppata mese + filtri. Stima: M. Dip: 7.1+6.3.
- 8.2 `lezioni/nuova/page.tsx` (M-3). Stima: M. Dip: 7.2+4.1.
- 8.3 `lezioni/[id]/page.tsx` (M-4) — modifica/dettaglio con guard. Stima: M. Dip: 7.2+7.7+4.2+6.1.
- 8.4 `gare-assegnate/page.tsx` (M-5) toggle future/passate. Stima: S. Dip: 7.6.

**9. Dashboard `/portale` ruolo-aware (M-1)**
- 9.1 `src/components/portale/dashboard/SezioneMaestro.tsx`. Stima: L. Dip: 3.4+3.9+7.6.
- 9.2 `src/app/portale/(portal)/page.tsx` branch ruolo-aware (ISTRUTTORE puro / ISTRUTTORE+figli / GENITORE / ADMIN redirect). Stima: M.

**10. NavBar ruolo-aware estesa (`src/components/portale/PortaleNavBar.tsx`)**
- 10.1 Caso ISTRUTTORE dual ruolo: prepend menu genitore al menu maestro tramite check `getGenitoreByClerkId(userId).fields.TABELLA_BAMBINI?.length > 0`. Stima: S.

**11. Smoke test guidato in dev + verifica post-deploy**
- 11.1 Smoke locale: lezione mock con data oggi · 25gg fa · 35gg fa → verifica guard 30gg + ownership.
- 11.2 Smoke dual ruolo: account test con `RUOLO=ISTRUTTORE` + bambino linkato → dashboard concatenata + NavBar entrambi i menu.
- 11.3 Smoke post-deploy: verifica `/portale/lezioni`, `/portale/lezioni/nuova`, `/portale/gare-assegnate` con maestro reale; privacy bambini rispettata.

### Ordine di esecuzione

1. Schema Airtable via MCP (1.1, 1.2)
2. Tipi + costanti + WRITABLE_FIELDS (2.x)
3. Funzioni Airtable client (3.1 → 3.9)
4. Helper portale-utils (6.x)
5. Lazy sync maestro nel layout (5.x)
6. Server Actions (4.x)
7. Componenti UI maestro (7.x)
8. Pagine route (8.x)
9. Dashboard ruolo-aware + NavBar (9.x, 10.x)
10. Smoke test guidato + verifica (11.x)

### Rischi e assunzioni

- **R1**: due campi link Maestri su tabella Gare (`Maestro Accompagnatore` vs `TABELLA_MAESTRI`) — verificare empiricamente quale è il "canale ufficiale" per assegnare maestri a gare. Fallback: UNION dei due.
- **R2**: la "disciplina" del bambino deriva da `TABELLA_ISCRIZIONI.CORSO` con mapping `Strada↔BDC`. Verificare in F7 i valori esatti di `CORSO`.
- **R3**: ownership co-maestro (UX 2026-05-21 dec. #5): tutti i co-maestri possono modificare. Helper `lezionePuoEssereModificata` accetta anche caso co-maestro.
- **R4**: admin che è anche maestro → `permanentRedirect` a `/portale/admin`, niente dashboard concatenata in EVO-006.
- **R5**: backfill DISCIPLINE manuale post-merge → fallback "Tutti" + warning soft nel form M-3.
- **A1**: `getLezioniByMaestro` con UNION linked records potrebbe essere lento — fallback aggregator pattern EVO-013/015 se serve.
- **A2**: scostamento ATTIVITA_SVOLTE va documentato esplicito in `visual/README.md` (cf. EVO-005 R-2 e EVO-010 easter egg pattern).

### Verifica rilasciabilità

**Singolo deploy** confermato (utente 2026-05-24). Un branch `feat/portale-maestro` → una PR → un merge → deploy automatico Vercel. Le 5 schermate sono interconnesse via dati (dashboard M-1 dipende da getLezioniByMaestro e getGareAssegnate) e nessuna fa abbastanza valore stand-alone da giustificare lo split. Stima Claude Code: 4-7 giorni.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ coerente | Riusa interamente componenti UI esistenti. Nuovi componenti (`CardLezione`, `FormLezione`, `CardGaraAssegnata`, `BannerLezioneNonModificabile`) seguono pattern già usati in EVO-005/014. Tile colorato `TIPO_SESSIONE` userà palette DS (decisione F6: sky=BDC, grass=MTB, ember=Gara). Nessun nuovo token DS richiesto. `.photo-bg-navy` di EVO-012 disponibile per hero `SezioneMaestro`. |
| Struttura/architettura | ✅ coerente | Rispetta tutte le convenzioni AGENTS.md: middleware `proxy.ts` ruolo-aware (già pronto, riga 29-32), route group `(portal)`, separazione Server/Client Components, `stripReadOnlyFields()` pre-write, helper aggregator `get{X}ByMaestro` (pattern EVO-013/015), Server Actions con `revalidatePath` + redirect `?success=N` (pattern EVO-005), lazy sync in layout (pattern EVO-002 esteso), tipi `as const readonly` per vocabolari (pattern EVO-005/015), email match per linking (pattern EVO-002). |
| Localizzazione (i18n) | n/a | App monolingua italiano. Tutte le nuove stringhe in italiano coerentemente col resto. |
| SEO | n/a | Route `/portale/*` area autenticata, non indicizzate. Nessun impatto sitemap/robots/structured data. |

### Correzioni applicate alla WBS

**Nessuna correzione necessaria** — la WBS recepisce già tutti i pattern e vincoli del progetto identificati in F3. I rischi R1-R5 di §4 sono risolvibili **in implementazione** senza modifiche di scope.

---

## 6. UX/UI

### Origine dei visual

I 5 visual di EVO-006 **non sono stati generati con Claude Design in questa fase** — esistono già 5 mockup HTML standalone prodotti durante il ciclo UX pre-2026-05-21 (sessione Cowork). Decisione utente in Fase 1: **riusarli as-is**, no re-run Claude Design (saving 1-2 giorni). Visual originali in `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/maestro/`.

### Visual finali

Copia dei 5 mockup in [`visual/`](visual/):

- [`visual/dashboard.html`](visual/dashboard.html) — M-1 Dashboard maestro (vista ISTRUTTORE puro)
- [`visual/lezioni-lista.html`](visual/lezioni-lista.html) — M-2 Storico lezioni
- [`visual/lezioni-nuova.html`](visual/lezioni-nuova.html) — M-3 Nuova lezione (form 5 sezioni)
- [`visual/lezioni-dettaglio.html`](visual/lezioni-dettaglio.html) — M-4 Modifica/dettaglio
- [`visual/gare-assegnate.html`](visual/gare-assegnate.html) — M-5 Gare assegnate

### Note di design e scostamenti vs mockup

I mockup contengono ipotesi UX precedenti all'analisi as-is di EVO-006. Tutti gli scostamenti che Claude Code deve applicare sono documentati in [`visual/README.md`](visual/README.md):

1. **M-3/M-4 "Argomento"** → chips multi-select `ATTIVITA_SVOLTE` (10 valori pronti), non input text.
2. **M-3/M-4 "Note pubbliche"** → riusa campo Airtable `NOTE_ATTIVITA` esistente.
3. **M-3 filtro discipline** = `MTB | BDC | Tutti` (non Strada).
4. **M-1 hero** = "Ciao {NOME}, {QUALIFICA}" (TI2/AT1 da Airtable).
5. **Tile colorato `TIPO_SESSIONE`** = MTB grass · BDC sky · Gara ember (helper centralizzato `tipoSessioneStyle`).
6. **M-1 dual ruolo** = derivato dai dati (figli linkati), no array RUOLO.
7. **M-5 toggle** = query param `?scope=future|past`.
8. **Easter egg da bonificare** (pattern EVO-010).

DS aggiornamenti post-mockup:
- `.photo-bg-navy` (EVO-012) per hero `SezioneMaestro`.
- Pattern banner reassurance EVO-014 + tile colorato EVO-005.

---

## 7. Prompt per Claude Code

Vedi [`EVO-006-portale-maestro/prompt-claude-code.md`](EVO-006-portale-maestro/prompt-claude-code.md). Il prompt copre l'intero ciclo: schema Airtable via MCP → tipi → funzioni client → helper → lazy sync layout → server actions → componenti UI → pagine → dashboard ruolo-aware + NavBar dual ruolo → quality gate (lint+typecheck+build) → smoke test guidato in dev (10 voci) → branch + PR con body strutturato → attesa OK utente per merge → merge squash → verifica post-deploy in produzione → auto-verifica via `verify-implementation` (o report manuale equivalente).

### Pattern di deploy del progetto

Già documentato in AGENTS.md §Deploy: Vercel collegato a GitHub `lucamorettig-coder/trionoracing-next`, branch principale `main`. Pattern: branch dedicato → PR → squash merge → deploy automatico Vercel (~2-3 min). Nessun comando manuale richiesto post-merge.

---

## 8. Verifica e go-live

**Merge**: PR [#28](https://github.com/lucamorettig-coder/trionoracing-next/pull/28) squash su `main` 2026-05-24 (commit `5cd3293`). Deploy Vercel automatico a `https://trionoracing-next.vercel.app/portale/lezioni`.

### Iter implementativo

5 commit progressivi sul branch `feat/portale-maestro`, poi squash:

1. `84273cd` schema Airtable (NOTE_INTERNE, DISCIPLINE) + tipi/costanti + 9 funzioni client + 4 helper portale-utils.
2. `5352ba6` feature completa: lazy sync layout, Server Actions, 8 componenti UI, 4 pagine route, dashboard ruolo-aware, NavBar dual ruolo.
3. `c281c2b` **fix #1**: `getMaestroByGenitoreId` ridisegnata via email match — bug noto ARRAYJOIN su linked records (primary field `ID_GENITORE` invece del record ID). Sintomo: utente con UTENTE già popolato vedeva sempre "Account maestro non collegato".
4. `ba86f8d` **fix #2**: `getLezioniByMaestro` + `getGareAssegnateAlMaestro` via inverse relationship (`LEZIONI_COME_COMPILATORE` + `LEZIONI_COME_MAESTRO` + `GARE_ACCOMPAGNATE`). Bug analogo (primary field `NOME_MAESTRO`). Sintomo: 16 lezioni reali su Airtable, lista sempre vuota.
5. `60511de` cleanup banner "Lezione in sola lettura": rimossa riga "Contatta admin@trionoracing.it" su richiesta utente.
6. `634594e` `CardGaraAssegnata` non clickable: la pagina `/portale/gare/[id]` di EVO-005 è per il flusso genitore e fa `notFound()` su gare passate → 404 per maestro. Vista dettaglio gara per maestro parcheggiata (EVO-007 / evolutiva dedicata).

### Quality gate

- ✅ `npx tsc --noEmit` — 0 errori
- ✅ `npm run lint` — 0 errori (8 warning pre-esistenti)
- ✅ `npm run build` — 38 pagine, 4 nuove route maestro

### Smoke test dev (validato dall'utente)

- ✅ Login maestro `luca.moretti@icloud.com` (ISTRUTTORE) → lazy sync OK, `TABELLA_MAESTRI.UTENTE` popolato.
- ✅ Dashboard `/portale` mostra hero "Come Maestro · Ciao Luca" + dual ruolo concatenato con dashboard genitore sotto.
- ✅ NavBar dual ruolo (Home, I miei figli, Iscrizioni, Pagamenti, Le mie lezioni, Gare assegnate, Profilo).
- ✅ `/portale/lezioni` lista 16 lezioni reali raggruppate per mese.
- ✅ `/portale/gare-assegnate` toggle future/passate funzionante.
- ✅ Banner "Lezione in sola lettura" mostrato per lezioni > 30gg (lato non-admin).

### Lavori rinviati a successive evolutive

- **Dettaglio gara per maestro** (lista bambini iscritti + note operative + accompagnatori): scope EVO-007 admin o evolutiva dedicata. Per ora `CardGaraAssegnata` mostra solo info senza click.
- **Filtro UI disciplina nel form M-3**: dipende dal backfill `TABELLA_MAESTRI.DISCIPLINE` (azione manuale post-merge utente). Fino al backfill `BambiniSelector` mostra tutti i bambini attivi senza filtro.

### Azioni manuali residue (utente)

1. **Backfill `DISCIPLINE`** sui 9 record `TABELLA_MAESTRI` esistenti (MTB / BDC / entrambi).
2. **Test login degli altri 8 maestri**: validare il lazy sync via email match. Se fallisce, verificare che `TABELLA_MAESTRI.EMAIL` coincida con l'email Clerk dell'utente.

---

## 9. Evolutive correlate

- **EVO-001** (ombrello F3) — parent dell'evolutiva.
- **EVO-002** (infra portale) — fornisce middleware ruolo-aware + webhook Clerk + NavBar; EVO-006 estende il lazy sync EVO-002 ai maestri.
- **EVO-003** (genitore core) — fornisce R2 client, portale-utils helpers, profilo bambino con futuro Tab "Diario" che leggerà le lezioni create qui.
- **EVO-005** (gare genitore) — fornisce `TABELLA_GARE`, helper `getGareFuture`/`getGaraById`, pattern card tile colorato; EVO-006 M-5 riusa `getGaraById` + aggiunge filtro "assegnate al maestro corrente".
- **EVO-007** (admin) — dipende da EVO-006 per le viste cross-maestro (`/portale/admin/lezioni`, `/portale/admin/presenze-maestri`). Da pianificare dopo.

---

## Log fasi

### [2026-05-24] Fase 8 — Verifica e go-live completata

PR #28 squash-merged su `main` (commit `5cd3293`). Deploy Vercel automatico. Smoke test dev validato dall'utente (login maestro reale + dashboard + lista lezioni con 16 record + gare assegnate). 4 fix incrementali applicati durante l'iter di test: (1) `getMaestroByGenitoreId` via email match per workaround bug ARRAYJOIN su linked records; (2) `getLezioniByMaestro` + `getGareAssegnateAlMaestro` via inverse relationship sullo stesso bug; (3) cleanup riga "Contatta admin" dal banner sola lettura; (4) `CardGaraAssegnata` non clickable per evitare 404 sulla pagina dettaglio gara EVO-005 (pensata per genitore, `notFound()` su gare passate). Stato → completata.

### [2026-05-24] Fase 7 — Implementazione completata

Branch `feat/portale-maestro` con 2 commit principali (schema/types/client + feature completa) eseguito secondo prompt. Schema Airtable applicato via MCP: `TABELLA_LEZIONI.NOTE_INTERNE` (fldiaPKG90fqAQELF) + `TABELLA_MAESTRI.DISCIPLINE` (fldee2BiQMWkhXomI). Quality gate 0 errori. PR #28 aperta con body strutturato.

### [2026-05-24] Fase 0 — Bootstrap completata

- ID assegnato: EVO-006. Slug: `portale-maestro` (già pre-registrato in `memory.md` riga 14).
- Letti: `AGENTS.md` (pattern fino a EVO-005), `memory.md`, `PROGETTO_MASTER.md` Cowork.
- Trovati assets di scoperta UX pre-esistenti: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/UX_DETTAGLIO_MAESTRO.md` (5 schermate documentate) + 5 mockup HTML in `mokup portale/Mockup Portale/maestro/`.
- Cartella creata: `evolutive/EVO-006-portale-maestro/visual/`.
- Decisione: la fase di scoperta UX è già conclusa, Fase 1 si trasforma in conferma/scope-fit (non discovery).

### [2026-05-24] Fase 7 — Prompt Claude Code generato

Prompt completo end-to-end salvato in `evolutive/EVO-006-portale-maestro/prompt-claude-code.md`. Copre: schema Airtable via MCP (2 campi nuovi: NOTE_INTERNE, DISCIPLINE) → tipi → 9 funzioni client → 3 helper → estensione lazy sync layout → 2 server actions → 8 componenti UI → 4 pagine route → dashboard ruolo-aware + NavBar dual ruolo → quality gate → 10 smoke test guidati in dev → PR con body strutturato → attesa OK utente → merge squash → smoke produzione → verify-implementation. Stato evolutiva aggiornato a `pronta per implementazione` (memory.md + scheda).

### [2026-05-24] Fase 6 — UX/UI completata

5 mockup HTML copiati in `evolutive/EVO-006-portale-maestro/visual/`. Scritto `visual/README.md` con 8 scostamenti documentati (Argomento chips, NOTE_ATTIVITA riuso, MTB/BDC, hero QUALIFICA, tile colorato, dual ruolo da dati, toggle scope, easter egg cleanup) + note DS post-EVO-012. **Nessun Claude Design re-run** — decisione utente F1.

### [2026-05-24] Fase 5 — Verifica coerenza completata

DS ✅ · Architettura ✅ · i18n n/a · SEO n/a. Nessuna correzione WBS richiesta. Rischi R1-R5 di §4 risolvibili in implementazione.

### [2026-05-24] Fase 4 — Soluzione + WBS completata

Soluzione "estensione naturale" del portale esistente (middleware e NavBar single-role già pronti). WBS 11 macro-task / ~35 sub-task, ordine esecuzione strettamente sequenziale (schema → tipi → client → helper → layout → actions → UI → pagine → dashboard → smoke). 5 rischi identificati (R1-R5), 2 assunzioni (A1-A2). **Verifica rilasciabilità: singolo deploy** confermato utente — un branch / una PR. Stima Claude Code 4-7 giorni.

### [2026-05-24] Fase 3 — Analisi as-is completata

Scoperte critiche via lettura file repo + MCP Airtable `get_table_schema`. 4 scostamenti vs UX iniziale validati dall'utente (tutti semplificano):

1. `ARGOMENTO_LEZIONE` text libero → usare `ATTIVITA_SVOLTE` multiSelect (10 valori predefiniti già pronti) come chips. **Mockup M-3 da adattare in F6.**
2. `NOTE_PUBBLICHE` nuovo campo → usare `NOTE_ATTIVITA` esistente (semantica identica).
3. `DISCIPLINE = MTB|Strada` → `MTB|BDC` per coerenza con `TIPO_SESSIONE`.
4. Nuovo `CLERK_USER_ID` su MAESTRI → usare campo `UTENTE` esistente (→ TABELLA_GENITORI).

Schema da modificare via MCP in F7 si riduce a **2 campi**: `TABELLA_LEZIONI.NOTE_INTERNE` + `TABELLA_MAESTRI.DISCIPLINE`. Caso dual ruolo derivato dai dati, no array di ruoli. Middleware `proxy.ts` già pronto (riga 29-32). NavBar ruolo-aware single-role già pronta; dual ruolo da estendere. SEO `n/a` (route portale `noindex`).

Ambito §2 aggiornato di conseguenza: in-scope #1 (schema) e #2 (linking) riformulati, in-scope #8 (dual ruolo) semplificato.

### [2026-05-24] Fase 2 — Definizione ambito completata

Ambito approvato senza modifiche. 10 voci in-scope, 10 voci out-of-scope. Decisioni rilevanti:

- Lezioni admin (`/portale/admin/lezioni`) e Tab "Diario" sul profilo bambino restano OUT (rispettivamente EVO-007 e estensione EVO-003).
- Eliminazione lezione: solo admin, bottone mai esposto al maestro.
- Backfill `DISCIPLINE` per i 9 maestri: operazione manuale post-merge dell'utente, fallback "Tutti" nel form M-3.
- Migrazione lezioni legacy Astro: da verificare in F3, di default OUT.

### [2026-05-24] Fase 1 — Raccolta requisiti completata

Risposte utente (round 1 + 2):

1. **Perimetro**: tutte e 5 le schermate UX (M-1 Dashboard, M-2 Lezioni lista, M-3 Nuova lezione, M-4 Modifica/dettaglio, M-5 Gare assegnate).
2. **Target utenti reali**: i 9 maestri registrati in `TABELLA_MAESTRI` (full team).
3. **Schema dati**: modifiche fatte parte di EVO-006 via MCP Airtable da Claude Code (+3 campi LEZIONI, +1 campo MAESTRI).
4. **Vincolo modifica**: 30 giorni per maestro, oltre solo admin.
5. **Linking Clerk ↔ MAESTRI**: lazy sync via email match al primo login (estensione pattern EVO-002).
6. **Visual workflow**: usa i 5 mockup esistenti as-is, no Claude Design re-run.
7. **Dual ruolo `GENITORE + ISTRUTTORE`**: supportato come da UX_DETTAGLIO_MAESTRO.

Output:
- Slug confermato: `portale-maestro`.
- Cartella + scheda evolutiva create.
- Bozza descrizione user-facing in §1.
- Decisioni di scope documentate in §1 "Decisioni di scope (Fase 1)".
