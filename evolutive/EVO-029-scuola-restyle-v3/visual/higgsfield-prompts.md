# EVO-029 — Prompt Higgsfield "Allenarsi a casa" (4 scene)

Modello: **nano_banana_2** (i2i, role `image`), aspect **16:9**, resolution **2k**, count 2.
Reference: Nino master `c8d55a31-b5ce-4d26-b67f-1bb8d51df185` + close-up `afac40fc-6e2c-4e1c-80ed-6edf41641601`; Vittoria master `2eb317f4-fb9f-4a23-bff9-3bb14aa6dbe5`.
Pipeline: sfondo bianco → cutout Adobe → ottimizzazione → `public/`. Naming **Nino** (non "Nico").
Workspace Higgsfield: `236dc771-a66a-4372-a05e-161eb62896ad` (private, Plus).

| Scena | Personaggi | Ref | Job ID (v1, v2) | Stato |
|---|---|---|---|---|
| 1 — Vittoria slalom tra birilli | Vittoria | `2eb317f4` | `adff0a53-d97d-46de-9046-ee525f79ec00`, `f7fc7522-9acd-4273-b0b8-9dd5ee686d9d` | submitted |
| 2 — Nino balance bike (spinta piedi) | Nino | `c8d55a31`+`afac40fc` | `f8e5bf21-3062-4858-bd23-f8f7bb708c27`, `054157a3-2acb-468d-887c-a5fe65b48ce6` | submitted |
| 3 — Nino+Vittoria, bici con rotelle sollevate | Nino+Vittoria | `c8d55a31`+`2eb317f4` | `e6389dc4-aef6-4526-b327-55fe80e9451e`, `3034f69a-694a-4f00-9cbe-eae0f99252e4` | submitted |
| 4 — Nino MTB indica leva cambio in salita | Nino | `c8d55a31`+`afac40fc` | `ea0ab964-ae6f-475e-840c-599531b4ea1f`, `228a1305-0b31-4f74-a27b-3ccaf69bc3f9` | submitted |

> Nota: l'endpoint etichetta il modello `nano_banana_flash` internamente ma accetta `nano_banana_2` (mapping server). Verificare la resa; in caso di drift personaggio o props errati (birilli/rotelle/cambio non chiari) iterare cambiando **una** variabile per volta (regola higgsfield-prompt).

I prompt completi sono nel log della sessione e nei params dei job.

## Esito review (2026-06-15) — ✅ tutte e 4 buone al primo passaggio
Anteprime scaricate in `visual/higgsfield/` (`s1a…s4a`). Consistenza personaggio eccellente (NB2 + reference).
- **S1 Vittoria slalom** (`adff0a53`): ✅ coda+bandana gialla, kit, birilli arancioni, sfondo bianco. Scelta.
- **S2 Nino balance bike** (`f8e5bf21`): ✅ balance bike **senza pedali** corretta, spinta piedi, sfondo bianco. Scelta.
- **S3 Duo + rotelle** (`e6389dc4`): ✅ entrambi coerenti, rotelle visibili, Nino indica. Scelta.
- **S4 Nino MTB cambio** (`ea0ab964`): ✅ casco, trasmissione visibile, indica i rapporti — ha però **erba** sul fondo (le altre bianco) → in cutout rimuovere il prato per uniformare.
- Pose **Corso** (Nino bici da strada / Vittoria MTB) **già generate** dall'utente in sessioni precedenti (job `9838a628`, `04251fb0`/`736ee511`) → riusare, no nuova generazione.

**Prossimo step asset** (in implementazione, Macro 1.3): cutout Adobe (no flood-fill) di tutte e 4 → trasparente; rimuovere erba S4; ottimizzare; collocare su banner card 16:9 con tinta brand. Loghi sbavati accettati; eventuale rimozione tagline ENERVIT come da `NINO.md` §4.

## Iterazione 2 (2026-06-15) — feedback utente
**Regola casco** (vedi memoria `feedback-mascotte-casco-in-bici`, da riportare in `NINO.md` §10): mascotte **in sella → casco obbligatorio**; in piedi accanto alla bici → opzionale.
- **S4 Nino MTB cambio — RIFATTA** (la prima era su erba + posa poco chiara; la 2ª variante era `failed`). Nuove varianti su **bianco** con casco: `075ab670` (✅ **scelta** — trasmissione leggibile, indica il cambio) e `e00d538b` (ok, mani entrambe sulla bici, gesto meno chiaro). Scartata la `ea0ab964` (erba) e `a27bbd76` (rigenerazione UI col vecchio prompt erboso).
- **S1 Vittoria slalom — RIGENERA col casco** (stava pedalando senza): job `9c079a90`, `f820346d` (casco navy + coda fuori dal casco, no bandana). In attesa.
- **S2 Nino balance bike — RIGENERA col casco** (stava pedalando senza): job `b1df2e62`, `850db197`. In attesa.
- **S3 duo + rotelle**: invariata (in piedi accanto alla bici, non in sella → casco non richiesto).
- Pose **Corso** (Nino strada / Vittoria MTB) e **Kit stand**: invariate (in piedi che reggono la bici, non in sella; tengono anzi il casco in mano). ⚠️ da verificare se mostrano raggi a filo → eventuale rigenerazione con mag wheels (regola brand).

## Stato finale set "Allenarsi a casa" (2026-06-15)
- **Scena 1 — Vittoria slalom**: ✅ `725accea` (casco + mag wheels + birilli, bianco). In `public/scuola/allenarsi/slalom.webp`.
- **Scena 2 — Nino balance bike**: ⏳ da rigenerare con **mag wheels** (la versione attuale `b1df2e62`/`850db197` ha casco ma raggi a filo). `public/.../balance.webp` ancora la vecchia (raggi a filo) → da sostituire.
- **Scena 3 — duo + rotelle**: ⏳ da rigenerare con **mag wheels** (`e6389dc4` ha raggi a filo). `public/.../rotelle.webp` ancora la vecchia → da sostituire.
- **Scena 4 — Nino MTB cambio**: ✅ `5e40f175` (casco + mag wheels + proporzione corretta, indica il cambio, bianco). In `public/scuola/allenarsi/cambio.webp`.
- **Nota**: scelta tecnica cerchi = **descrizione testuale** "five-spoke mag wheels…" (resa fedele, vedi `5e40f175`/`725accea`), senza reference image. Le retry su "connection lost" dell'MCP hanno generato doppioni della scena 4 (5e40f175 scelta).
- **Bloccante temporaneo**: MCP Higgsfield in outage → scene 2 e 3 da completare quando torna. Sostituzione = solo swap di 2 file in `public/`, nessuna modifica al codice.

## Iterazione 3 (2026-06-15) — completamento + nuovi asset (smoke utente)
- **Scena 2 (balance)** ✅ rifatta con casco + **mag wheels** → `4467ca47` → `public/scuola/allenarsi/balance.webp`.
- **Scena 3 (duo rotelle)** ✅ rifatta con **mag wheels** → `c21b6727` → `public/scuola/allenarsi/rotelle.webp`. **Set "Allenarsi" completo** (4/4, tutte mag wheels + casco dove in sella).
- **Duo iscrizione** (banda CtaBand): **nuovo** `fc3ed09a` — Nino col **certificato medico** + Vittoria con **foto tessera**, figura intera. Cutout **Adobe** (`image_remove_background` via upload CC, CloudFront non whitelisted come da NINO.md §3) → `public/scuola/duo-iscrizione.webp` (trasparente).
- **Bolla "Nino dice"** (Sicurezza): da `nino-occhiali` → **`nino-casco`** (`public/nino/nino-casco.webp`, asset esistente processato) per coerenza col messaggio sul casco.
- **OG image** ✅ **nuova** `14c0ca67` — banner branded navy + confetti + Nino&Vittoria + testo "Scuola di Ciclismo / Triono / Terni · dai 4 anni" (NB2 ha reso il testo nitido). → `src/app/(public)/la-scuola/opengraph-image.jpg` (1200×630) + `.alt.txt`.
