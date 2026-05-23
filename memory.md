# Memory — Triono Racing Next.js

> Indice cronologico di tutte le evolutive del progetto. Ogni evolutiva ha un file di dettaglio in `evolutive/EVO-XXX-{slug}.md`.

## Evolutive

| ID | Slug | Titolo | Data inizio | Data fine | Stato | URL produzione | File |
|----|------|--------|-------------|-----------|-------|----------------|------|
| EVO-001 | portale-f3 | Portale F3 — Portale genitori/maestro/admin (ombrello) | 2026-05-21 | — | ombrello | — | [link](evolutive/EVO-001-portale-f3.md) |
| EVO-002 | portale-infra | F3.1 — Setup infra portale (Clerk ruolo-aware + NavBar + webhook) | 2026-05-21 | 2026-05-21 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-002-portale-infra.md) |
| EVO-003 | portale-genitore-core | F3.2 — Area genitore core (dashboard + figli + cert + foto) | 2026-05-22 | 2026-05-22 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-003-portale-genitore-core.md) |
| EVO-004 | portale-iscrizioni | F3.3 — Iscrizioni e pagamenti (wizard + modulistica + SumUp) | 2026-05-22 | — | pronta per implementazione | — | [link](evolutive/EVO-004-portale-iscrizioni.md) |
| EVO-005 | portale-gare-genitore | F3.4 — Calendario gare genitore | — | — | in pianificazione | — | [link](evolutive/EVO-005-portale-gare-genitore.md) |
| EVO-006 | portale-maestro | F3.5 — Area maestro (lezioni + gare assegnate) | — | — | in pianificazione | — | [link](evolutive/EVO-006-portale-maestro.md) |
| EVO-007 | portale-admin | F3.6 — Area admin (dashboard + 11 sotto-pagine) | — | — | in pianificazione | — | [link](evolutive/EVO-007-portale-admin.md) |
| EVO-008 | migrazione-clerk | F3.7 — Migrazione utenti Supabase → Clerk | — | — | in pianificazione | — | [link](evolutive/EVO-008-migrazione-clerk.md) |
| EVO-009 | kit-scuola | Kit Scuola — vetrina pubblica /la-scuola + immagini nel size picker portale (ombrello) | 2026-05-23 | — | ombrello | — | [link](evolutive/EVO-009-kit-scuola.md) |
| EVO-010 | kit-scuola-vetrina-pubblica | Kit Scuola — sezione editoriale su /la-scuola + asset condiviso | 2026-05-23 | 2026-05-23 | completata | https://trionoracing-next.vercel.app/la-scuola | [link](evolutive/EVO-010-kit-scuola-vetrina-pubblica.md) |
| EVO-011 | kit-scuola-tab-taglie | Kit Scuola — immagini nel TabTaglie del portale (sbloccata da EVO-010 ✅, in pausa per EVO-012) | 2026-05-23 | — | in pianificazione | — | [link](evolutive/EVO-011-kit-scuola-tab-taglie.md) |
| EVO-012 | ds-photo-bg-colorate | DS — utility `.photo-bg-{color}` per card colorate + uniformazione 8 card navy | 2026-05-23 | — | pronta per implementazione | — | [link](evolutive/EVO-012-ds-photo-bg-colorate.md) |

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
