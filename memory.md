# Memory — Triono Racing Next.js

> Indice cronologico di tutte le evolutive del progetto. Ogni evolutiva ha un file di dettaglio in `evolutive/EVO-XXX-{slug}.md`.

## Evolutive

| ID | Slug | Titolo | Data inizio | Data fine | Stato | URL produzione | File |
|----|------|--------|-------------|-----------|-------|----------------|------|
| EVO-001 | portale-f3 | Portale F3 — Portale genitori/maestro/admin (ombrello) | 2026-05-21 | — | ombrello | — | [link](evolutive/EVO-001-portale-f3.md) |
| EVO-002 | portale-infra | F3.1 — Setup infra portale (Clerk ruolo-aware + NavBar + webhook) | 2026-05-21 | 2026-05-21 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-002-portale-infra.md) |
| EVO-003 | portale-genitore-core | F3.2 — Area genitore core (dashboard + figli + cert + foto) | 2026-05-22 | 2026-05-22 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-003-portale-genitore-core.md) |
| EVO-004 | portale-iscrizioni | F3.3 — Iscrizioni e pagamenti (wizard + modulistica + SumUp) | 2026-05-22 | 2026-05-22 | completata | https://trionoracing-next.vercel.app/portale/iscrizioni | [link](evolutive/EVO-004-portale-iscrizioni.md) |
| EVO-005 | portale-gare-genitore | F3.4 — Calendario gare genitore | — | — | in pianificazione | — | [link](evolutive/EVO-005-portale-gare-genitore.md) |
| EVO-006 | portale-maestro | F3.5 — Area maestro (lezioni + gare assegnate) | — | — | in pianificazione | — | [link](evolutive/EVO-006-portale-maestro.md) |
| EVO-007 | portale-admin | F3.6 — Area admin (dashboard + 11 sotto-pagine) | — | — | in pianificazione | — | [link](evolutive/EVO-007-portale-admin.md) |
| EVO-008 | migrazione-clerk | F3.7 — Migrazione utenti Supabase → Clerk | — | — | in pianificazione | — | [link](evolutive/EVO-008-migrazione-clerk.md) |
| EVO-009 | kit-scuola | Kit Scuola — vetrina pubblica /la-scuola + immagini nel size picker portale (ombrello) | 2026-05-23 | — | ombrello | — | [link](evolutive/EVO-009-kit-scuola.md) |
| EVO-010 | kit-scuola-vetrina-pubblica | Kit Scuola — sezione editoriale su /la-scuola + asset condiviso | 2026-05-23 | 2026-05-23 | completata | https://trionoracing-next.vercel.app/la-scuola | [link](evolutive/EVO-010-kit-scuola-vetrina-pubblica.md) |
| EVO-011 | kit-scuola-tab-taglie | Kit Scuola — immagini nel TabTaglie del portale (sbloccata da EVO-010 ✅, in pausa per EVO-012) | 2026-05-23 | — | in pianificazione | — | [link](evolutive/EVO-011-kit-scuola-tab-taglie.md) |
| EVO-012 | ds-photo-bg-colorate | DS — utility `.photo-bg-{color}` per card colorate + uniformazione 8 card navy | 2026-05-23 | — | pronta per implementazione | — | [link](evolutive/EVO-012-ds-photo-bg-colorate.md) |
| EVO-013 | portale-pagina-pagamenti | Pagina trasversale `/portale/pagamenti` (nata dal QA EVO-004 hotfix #17) | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale/pagamenti | [link](evolutive/EVO-013-portale-pagina-pagamenti.md) |
| EVO-014 | portale-ux-stato-iscrizioni | Portale UX: stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-014-portale-ux-stato-iscrizioni.md) |
| EVO-015 | titoli-descrizione | Titoli pagamento: campo DESCRIZIONE come label primaria + fix "undefinedª rata" | — | — | in pianificazione | — | [link](evolutive/EVO-015-titoli-descrizione.md) |

## Stati possibili

- **in pianificazione** — fasi 1-6 in corso
- **pronta per implementazione** — fase 7 completata, prompt Claude Code generato
- **in implementazione** — Claude Code sta lavorando
- **in PR** — PR aperta, in attesa di OK utente per il merge
- **deployata** — merge fatto, deploy completato, in attesa di consolidamento
- **completata** — fase 8 chiusa, CLAUDE.md aggiornato
- **bloccata** — ferma per dipendenze
- **annullata** — non procede
- **ombrello** — evolutiva contenitore con sotto-evolutive collegate

## Cronologia narrativa

**2026-05-21 — Kick-off Fase 3 portale**
Fase 1 (8 pagine statiche) completata. Censimento as-is, UX completa (32 mockup), schema funzionalità per ruolo prodotti in sessioni Cowork precedenti. L'ombrello EVO-001 contiene 7 sotto-evolutive rilasciabili separatamente (EVO-002→EVO-008). Si parte da EVO-002 (infra). Deploy: Vercel collegato a GitHub, auto-deploy su merge su `main`.

**2026-05-22 — EVO-003 completata**
Area genitore core live. Dashboard personalizzata, gestione figli (CRUD + 6 tab con profilo), upload certificato medico e foto su R2, profilo genitore. Nuovi moduli: `src/lib/r2.ts` (client S3/R2), `src/lib/portale-utils.ts` (helper comuni). 5 hotfix post-implementazione principali (FCI mapping, fallbackRedirectUrl Clerk, drawer mobile, suppressHydration footer). Prossima: EVO-004 (iscrizioni + SumUp).

**2026-05-23 — EVO-010 completata (in parallelo a F3, parte di ombrello EVO-009)**
Nuova sezione "Kit Scuola" live su `/la-scuola` tra Filosofia e Maestri. Layout editoriale asimmetrico con 4 capi del kit (maglia, salopette, felpa, pantalone in felpa) + card navy manifesto. Nuovo asset condiviso `src/lib/kit-scuola.ts` (tipo `CapoKit` + array `as const readonly` + helper `cloudinaryOptimized` per trasformazioni URL). Nuovo hostname `res.cloudinary.com/duezeronove/**` in `next.config.ts`. PR #14 squash-merged (commit `72119e1`). Verifica APPROVATA su tutte le 7 dimensioni. 8 nuovi pattern in AGENTS.md (sezione "EVO-010"), tra cui: asset condiviso cross-deliverable, `next/image fill object-contain` per prodotti scontornati, scope ristretto su `images.remotePatterns`, gestione easter egg Claude Design, fallback report verifica quando skill `verify-implementation` non è caricata in sessione. **Sblocca EVO-011** (immagini in `TabTaglie` portale, parte di EVO-009 ombrello). Stato EVO-009 ombrello resta `ombrello` finché EVO-011 non sarà chiusa.

**2026-05-24 — Kick-off EVO-014**
Dashboard genitore portale refactoring: tile colorata stato iscrizione per ogni figlio (grass/ember/sky), Azioni Rapide condizionali, banner reassurance. + 5 bug fix: sync PRIMA_RATA_PAGATA su pagamento, TIPO_TITOLO prima_rata, label "Pagamenti", wizard scegli figlio disabilita già iscritti, CTA lista iscrizioni aggiornata.

**2026-05-24 (sera) — EVO-014 completata + spawn EVO-015**
Dashboard genitore portale completata: tile colorata 3 stati su ogni card figlio (verde grass "Iscritto", ambra ember "Da completare", sky+sun pill "Non iscritto"), banner reassurance verde "Tutti i tuoi figli sono iscritti", Azioni Rapide condizionali (3 voci: Nuova iscrizione condizionale + Iscrizioni + Pagamenti — rimossa "Calendario gare" link rotto), sezione "Prossime scadenze" rifatta aggregando certificati medici + rate non pagate in lista unica con CTA contestuali (rimosso il blocco "Alert urgenti" duplicato). +5 bug fix: sync `PRIMA_RATA_PAGATA` post-pagamento (verify + webhook routes), `TIPO_TITOLO` prima_rata in createIscrizione, label "Piano rate"→"Pagamenti" in sommario wizard, filtro UI wizard per figli già iscritti anno corrente, CTA contestuale lista iscrizioni. PR #20 squash-merged (commit `a73d11f`). Visual Claude Design (HTML standalone 4 artboard) ha guidato l'implementazione con scelte UX rilevanti (sky+sun per "non iscritto" anziché grigio neutro, banner reassurance positivo). Smoke test post-deploy ha rilevato bug "undefinedª rata" su titoli senza NUMERO_RATA → **spawn EVO-015** "Titoli pagamento: campo DESCRIZIONE" con refactor architetturale (Make.com NON popolerà NUMERO_RATA per limite tecnico, soluzione è ridisegnare la label primaria dei titoli usando un campo DESCRIZIONE dedicato). Azioni manuali post-merge in carico all'utente: backfill `PRIMA_RATA_PAGATA` storici + migrazione `TIPO_TITOLO` storici + modifica scenari Make.com 4086727 + 5141784.

**2026-05-24 — Hotfix EVO-004 #17 + spawn EVO-013**
Individuata regressione di EVO-004: il payload `POST /v0.1/checkouts` SumUp non passava `return_url`, disabilitando la notification per-checkout verso Make.com e quindi il fallback "browser chiuso prima del verify". Fix in PR #17 (`fix/sumup-return-url-makecom`, commit `6c0365c`) che reintroduce `return_url` via env `MAKE_SUMUP_RETURN_URL` con spread condizionale e warning non bloccante se assente. Durante il QA della #17 si è notato che il bottone "Vedi pagamenti" sulla dashboard genitore portava a `/portale/iscrizioni` con label fuorviante (non a una vera vetrina pagamenti) — spawnata EVO-013 in parallelo come PR #18 (`feat/portale-pagina-pagamenti`, commit `fa69f67`) con nuova pagina trasversale `/portale/pagamenti`. Merge in ordine #17 → #18, env Vercel `MAKE_SUMUP_RETURN_URL` configurata in production e preview, EVO-004 chiusa (D-17 risolta), EVO-013 chiusa contestualmente.
