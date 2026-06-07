# Visual bundle — EVO-025 Portale QA/UX polish

Bundle prodotto in Cowork (percorso b: mockup HTML + `design:design-system`), senza Claude Design — pattern consolidato EVO-017/018/019/020/024. I mockup derivano dai **componenti reali letti in Fase 3** (fedeltà verificata, vedi sotto).

## File

| File | Copre | Rilievi |
|------|-------|---------|
| `mockup-genitori-mobile.html` | Stepper mobile (before/after), de-nesting card mobile, dashboard riordinata + CTA→Button, card "Sicurezza" + link Clerk | #1, #2, #3, #4, #5 |
| `mockup-admin.html` | Form "Registra lezione" admin (con selezione maestro), gara ★ in evidenza inline (before/after), rimozione voce "Migrazione" | #6, #7, #8 |
| `DS-NOTES-evo-025.md` | Spec DS: primitive `BackLink`/`PageHeader`, convenzione CTA→Button, variante stepper mobile, padding card responsive, action toggle inline | tutti |

## Fedeltà ai componenti reali (letti in Fase 3)

I mockup replicano la struttura/classi reali di: `StepperWizard.tsx`, `DashboardGenitore.tsx`, `ProfiloGenitoreForm.tsx`, `ui/button.tsx`, `ui/card.tsx`, `FormLezione.tsx`, `GareDataTable.tsx`. Palette e radius dai token DS Triono v0.1 (PROGETTO_MASTER §10.2).

## Cosa NON è in scope nei mockup (ignorare)

- I mockup mostrano lo **stato target** dei soli elementi toccati; il resto della pagina resta invariato rispetto alla produzione.
- Niente nuovi token/colori: si riusano quelli esistenti.
- Le label/microcopy sono indicative; la fonte è il codice reale (IT hardcoded).
- Lo stepper "before" riproduce il bug reale (label sovrapposte su mobile) solo a scopo illustrativo.

## Esito design-critique

Vedi sezione dedicata in `../EVO-025-portale-qa-ux-polish.md` §6 dopo il passaggio `design:design-critique`.
