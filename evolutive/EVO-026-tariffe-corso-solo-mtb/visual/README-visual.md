# EVO-026 — Bundle visual (Cowork, senza Claude Design)

Pattern validato in EVO-017/018/019/020: mockup HTML standalone prodotti in Cowork con i token reali del DS Triono (`src/app/globals.css`) + spec DS markdown.

## File del bundle

| File | Cosa mostra |
|---|---|
| `DS-EXTEND-evo-026.md` | Spec DS dei pattern nuovi: `CorsoRadioCard`, badge corso, raggruppamento TariffaCard per corso, copy vetrina |
| `mockup-step-scegli-corso.html` | Wizard, nuovo Step 3 "Corso": 2 card radio (stati default/selezionato/hover) — desktop + mobile |
| `mockup-admin-tariffe.html` | `/portale/admin/tariffe` con 2 sezioni corso × 3 TariffaCard, badge corso nell'header card, nota scadenze dinamiche |
| `mockup-sezione-corsi-pubblica.html` | `/la-scuola` SezioneCorsi riformulata: 2 formule di iscrizione, niente prezzi |

## Cosa NON guardare nei mockup

- Il chrome esterno (NavBar/Footer) è **omesso**: i mockup mostrano solo le sezioni toccate. Il layout reale è quello di `src/app/portale/(portal)/layout.tsx` e `src/app/(public)/layout.tsx`.
- Le card admin replicano `TariffaCard.tsx` reale (EVO-018) con due modifiche: chip corso nell'eyebrow e riga "Scadenze rate" sostituita dalla nota dinamica. Tutto il resto (gradient header, pattern overlay 0.15, footer card) è invariato — non re-implementare da zero.
- I prezzi nei mockup wizard sono quelli del quarter corrente di esempio (Q2): in implementazione arrivano da `getTariffeVigenti`.
- Lo stepper nel mockup wizard è solo accennato (7 pip): usare lo `StepperWizard` reale (versione mobile compatta EVO-025).

## Decisioni visual (da Fase 4/6)

- Scelta corso = **step dedicato** (step 3 di 7), prima dello step Tariffa.
- Palette corso: **MTB-BDC → sky** (coerente col badge "Martedì" info della vetrina), **SOLO-MTB → sun** (accento Scuola, coerente con CardIcon MTB e badge "Giovedì" warning).
- Vetrina: **niente prezzi**, solo formule + giorni.
