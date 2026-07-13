# EVO-041 — Rifiniture /la-scuola post-restyle APEX

- **ID**: EVO-041 · **Slug**: scuola-fix
- **Data inizio/fine**: 2026-07-13 · **Stato**: chiusa
- **Tipo**: fix/rifinitura UI · **Area**: landing (/la-scuola) · **Priorità**: alta (feedback diretto utente post go-live EVO-039)

## Contesto
Subito dopo il go-live di EVO-039 (restyle /la-scuola in APEX), l'utente ha segnalato problemi visivi concreti su 4 sezioni: hero, kit, allenarsi a casa, come iscriversi. Gestita come fix rapido (no fasi 1-6 complete del workflow), due round di iterazione con verifica screenshot ad ogni passo.

## Round 1 (commit 7017f49, 535a11d)
1. **Hero**: rimossa la card avorio + canvas "reveal" al cursore + duo video animati (Nino+Vittoria). Sostituiti con cutout STATICI a figura intera su stage scuro.
2. **Kit**: card da avorio (`.apex-card--warm`) a "bianca ad-hoc" + `mix-blend-multiply` per eliminare il bordo tra prodotto (fondo bianco) e card.
3. **Allenarsi**: stesso fix bordo (bianco + blend).
4. **CtaBand iscrizione**: pattern geometrico portato da opacity 0.32+mask a 0.80 pieno (frainteso: l'utente lo voleva RIMOSSO, non intensificato).

## Round 2 (commit d46d0b5) — feedback dopo review screenshot
L'utente ha ricontrollato e segnalato 5 problemi residui/nuovi:
1. **Hero**: gli scontorni di Nino+Vittoria (ricavati dai poster video `*-figura-poster.png`) erano sporchi ai bordi → **sostituiti con SOLO Vittoria**, asset Adobe pulito dalla libreria Cowork (`social/assets/vittoria/vittoria-hero.png`, scontorno netto). Nino rimosso dalla hero.
2. **Card bianche vs avorio**: l'utente notava colori diversi tra card che dovevano essere identiche. Causa reale doppia: (a) `.apex-card--warm` era avorio `#f7f4ec`, non bianco puro → uniformato a `#ffffff` in `apex.css`; (b) l'animazione `.reveal` fa fade-in su `opacity`, e una card bianca a opacity <1 su sfondo navy **appare grigia** durante lo scroll — bug percettivo, non di colore. Fix: nuova classe `.reveal-slide` (solo `translateY`, niente `opacity`) in `globals.css`, applicata a tutti i wrapper di card chiare (kit ×4, corsi bolle ×2, allenarsi ×4, sicurezza foto, step iscrizione ×4).
3. **Pill "Salopette tecnica" mozzato**: la card kit aveva `overflow-hidden` che clippava il pill numero+nome (sporge `-bottom-3` fuori dal bordo card) → rimosso `overflow-hidden` dal wrapper.
4. **Allenarsi — bordo ancora presente**: il fix round 1 (`object-contain` + `mix-blend-multiply` + padding) lasciava comunque un riquadro bianco visibile dentro la card scura. Fix: `object-cover` senza padding — la scena riempie tutto il banner, nessun riquadro residuo.
5. **CtaBand**: l'utente intendeva l'opposto del round 1 — voleva i disegni geometrici **rimossi** (non fanno parte del design), non intensificati. Fix: tolto `pattern.svg`, lasciato solo un floodlight accento discreto su superficie navy pulita.

## File toccati (entrambi i round)
- `src/components/scuola/ScuolaHero.tsx` (riscritta), `ScuolaHeroNino.tsx` (**rimossa**, canvas morto)
- `src/components/scuola/SezioneKitScuola.tsx`, `SezioneAllenarsiACasa.tsx`, `SezioneSicurezza.tsx`, `SezioneCorsi.tsx`, `SezioneComeIscriversi.tsx`
- `src/app/apex.css` (`.apex-card--warm` → bianco), `src/app/globals.css` (nuova `.reveal-slide`)
- `public/vittoria/vittoria-hero.webp` (nuovo, 81KB) · `public/nino/nino-hero.webp` (creato poi rimosso — sporco)

## Verifica e go-live
- **PR**: [#104](https://github.com/lucamorettig-coder/trionoracing-next/pull/104) squash `602f82c`
- **Produzione**: https://trionoracing.it/la-scuola — verificato live (`vittoria-hero` presente nell'HTML)
- **Gate**: tsc ✅ · lint 0 err ✅ · build ✅. Verifica visiva via `scripts/dev-shot.mjs` ad ogni step (hero, kit, allenarsi, ctaband).
- Nessun report `verify-implementation` formale (fix rapido iterativo, non workflow completo).

## Apprendimenti riusabili
- **`.reveal` (fade opacity) su superfici CHIARE dentro un palco scuro crea un bug percettivo**: durante l'animazione di scroll-reveal, il bianco a opacity <1 legge come grigio → card identiche sembrano di colori diversi. Pattern: usare `.reveal-slide` (solo transform, niente opacity) per qualunque card/superficie chiara su stage APEX scuro; riservare `.reveal` (fade) alle superfici scure/testo dove il fade non altera la percezione del colore.
- **`mix-blend-multiply` non basta a eliminare un bordo se resta `object-contain` + padding**: il blend fonde i COLORI ma se l'immagine non riempie il contenitore resta comunque un'area (trasparente/vuota) percepibile come riquadro. Per "nessun bordo" servono ENTRAMBI: superficie dello stesso colore del fondo immagine E `object-cover` (o padding zero) per eliminare l'area vuota.
- **`overflow-hidden` su una card con elementi che sbordano intenzionalmente (badge/pill a `-bottom-N`) li clippa**: verificare sempre cosa sporge dal bounding box prima di aggiungere overflow-hidden per "pulizia".
- **Cutout ricavati da poster/frame video hanno spesso scontorno più sporco degli asset Adobe dedicati**: per hero/immagini hero-size, preferire sempre gli asset da `social/assets/{personaggio}/` (pipeline Adobe `image_remove_background`) invece di derivare da poster di video alpha.
- **Attenzione a non invertire il verso di una richiesta**: nel round 1 "il pattern geometrico non c'è" è stato interpretato come "il pattern è troppo debole" (intensificato) invece di "va rimosso" — quando il feedback è ambiguo su una direzione (più/meno di qualcosa), è più sicuro chiedere prima di agire nella direzione sbagliata due volte.
