# EVO-029 — Ricognizione as-is dettagliata (componenti /la-scuola)

Report dall'agente Explore (2026-06-15). Server/Client + contenuto + classi DS per sezione.

| # | Componente | Tipo | Contenuto | Sfondo / DS | Dati |
|---|---|---|---|---|---|
| — | `ScuolaHero` (+`ScuolaHeroNino`) | Server (async) | **HERO — OUT OF SCOPE** (h1, stat, CTA, video duo) | pattern / VideoBackdrop "hero" | Airtable slot `scuola-hero` |
| 1 | `SezioneCorsi` | Client | h2 "Due formule, una scuola" + 2 card (MTB-BDC / Corso MTB) con orari, badge, CTA | card white, `.reveal` | hardcoded (mar 17–18:30 strada, gio MTB) |
| 2 | `SezioneFilosofia` | Client | h2 "Carta dei Diritti del Bambino nello Sport" + 7 paragrafi + box border-left sun | `.bg-bg-soft` `.pattern-light` | hardcoded (UNESCO 1992) |
| 3 | `SezioneKitScuola` | Client | h2 "Vesti i colori" + griglia 4 capi + manifesto navy | `.bg-white` + `.photo-bg-navy` manifesto | `KIT_SCUOLA` da `lib/kit-scuola.ts` + `cloudinaryOptimized` |
| 4 | `SezioneMaestri` | Server | h2 "5 maestri federali" + foto staff portrait | `.photo-house--portrait` | `/photos/maestri/staff.jpg` (Cloudinary) |
| 5 | `SezioneGalleria` | Client | h2 "La scuola attraverso le immagini" + masonry CSS grid | `.bg-bg-soft` `.pattern-light` `.photo-house` | 14 foto hardcoded → Cloudinary `sito/immagini/{id}.jpg` |
| 6 | `SezioneComeIscriversi` | Server | h2 "Iscrivere tuo figlio è semplice" + funnel 4 step + mockup illustrati + CtaBand | `.bg-bg-soft` + pattern.svg overlay | hardcoded STEPS; link `/portale/iscrizioni`, `/contatti?motivo=scuola` |
| 7 | `CtaScuola` | Server (async) | h2 "Inizia il percorso" + 3 CTA (iscrizioni/email/tel) | VideoBackdrop "cta" / `.photo-bg-navy` | telefono da Airtable `scuola-telefono` |

## Note layout chiave
- **Galleria**: desktop `grid-cols-3` masonry (landscape span 2, portrait span 1), tablet `grid-cols-2`, **mobile `grid-cols-1` full-width impilate** ← da cambiare in scroll orizzontale.
- **ComeIscriversi**: desktop = 4 col con connettore numerato gradiato (grass→sky→ember→navy); mobile = rail verticale. Step 01 "invito" (prova gratuita, link soft), step 02-04 mockup UI (`MockRegister`/`MockIscrizione`/`MockCheckout`).
- **Kit**: consuma `KIT_SCUOLA` (4 `CapoKit`: maglia, salopette, felpa, pantalone-felpa) con `cloudinaryOptimized(url, w)`.

## SEO as-is (dettaglio in EVO-029 §3)
- `CourseJsonLd`: Course + 2 `hasCourseInstance` (strada martedì / MTB giovedì), audience bambini 5+, courseCode `TRIONO-SCUOLA-2026`.
- sitemap `/la-scuola` priority 1.0 monthly. robots ok. heading 1 h1 + 6 h2 + h3 step.
