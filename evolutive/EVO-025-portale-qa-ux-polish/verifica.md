# EVO-025 — Verifica implementazione

> `verify-implementation` non caricata in sessione → report manuale equivalente per dimensione (pattern noto, EVO-010/024). Data: 2026-06-07. PR: #60 (`f15edad`). Deploy prod: ✅.

## Sintesi

| Dimensione | Esito | Note |
|------------|-------|------|
| Design system | ✅ | Riuso `Button`/`Card`/`Badge`/`DataTable`/`useClerk`. 3 primitive nuove coerenti: `BackLink`, `GaraPicker`, `GaraTabs` + convenzione CTA→Button. Nessun nuovo token. |
| Architettura | ✅ | Route group `(portal)`, Server Actions con `requireAdmin`, separazione client/server, `safe()` data-fetch. Action lezione admin separata da quella maestro. Toggle ★ e assegnazione maestri modellati su `updateGaraAction`. |
| i18n | n/a | Nessuna libreria, IT hardcoded. Nuove stringhe IT coerenti. |
| SEO | n/a | Portale `noindex`. Rimozione `/admin/migrazione` senza link interni rotti (NavBar + revalidate bonificati). |
| Lint | ✅ | 0 errori (8 warning pre-esistenti su `<img>`/eslint-disable). |
| Typecheck | ✅ | `tsc --noEmit` pulito. |
| Build | ✅ | `/portale/admin/lezioni/nuova` presente, `/portale/admin/migrazione` assente. |
| Fedeltà visual | ✅ | Stepper mobile, de-nesting, dashboard, ★ inline come da mockup. Scostamenti motivati dalle iterazioni utente (vedi sotto). |
| Smoke dev | ✅ | OK utente (mobile 375px genitori + flussi admin). |
| Smoke prod | ✅ | `/`=200, `/portale/login`=200, `/portale/admin/migrazione`=404. |

## Criteri di accettazione

- [x] Stepper iscrizione a 375px compatto (no label sovrapposte); `≥sm` invariato.
- [x] Wizard mobile senza card annidate strozzate.
- [x] BackLink in cima alle sotto-pagine portale (esteso a tutte le pagine di primo livello area genitori su richiesta utente).
- [x] "Prossime scadenze" sopra "I miei figli" quando presenti; assenti → figli in cima.
- [x] CTA di riga dashboard = `Button` (touch ≥36px).
- [x] Card "Sicurezza" con Button che apre il profilo Clerk.
- [x] Admin può caricare presenza (lezione **e** gara) → genera presenze maestro col rimborso corretto; "Registra gara" rimosso dalla pagina lezioni.
- [x] ★ cliccabile in `/portale/admin/gare` (ottimistico + rollback) senza aprire la riga.
- [x] `/portale/admin/migrazione` 404 + voce NavBar rimossa; nessun link rotto.
- [x] Nessuna modifica allo schema Airtable.
- [x] `lint`, `typecheck`, `build` verdi.

## Iterazioni recepite durante lo smoke (oltre allo scope iniziale)

1. **BackLink "Torna alla dashboard"** su tutte le pagine di primo livello area genitori.
2. **CTA admin uniformate** (`size="sm"`); rimosso "Registra gara" dalla pagina lezioni.
3. **Bug presenze** — gara registrata dal form lezione finiva in `PRESENZE_MAESTRI` come `tipo: lezione` (rimborso lezione). Fix: flusso unificato **"Carica presenza"** (switch Lezione/Gara) per maestro + admin; modalità gara seleziona gara esistente → `tipo: gara` (rimborso gara) via `generatePresenzeForGara` idempotente. Auto-generazione da accompagnatori mantenuta.
4. **GaraPicker** ricercabile (search + filtro Passate/Prossime) al posto della select piatta.
5. **Assegnazione maestri inline** sulla scheda gara (tolta dal form di modifica) + **tab Gara / Iscrizioni (N)**.
6. **Fix maestro non riconosciuto** — `getMaestroByGenitoreId` usa il link `UTENTE` come fonte di verità (non l'email, che può differire tra record genitore e maestro).

## Debito / follow-up

- **Bonifica dati storica** (non in scope): record `PRESENZE_MAESTRI` con `TIPO=lezione` la cui lezione collegata ha `TIPO_SESSIONE` "Gara …" sono storicamente errati. Il codice è corretto da ora; la pulizia dei record pregressi è un intervento dati separato (proposto, in attesa).
- **Collegamento maestro↔utente con email diverse**: la lazy-sync collega *per email*; un nuovo istruttore con email-maestro diversa non si auto-collega al primo accesso (richiede `UTENTE` già popolato o link manuale). Possibile azione admin futura "collega maestro↔utente".
- `actionCreateLezione` (maestro) resta esportata ma non più referenziata (sostituita da `actionCaricaPresenza`); rimovibile in cleanup futuro.
