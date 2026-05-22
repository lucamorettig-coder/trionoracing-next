# EVO-001 — Portale F3: Portale genitori/maestro/admin

- **ID**: EVO-001
- **Slug**: portale-f3
- **Data inizio**: 2026-05-21
- **Data fine**: _da compilare a chiusura_
- **Stato**: ombrello
- **Tipo**: nuova feature (area autenticata completa)
- **Area**: cross-cutting (portale autenticato multi-ruolo)
- **Priorità**: alta

---

## 1. Requisiti

### Descrizione

Implementazione completa del portale privato di Triono Racing su Next.js 16 + Clerk + Airtable + SumUp Card Widget. Sostituisce il portale legacy in Astro/Cloudflare Workers/Supabase. Il portale serve 3 ruoli: Genitore, Maestro (Istruttore), Admin — tutti sotto `/portale/*` con NavBar e dashboard ruolo-aware.

Documentazione completa raccolta in sessioni Cowork precedenti:
- `CENSIMENTO_AREA_RISERVATA.md` — as-is funzionale (portale legacy)
- `SCHEMA_FUNZIONALITA.md` — funzionalità per ruolo, route, impatti modello dati
- `UX_DETTAGLIO_GENITORE.md` — 12 schermate genitore
- `UX_DETTAGLIO_MAESTRO.md` — 5 schermate maestro
- `UX_DETTAGLIO_ADMIN.md` — 11 schermate admin
- `mokup portale/Mockup Portale/` — 32 mockup HTML validati

### Obiettivo principale

Abilitare genitori, maestri e admin a gestire iscrizioni, pagamenti, lezioni e gare senza accedere ad Airtable direttamente.

### Target utente

Utenti loggati (tre ruoli: GENITORE, ISTRUTTORE, ADMIN).

### Dipendenze esterne

- Clerk (auth) — già integrato in F0
- Airtable (database) — `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN` in `.env`
- SumUp Card Widget SDK — `gateway.sumup.com/gateway/ecom/card/v2/sdk.js`
- Cloudflare R2 (storage certificati e foto) — binding `R2`

---

## 2. Ambito

### In scope

- Auth Clerk ruolo-aware: middleware protegge `/portale/*`, proxy legge `RUOLO` da metadata Airtable
- Layout portale + NavBar che mostra link differenti per ruolo
- Webhook `user.created` Clerk → crea record `TABELLA_GENITORI` in Airtable
- Area genitore: dashboard, figli (CRUD + foto + certificato), iscrizioni (wizard + modulistica + taglie), checkout SumUp, gare, profilo
- Area maestro: dashboard, lezioni CRUD (nuovi campi argomento + note), gare assegnate
- Area admin: dashboard KPI, iscrizioni, bambini, pagamenti (segna pagato + export CSV), gare (CRUD + approvazione), lezioni (storico globale), presenze maestri, genitori (cambio ruolo), tariffe (CRUD)
- Impatti modello dati: +3 campi `TABELLA_LEZIONI`, +1 campo `TABELLA_MAESTRI`, nuova entità `INVITI_GENITORE`, stato "annullata" su iscrizioni
- CATEGORIA_FCI calcolata lato server dall'anno di nascita (read-only nel form)

### Out of scope

- Notifiche email automatiche (gestite da Make.com — out-of-band)
- Audit log admin (post-launch)
- Spotlight ⌘K (post-launch)
- Report statistici periodici automatici (post-launch)
- Migrazione utenti Supabase → Clerk (EVO-008 separata)
- Switch a Stripe/altro PSP (documentato ma sospeso)
- Area amatori (Fase 6 — futura)

---

## 3. Analisi as-is

### Stack tecnologico

- Next.js 16.2.6 (App Router, RSC)
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4 (tokens custom in `globals.css`)
- Clerk 7.x (`@clerk/nextjs`)
- shadcn/ui (Radix UI `@radix-ui/react-slot`, CVA, clsx, tailwind-merge)
- Zod 4.x (validation)
- Lucide React (icone)

### Design system as-is

Token in `src/app/globals.css` → colori navy/sky/grass/ember/flag/sun, radius, shadows, font Inter.
Componenti UI in `src/components/ui/`: `button`, `badge`, `card`, `form`, `hero`, `navbar`, `footer`, `section-header`, `news-card`, `icons`.
Nota: shadcn-cli non configurato; i componenti sono scritti a mano con token DS. Non installare componenti shadcn-cli standalone.

### Localizzazione (i18n)

n/a — solo italiano. Nessun sistema i18n.

### SEO as-is

Metadata configurati via `src/lib/seo.ts` + `generateMetadata()` per pagina. Il portale (`/portale/*`) è protetto da auth → nessuna indicizzazione. Non servono title/OG/canonical specifici per le pagine portale.

### File rilevanti

```
src/app/portale/               ← area portale (da espandere)
  login/[[...sign-in]]/        ← Clerk SignIn (esistente)
  registrati/[[...sign-up]]/   ← Clerk SignUp (esistente)
  dashboard/page.tsx            ← placeholder F0.4 (da sostituire)
src/proxy.ts                   ← Clerk middleware (da espandere con ruoli)
src/lib/clerk-appearance.ts    ← tema Clerk (riusare)
src/components/ui/             ← componenti DS (riusare)
src/app/globals.css            ← token DS (riferimento)
```

---

## 4. Soluzione e WBS

Vedere `SCHEMA_FUNZIONALITA.md` in `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/` per la WBS completa. L'ombrello è suddiviso in 7 sotto-evolutive rilasciabili separatamente.

---

## 9. Evolutive correlate

- EVO-002 — F3.1: Setup infra (Clerk ruolo-aware + layout `/portale` + NavBar + webhook)
- EVO-003 — F3.2: Area genitore core (dashboard + figli + cert + foto)
- EVO-004 — F3.3: Iscrizioni e pagamenti (wizard + modulistica + taglie + SumUp)
- EVO-005 — F3.4: Calendario gare genitore
- EVO-006 — F3.5: Area maestro (lezioni nuovi campi + gare assegnate)
- EVO-007 — F3.6: Area admin (dashboard KPI + 8 sotto-pagine)
- EVO-008 — F3.7: Migrazione utenti Supabase → Clerk

---

## Log fasi

### [2026-05-21] Fase 0 — Bootstrap completata

Progetto identificato: `/Users/luca/Developer/trionoracing-next`. Stack analizzato. Requisiti e UX documentati in sessioni precedenti. Creati `memory.md` e questo file ombrello. Sub-evolutive EVO-002→EVO-008 create in `memory.md`. Prima sotto-evolutiva: EVO-002.
