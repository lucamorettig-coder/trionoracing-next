# Vittoria — mascotte femminile Triono Scuola Ciclismo (gemella di Nino)

Controparte femminile di Nino. Stessi costanti di brand (stile 3D Pixar/Disney, ~11 anni,
kit navy confetti + tutti i loghi, Enervit senza tagline). Carattere: **grintosa/ribelle ma
femminile, non bambolina** — coda alta spettinata con ciuffi ribelli, bandana sportiva in un
colore confetti (sun/giallo), occhi marroni grandi, lentiggini, espressione decisa/sbarazzina.

## Ragionamenti dietro le scelte
- **Nome**: scelto tra nomi ispirati a **campionesse del ciclismo**. *Vittoria* = campionessa **Vittoria
  Bussi** (record dell'ora) + significa **"vittoria"** + storico marchio (gomme **Vittoria**). Vincolo
  utente: **NON "Nina"**. Vezzeggiativo "Vitto". (Prima erano emerse piste brand/ciclismo/positività —
  Aria, Iride, Luce, Tria, Vela — poi virate sulle campionesse su richiesta dell'utente.)
- **Aspetto**: richiesta utente "**ribelle ma femminile, non una bambolina**" → la femminilità passa
  dall'*attitudine*, non da fiocchi/trucco/rosa. Da qui: coda alta spettinata + bandana sportiva (no
  accessori "carini"), smirk deciso, tratti "famiglia" con Nino (occhi marroni + lentiggini) per far
  leggere il duo.
- **Master**: tra le varianti generate l'utente ha eletto `Vittoria.png` come canonica → è il reference
  per tutto (training Soul + generazioni i2i).

## ID Higgsfield
- **Soul:** `Vittoria - Triono Scuola Ciclismo` · soul_id `e973d27e-a37a-43fc-9993-f96ae5fbeaee` (tipo `soul_2`)
  - Usabile con `text2image_soul_v2` (Soul V2) e `soul_cinema_studio` (Soul Cinema). Per altri modelli → reference image / element.
- **Master reference (uploaded media):** `2eb317f4-fb9f-4a23-bff9-3bb14aa6dbe5` (= `Vittoria/Vittoria.png`)
- **Modello generazione immagini (i2i, come Nino):** `nano_banana_2`

## Set di training Soul (13 immagini)
Master `Vittoria.png` + 12 generate (nano_banana_2 i2i sul master), in `Vittoria/training/`:
- A1/A2 close-up volto (smirk) · B1/B2 3/4 sinistra (determinata) · C1/C2 3/4 destra (sorriso)
- D1/D2 fronte (risata) · E1/E2 hero braccia conserte (waist-up) · F1/F2 semi-profilo (calma)

## Prompt template (Soul V2)
> `[ESPRESSIONE/POSA], 3D Pixar/Disney-style animated girl cyclist, ~11yo, dark-brown messy high
> ponytail with rebel flyaway strands, thin sporty bandana headband (confetti accent), big warm
> brown eyes, light freckles, confident rebellious-but-feminine vibe (no makeup, not doll-like).
> Navy-blue cycling jersey with colorful confetti pattern + sponsor logos, ENERVIT with no tagline.
> PURE WHITE seamless background. High detail, consistent Pixar character design.`

## Set pose + cutout (fatto)
7 pose generate (nano_banana_2 i2i dal master) → cutout Adobe `image_remove_background` (matting
pulito, no flood-fill) → PNG trasparenti in `Vittoria/cutout/`: `vittoria-{cover,hero,casco,guanti,
occhiali,borraccia,luci}.png`. Pick usati: cover_v1, hero_v1, casco_v1, guanti_v2, occhiali_v1,
borraccia_v1, luci_v1 (originali su bianco in `Vittoria/poses/`).

## Animazione hero (fatto) — duo con Nino
- Sorgente: **Kling 3.0** (mode pro, 9:16, 5s, audio off), start_image = frame `hero_v1` (job
  `111c7af5-…`), idle "respiro" a camera bloccata su bianco. Job video `5f0cd48d-…`.
- Alpha via **two-background matting** (NINO.md §3): Higgsfield `remove_background` video → matte su
  nero (job `25b6b193-…`); α = 1 − (bianco − nero)/255, colore = nero/α; bbox unico per stabilità.
- Asset (stesso formato di Nino) in `public/vittoria/` del branch + sorgenti in `Vittoria/anim/`:
  `vittoria-figura.webm` (VP8+alpha), `vittoria-figura.mov` (HEVC hvc1+alpha, Safari),
  `vittoria-figura-poster.png`. Sorgenti rimatting: `Vittoria/anim/vittoria-white.mp4` + `-black.mp4`.
- Integrazione: `src/components/scuola/ScuolaHeroNino.tsx` rende il **duo** (props `vittoria{Webm,Mov,Poster}`,
  default `/vittoria/vittoria-figura.*`). **Desktop**: duo a destra accanto al testo (Vittoria dietro/sinistra
  `h-[90%]`/`-mr-[7%]`, Nino davanti `z-10`). **Mobile**: duo **dietro al testo** (contenuto `z-20`) come
  backdrop, con **velo bianco** solo-mobile (z-10) per la leggibilità e mascotte **dentro la card**
  (`right-0 bottom-2`, piedi non escono sul navy). **Parallax rimosso** del tutto. Mergiato in **PR #78**.

## Lezione "rettangolo opaco su mobile" (2026-06-15)
Anche **Nino** mostrava un rettangolo opaco su mobile (Chrome **e** Safari) pur "avendo l'alpha": la
causa era l'**asset** (webm da una sessione precedente con matte/encoding diverso), non il browser —
Vittoria (stesso componente) era ok. Fix: **rifare il matte da zero** col two-background (`hero.mp4`
bianco + Higgsfield `remove_background` nero) + `libvpx yuva420p -auto-alt-ref 0`, cioè il pipeline di
Vittoria; ri-encodare dal master vecchio **non basta**. ⚠️ Chrome **headless non rende il `<video>` a
larghezza mobile** → il rettangolo va verificato su **device reale**. Dettaglio in `NINO.md §12`.

## Note
- Riferimento operativo completo delle mascotte: **`NINO.md`** (radice repo) — §11 Vittoria, §12 hero duo.
- Stato: **mergiato in PR #78** (duo live su `/la-scuola`). I 7 cutout pose restano in `Vittoria/cutout/`
  (non in `public/`): copiarli solo se servono ad altre sezioni/social.
