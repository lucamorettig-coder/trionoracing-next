# EVO-003 — F3.2: Area genitore core

- **ID**: EVO-003
- **Slug**: portale-genitore-core
- **Data inizio**: 2026-05-22
- **Data fine**: 2026-05-22
- **Stato**: completata
- **Tipo**: nuova feature
- **Area**: area autenticata (`/portale` — GENITORE)
- **Priorità**: alta
- **Evolutiva ombrello**: EVO-001

---

## 1. Requisiti

### Descrizione

Seconda sotto-evolutiva del portale (F3.2). Costruisce l'area genitore core su cui si appoggiano EVO-004 (iscrizioni) e EVO-005 (gare):
- Dashboard genitore reale (sostituisce il placeholder di EVO-002)
- Gestione anagrafica figli (lista, aggiunta, modifica, profilo a 6 tab)
- Upload certificato medico (PDF/JPG) con data scadenza → Cloudflare R2
- Upload foto bambino (JPG/PNG, crop quadrato) → Cloudflare R2
- Profilo genitore (dati anagrafici + gestione account via Clerk)

### Obiettivo principale

Nuova funzionalità abilitante: permette al genitore di caricare e gestire i dati necessari per iscrivere i propri figli ai corsi.

### Target utente

Utenti loggati con `RUOLO = GENITORE`.

### Dipendenze esterne note

- Cloudflare R2 — bucket `certificati-medici` (già configurato in EVO-002/F0)
- Airtable REST API — `TABELLA_BAMBINI`, `TABELLA_ISCRIZIONI` (read-only), `TABELLA_LEZIONI` (read-only)
- `@clerk/nextjs` — per profilo genitore (email/password/sessioni via Clerk)
- Dipende da: **EVO-002** (infra Clerk + NavBar + middleware)

---

## 2. Ambito

### In scope

- Dashboard genitore `/portale` — hero personalizzato + alert urgenti + card figli + scadenze + quick actions
- Lista figli `/portale/figli` — grid card con empty state
- Aggiungi figlio `/portale/figli/nuovo` — form 3 sezioni (Anagrafica + Residenza + Sport), `CATEGORIA_FCI` auto-calcolata server-side
- Profilo figlio `/portale/figli/[id]` — header sticky + 6 tab:
  - **Tab Anagrafica** — dati read-only + CTA "Modifica"
  - **Tab Certificato** — stato + upload drop zone + data scadenza
  - **Tab Foto** — upload con crop quadrato
  - **Tab Iscrizioni** — lista read-only con empty state (logica dati da EVO-004)
  - **Tab Gare** — lista read-only con empty state (logica dati da EVO-005)
  - **Tab Diario lezioni** — lista per mese con argomento + note pubbliche (dati da TABELLA_LEZIONI esistente)
- Modifica figlio `/portale/figli/[id]/modifica` — form pre-compilato
- Profilo genitore `/portale/profilo` — dati anagrafici + sicurezza Clerk + sessioni + logout
- API route upload certificato → R2 con validazione tipo + dimensione
- API route upload foto → R2 con crop quadrato lato client
- Estensione `airtable-portale.ts` con funzioni TABELLA_BAMBINI

### Out of scope

- Iscrizioni e pagamenti (EVO-004)
- Calendario gare e richiesta iscrizione gara (EVO-005)
- Invito secondo genitore (rimandato a EVO-004 o evolutiva dedicata — richiede INVITI_GENITORE)
- Area maestro (EVO-006)
- Area admin (EVO-007)
- Notifiche email/push
- Cancellazione account (solo microcopy "scrivi a privacy@triono.it")

---

## 3. Analisi as-is

### Stack tecnologico

Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind v4 (token in `globals.css`) · Clerk 7.x · shadcn/ui (Radix) · Cloudflare R2 (binding `R2`) · Airtable REST API.

### Design system as-is

- Token in `src/app/globals.css` (navy-700, sun-500, grass, ember, flag, ink, line, ecc.)
- Componenti DS in `src/components/ui/` (Button, Card, Badge, Input, Label, ecc.)
- Componenti portale in `src/components/portale/` (PortaleNavBar, NavLinks, MobileMenu — da EVO-002)
- `src/lib/clerk-appearance.ts` — tema Clerk (NON toccare)

### Localizzazione (i18n)

n/a — solo italiano.

### SEO

n/a — area `/portale/*` protetta da auth, non indicizzabile.

### File rilevanti per l'evolutiva

```
src/app/portale/(portal)/page.tsx          ← placeholder da sostituire
src/app/portale/(portal)/layout.tsx        ← layout con NavBar + lazy sync
src/lib/airtable-portale.ts                ← client Airtable (da estendere)
src/components/portale/                    ← componenti portale (estendere)
src/components/ui/                         ← DS (riutilizzare)
src/app/globals.css                        ← token DS
```

---

## 4. Soluzione e WBS

### Soluzione proposta

Estendere `airtable-portale.ts` con le funzioni TABELLA_BAMBINI, creare le API route per upload R2 (certificato + foto), e costruire le pagine dell'area genitore usando RSC per i dati e Client Components per le interazioni. La dashboard sostituisce il placeholder con dati reali da Airtable. Il profilo figlio usa un pattern a tab con URL hash per la navigazione.

### WBS

1. **Estensione client Airtable — TABELLA_BAMBINI** (M) — dipende da: nessuna
   - 1.1 Aggiungere tipi `Bambino`, `BambinoCreateInput`, `BambinoUpdateInput` in `airtable-portale.ts`
   - 1.2 `getBambiniByGenitore(genitoreAirtableId)` — lista figli del genitore
   - 1.3 `getBambinoById(id)` — singolo bambino
   - 1.4 `createBambino(data, genitoreAirtableId)` — crea con `CATEGORIA_FCI` auto-calcolata
   - 1.5 `updateBambino(id, data)` — aggiorna anagrafica
   - 1.6 `calcCategoriaFCI(dataNascita: string): string` — helper che calcola categoria FCI dall'anno di nascita secondo regolamento FCI vigente
   - 1.7 Aggiungere `WRITABLE_FIELDS` bambino (Set separato, evitare 422)
   - 1.8 `getIscrizioni ByBambino(bambinoId)` — read-only, per tab Iscrizioni
   - 1.9 `getLezioniBambino(bambinoId, anno, mese)` — read-only, per tab Diario

2. **API route upload R2** (M) — dipende da: nessuna (pattern indipendente)
   - 2.1 `src/app/api/portale/bambini/[id]/certificato/route.ts`
     - POST multipart/form-data: file (PDF/JPG/PNG, max 50MB) + `dataScadenza`
     - Validazione tipo MIME + dimensione
     - Upload → R2 con key `certificati/{bambinoId}/{timestamp}-{filename}`
     - PATCH TABELLA_BAMBINI: `URL_CERTIFICATO`, `DATA_SCADENZA_CERTIFICATO`
     - Risposta: `{ url, dataScadenza }`
   - 2.2 `src/app/api/portale/bambini/[id]/foto/route.ts`
     - POST multipart/form-data: file già croppato (JPG/PNG, max 5MB)
     - Upload → R2 con key `foto-bambini/{bambinoId}/{timestamp}.jpg`
     - PATCH TABELLA_BAMBINI: `URL_FOTO_BAMBINO`
     - Risposta: `{ url }`

3. **API route CRUD bambini** (S) — dipende da: 1
   - 3.1 `src/app/api/portale/bambini/route.ts` — POST crea bambino
   - 3.2 `src/app/api/portale/bambini/[id]/route.ts` — PATCH aggiorna anagrafica

4. **Dashboard genitore** (M) — dipende da: 1
   - 4.1 `src/app/portale/(portal)/page.tsx` — RSC: legge auth → ruolo → se GENITORE mostra dashboard genitore, se ISTRUTTORE redirect `/portale/lezioni`, se ADMIN redirect `/portale/admin`
   - 4.2 `src/components/portale/dashboard/DashboardGenitore.tsx` — Client/Server: hero personalizzato + alert + card figli + scadenze + quick actions

5. **Lista figli** (S) — dipende da: 1
   - 5.1 `src/app/portale/(portal)/figli/page.tsx` — RSC: fetch bambini del genitore
   - 5.2 `src/components/portale/figli/FiglioCard.tsx` — card riutilizzabile (anche in dashboard)

6. **Aggiungi figlio** (M) — dipende da: 1, 3
   - 6.1 `src/app/portale/(portal)/figli/nuovo/page.tsx` — Server page
   - 6.2 `src/components/portale/figli/AggiungiFiglioForm.tsx` — Client component con 3 sezioni, validazione CF, preview CATEGORIA_FCI

7. **Profilo figlio — scheletro + tab Anagrafica** (M) — dipende da: 1
   - 7.1 `src/app/portale/(portal)/figli/[id]/page.tsx` — RSC: fetch bambino + iscrizioni + lezioni
   - 7.2 `src/components/portale/figli/ProfiloFiglioHeader.tsx` — header sticky con badge stati
   - 7.3 `src/components/portale/figli/tabs/TabAnagrafica.tsx`

8. **Profilo figlio — tab Certificato + Foto** (M) — dipende da: 7, 2
   - 8.1 `src/components/portale/figli/tabs/TabCertificato.tsx` — DropZone + stato + upload
   - 8.2 `src/components/portale/figli/tabs/TabFoto.tsx` — upload con crop quadrato (react-easy-crop o simile)
   - 8.3 `src/components/portale/figli/DropZoneFile.tsx` — componente condiviso

9. **Profilo figlio — tab Iscrizioni, Gare, Diario** (S) — dipende da: 7
   - 9.1 `src/components/portale/figli/tabs/TabIscrizioni.tsx` — lista read-only + empty state (dati reali da EVO-004)
   - 9.2 `src/components/portale/figli/tabs/TabGare.tsx` — lista read-only + empty state (dati reali da EVO-005)
   - 9.3 `src/components/portale/figli/tabs/TabDiario.tsx` — lista lezioni per mese con argomento + note pubbliche (legge TABELLA_LEZIONI esistente)

10. **Modifica figlio** (S) — dipende da: 6, 7
    - 10.1 `src/app/portale/(portal)/figli/[id]/modifica/page.tsx` — form pre-compilato, riusa AggiungiFiglioForm

11. **Profilo genitore** (M) — dipende da: nessuna (standalone)
    - 11.1 `src/app/portale/(portal)/profilo/page.tsx` — RSC: fetch genitore da Airtable
    - 11.2 `src/components/portale/ProfiloGenitoreForm.tsx` — Client: form dati anagrafici + PATCH via API
    - 11.3 `src/app/api/portale/profilo/route.ts` — PATCH TABELLA_GENITORI (dati anagrafici)
    - 11.4 Sicurezza: email/password/sessioni delegate a Clerk (CTA apre Clerk UserProfile o managed pages)

### Ordine di esecuzione

1. Task 1 (Airtable TABELLA_BAMBINI)
2. Task 2 (API R2 upload) — in parallelo con Task 1
3. Task 3 (API CRUD bambini) — dopo Task 1
4. Task 4 (Dashboard) — dopo Task 1
5. Task 5 + 6 (Lista figli + Aggiungi) — dopo Task 3
6. Task 7 (Profilo scheletro + tab Anagrafica) — dopo Task 5
7. Task 8 (tab Certificato + Foto) — dopo Task 7 + 2
8. Task 9 (tab Iscrizioni + Gare + Diario) — dopo Task 7
9. Task 10 (Modifica) — dopo Task 6, 7
10. Task 11 (Profilo genitore) — può procedere in parallelo con 4-10

### Rischi e assunzioni

- **R1**: I field name esatti di `TABELLA_BAMBINI` su Airtable devono essere verificati in produzione prima di scrivere le funzioni client. Se non corrispondono a quanto nei docs → fermarsi e chiedere.
- **R2**: La libreria di crop foto non è ancora nel progetto — scegliere `react-easy-crop` (leggera, no dep extra) oppure gestire il crop client-side con canvas nativo.
- **A1**: R2 binding `R2` è già configurato in Vercel (da EVO-002/F0).
- **A2**: `TABELLA_BAMBINI` in Airtable ha i field name in MAIUSCOLO_UNDERSCORE e il campo `GENITORE` è un linked record a `TABELLA_GENITORI`.
- **A3**: Le tab del profilo figlio usano URL hash (`#anagrafica`, `#certificato`, ecc.) per navigazione lato client, senza modificare il routing Next.js.
- **A4**: Il tab Diario può mostrare dati reali già in questa EVO se `TABELLA_LEZIONI` ha `NOTE_PUBBLICHE` e `ARGOMENTO_LEZIONE` (i nuovi campi verranno aggiunti in EVO-006 — fino ad allora il tab mostra la data e i bambini presenti).

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | Token DS usati (navy, sun, grass, ember, flag, ink). Nuovi componenti (DropZone, FiglioCard, tab) costruiti su shadcn primitives. Nessun nuovo colore. |
| Struttura/architettura | ✅ | RSC per fetch dati; Client Components per interazioni (form, upload, crop). Route group `(portal)` mantenuto. API route in `api/portale/`. Componenti in `components/portale/figli/`. |
| Localizzazione (i18n) | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta da auth. |

---

## 6. UX/UI

### Visual di riferimento

Mockup HTML prodotti con Claude Design (sessione precedente). Percorso assoluto su macchina dell'utente:

```
/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/
  ├── dashboard.html          ← Schermata 1: Dashboard genitore
  ├── figli-lista.html        ← Schermata 2: Lista figli
  ├── figli-nuovo.html        ← Schermata 3: Aggiungi figlio
  ├── figli-dettaglio.html    ← Schermata 4: Profilo figlio (6 tab)
  ├── figli-modifica.html     ← Schermata 5: Modifica figlio
  └── profilo.html            ← Schermata 12: Profilo genitore
```

Spec UX dettagliata: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/UX_DETTAGLIO_GENITORE.md` (schermate 1-5 + 12).

---

## 7. Prompt per Claude Code

Vedi [`EVO-003-portale-genitore-core/prompt-claude-code.md`](EVO-003-portale-genitore-core/prompt-claude-code.md).

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing-next.vercel.app/portale
- **Pull Request**: #12 — `EVO-003: F3.2 Area genitore core (dashboard + figli + upload R2)`
- **Commit di merge**: `41f912e`
- **Commit implementazione**: `9cf6b57`
- **Fix post-implementazione**:
  - `4ada422` — fix mapping categorie FCI (bug nel mapping iniziale)
  - `7d2775c` — fix ProfiloFiglioTabs (tipo map di ReactNode)
  - `a2081d1` — fix allowedDevOrigins per test LAN iPhone
  - `56295ec` — fix mobile drawer fuori da header sticky + suppressHydration footer
  - `27fef85` — fix fallbackRedirectUrl su SignIn e SignUp → `/portale`
- **Data go-live**: 2026-05-22

### Esito sintetico

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | Token DS usati correttamente. Nuovi componenti coerenti con pattern existenti. |
| Architettura | ✅ | RSC per fetch, Client Components per form/upload/crop. Route group `(portal)` mantenuto. `portale-utils.ts` e `r2.ts` come nuovi moduli condivisi. |
| i18n | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta. |
| Criteri di accettazione | ✅ | Tutti i task della WBS implementati (37 file, +3299 righe). |
| Smoke test dev | ✅ | Verificato da Claude Code. |
| Smoke test produzione | ✅ | Go-live avvenuto. Hotfix risolti. |

### Apprendimenti riusabili (riportati in AGENTS.md)

1. **R2 via `@aws-sdk/client-s3`** (non binding): pattern canonico su Vercel. Client in `src/lib/r2.ts`.
2. **portale-utils.ts**: helper comuni portale. Aggiungere qui future utility cross-componente.
3. **certBadgeVariant**: preferire campi formula Airtable per stati computati.
4. **fallbackRedirectUrl su Clerk SignIn/SignUp**: sempre `/portale` — verificare nello smoke test.
5. **Mobile drawer fuori da sticky header**: stacking context — montare fuori dall'`<header>`.
6. **suppressHydrationWarning su footer**: elementi con data/ora server/client.
7. **allowedDevOrigins per LAN**: per test iPhone in sviluppo.
8. **FCI mapping**: verificare sempre con anni limite, ha richiesto un fix separato.

---

## 9. Evolutive correlate

- EVO-001 — ombrello F3 portale
- EVO-002 — infra completata (dipendenza)
- EVO-004 — iscrizioni (dipende da questa EVO)
- EVO-005 — gare genitore (dipende da questa EVO)

---

## Log fasi

### [2026-05-22] Fasi 0-7 — Pianificazione + prompt generato

Analisi as-is completata. WBS definita (11 task macro). Verifica coerenza OK. Prompt Claude Code generato. Stato: pronta per implementazione.
