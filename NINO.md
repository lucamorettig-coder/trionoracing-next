# NINO & VITTORIA — Mascotte Triono Scuola Ciclismo · guida completa

Memoria operativa per **gestire le mascotte della scuola** — **Nino** e la sua gemella femminile **Vittoria** (§11) — in due ambiti:
1. **Pubblicazioni della scuola** (immagini, caroselli, reel, calendario social);
2. **Frontend del sito** (questo repo `trionoracing-next`).

> Questo file è una **traccia persistente** di come funzionano le mascotte e dei ragionamenti dietro le scelte. Le due mascotte condividono pipeline e costanti di brand; Nino è il riferimento, Vittoria la replica al femminile.

> Asset master e tooling vivono nel progetto **`~/Documents/Claude/Projects/Area Riservata Triono`**
> (loghi, cutout, video, board social). Gli asset pronti per il sito sono già copiati in **`public/nino/`**.

---

## 1. Chi è Nino
- Ragazzo ciclista **~11 anni**, stile **3D Pixar/Disney** (NON fotorealistico): capelli castano mossi, occhi marroni grandi, lentiggini, sorriso amichevole. Kit navy con **pattern confetti** colorato e tutti i loghi (Scuola Ciclismo, Triono Racing, Enervit, velo, Ortana), guanti navy.
- Il nome è dentro **tri‑O‑NO**.
- **Higgsfield Soul**: `Nino - Triono Scuola Ciclismo` · soul_id `6ba9f0b3-1e02-419a-a5ea-335af1ed2b28` (tipo `soul_2`). Vale **solo** con Soul V2 / Soul Cinema; per Nano Banana si usano i **reference image** (sotto).
- **Controparte femminile**: **Vittoria**, gemella di Nino (stessi costanti di brand). Identità, ragionamenti e ID in **§11**.

## 2. Generare nuove immagini di Nino (Higgsfield)
- **Modello: `nano_banana_2`** (= "Nano Banana 2" di Google), image‑to‑image. ⚠️ `nano_banana_flash` è il vecchio nome interno, oggi **rifiutato** dall'endpoint.
- **Reference** (`medias`, role `image`):
  - master figura/volto: `c8d55a31-b5ce-4d26-b67f-1bb8d51df185`
  - close‑up volto: `afac40fc-6e2c-4e1c-80ed-6edf41641601`
- **Regole fisse:**
  - **Sfondo bianco** sempre (`PURE WHITE seamless background`) → poi si ritaglia.
  - **Usa SEMPRE l'immagine brandizzata con TUTTI i loghi.** ❌ NON usare la versione "maglia pulita / pannello navy liscio" (era un esperimento di overlay loghi, **abbandonato**).
  - I loghi/testo l'AI li **sbava** sempre: si accettano "come vengono" sulla maglia (decisione dell'utente). Unica eccezione: la **tagline** "The Positive Nutrition Company" sotto ENERVIT va **rimossa** (vedi §4).
- **Template prompt** (i2i):
  > `3D Pixar/Disney-style animated boy cyclist, the SAME character as the reference images (Nino): identical face, warm brown eyes, tousled medium-brown hair, light freckles, rounded youthful face, [ESPRESSIONE]. Wearing the same navy-blue short-sleeve cycling jersey with colorful abstract confetti pattern. [FRAMING: waist-up / full body]. [AZIONE]. NO bicycle, no handlebars. Bright friendly children's animated-film mood, soft even lighting. PURE WHITE seamless background. High detail, consistent Pixar character design.`
- Genera **2 varianti** (`count: 2`), `resolution: 2k`, aspect `4:3` (scene oggetto) o `4:5`/`9:16`.

## 3. Rimuovere lo sfondo (cutout) — punto delicato
- **IMMAGINI → Adobe `image_remove_background`** (matting pulito, gestisce gli spazi negativi sotto le braccia). Adobe **non accetta URL** da domini non whitelisted (es. CloudFront di Higgsfield) → **scarica il file e caricalo dal locale** (upload a chunk: `asset_initialize_file_upload` → `PUT` byte sulla transfer URL → `asset_finalize_file_upload` → `image_remove_background` con la `presignedAssetUrl`). ❌ **NON** usare il flood‑fill: lascia patch bianche negli spazi chiusi (tra braccio e fianco). Ritaglia sempre al contenuto (`getbbox`).
- **VIDEO → Higgsfield `remove_background`** (`media_type: "video"`). Restituisce il soggetto su **sfondo NERO** (l'MP4 non ha alpha). Per un alpha pulito usa il metodo **"due sfondi"**: avendo l'originale (fondo **bianco**) E il matte (fondo **nero**), stesse frame → `alpha = 1 − (bianco − nero)/255`, `colore = nero/alpha`. Poi codifica in **WebM VP8 con alpha**: `ffmpeg -framerate <fps> -i %03d.png -c:v libvpx -pix_fmt yuva420p -auto-alt-ref 0 out.webm` (+ `.mov` HEVC `hvc1` con alpha per Safari + poster PNG con alpha). ⚠️ Per **verificare** l'alpha forza il decoder: `ffmpeg -c:v libvpx -i out.webm -vf format=rgba ...` (il decoder di default droppa l'alpha e sembra opaco). Verifica visiva: componi i frame RGBA su **magenta** (nessun alone/rettangolo).
- ⚠️ **`-auto-alt-ref 0` è obbligatorio**: il VP8 alpha è fragile, con alt-ref attivo (default) alcuni decoder **mobile** mostrano un **rettangolo opaco** pur avendo l'alpha (vedi lezione in §12). E **ri-encodare partendo da un master alpha vecchio/imperfetto NON basta** — rifare il matte da zero col two-background.

## 4. Kit loghi (in `Area Riservata Triono/loghi/`)
Ogni brand in **2 finiture**: **bianco** (su navy/fondi scuri) e **dark/colore** (su bianco).
- **Enervit**: `enervit-white` / `enervit-dark` — **senza la tagline** "The Positive Nutrition Company". Sulla maglia di Nino, dove l'AI rende la tagline, va **coperta** con un fill navy locale (mediana dei pixel scuri attorno al testo).
- **Scuola**: `scuola-ciclismo-color` (emblema colore + testo navy → su bianco) · `scuola-ciclismo-kit` (emblema colore + testo **bianco** → su navy). Sorgente pulita: `Logo scuola sfondo bianco.png`.
- **Triono Racing**: `triono-racing-white` / `-dark`. **Velo+**: il "+" è **sempre rosso** `#e30613`. **Ortana**: senza l'indirizzo; su navy un **bordino bianco** sottile sulle scritte verdi.

## 5. Asset attuali — dove sono
- **Cutout trasparenti (Adobe)** → `Area Riservata Triono/social/assets/nino/` e **copiati in questo repo in `public/nino/`**: `nino-hero` (1514×2304, brandizzato), `nino-cover` (1345×2048, cover ufficiale), `nino-casco` (1749×2011), `nino-guanti` (1606×1775), `nino-occhiali` (1964×1792), `nino-borraccia` (1505×1792), `nino-luci` (1690×1792).
- **Immagini definitive (sorgenti su bianco)** → `Area Riservata Triono/nino/sicurezza/immagini definitive/` (`cover.jpg`, `Cover 2.jpg` figura intera, `sicurezza-*.png`). **Sono queste le sorgenti buone** da ritagliare.
- **Video** → `Area Riservata Triono/nino/video/` (`sicurezza-reel.mp4`, `nino-idle.mp4`) + `public/nino/cover-video-alpha.webm` (Nino che respira, **alpha trasparente**, per il sito).
- **Loghi** → `Area Riservata Triono/loghi/` (con `README.md` e `_kit_loghi_verifica.png`).

## 6. Contenuti social statici (caroselli / post) — repo `Area Riservata Triono/social/`
Board **React** (Babel in‑browser) fedele al design system. Formati: Post 1080², Story 1080×1920, **Carosello 1080×1350**.
- Nino è il componente **`<Nino>`** in `shared.jsx` (cutout PNG). Set **"Sicurezza"** in `sicurezza.jsx`: cover *"Pedala sicuro"* + **5 dotazioni** (casco, guanti, occhiali, borraccia, luci).
- **Regola di layout:** Nino **ancorato al bordo inferiore** (il taglio del cutout coincide col bordo → niente figura "che fluttua"), **ingrandito**. Lo sfondo navy usa la **texture reale del tessuto** `assets/sfondo-real.png` + un velo navy (classe `.tr-navy`).
- **Render/export:** `solo.html?c=<Componente>&w=<W>&h=<H>&i=<idx>` aperto in **Chrome headless** con `--force-device-scale-factor=3` → PNG **3×**. Output in `social/export/`. (Le tavole sono in `index.html` per l'anteprima board.)

## 7. Video (Remotion) — motore `~/Developer/social-content/engine/`
Motore **unico e condiviso** (non installare Remotion per brand). Tema **`TRIONO_SCUOLA_THEME`** (`theme.ts`).
- Composition Nino: **`nino-idle`** (loop respirazione) e **`sicurezza-reel`** (9:16, cover + 5 dotazioni + end‑card sponsor Ortana, audio `pop-emotional.mp3`). File: `remotion/NinoIdle.tsx`, `remotion/SicurezzaReel.tsx`, registrate in `Root.tsx`. Cutout in `engine/public/social/triono-scuola/nino/`.
- **Render:** `cd ~/Developer/social-content/engine && npx remotion render remotion/index.ts <id> out/<nome>.mp4` · anteprima live: `npx remotion studio`.
- Un **video trasparente** di Nino si integra con `<OffthreadVideo src=... transparent />` (es. `cover-video-alpha.webm` nella cover del reel).

## 8. Pipeline editoriale — Social Content Hub (Airtable)
Base `app0Fpac9Z6A6728i` · tabella **Contenuti** `tblczWmXkAoQHUeWs` · **Progetto = "Triono Scuola Ciclismo"** (`sel0ecvI2r0BG01jv`).
Flusso (3 skill, confini netti):
1. **`pianificatore-campagna-social`** — crea i record **Bozza** già compilati (Titolo, Tipo, Aspect, Piattaforme IG/FB, Caption IT, Hashtag, CTA, `Traccia audio`, `Loghi sponsor`+`Sponsor`, `Data pubblicazione`). Niente data‑entry: si genera dall'intento. Voce scuola = **asciutta, niente hype**, spinge sempre a **trionoracing.it**.
2. **`social-video-studio`** — produce/aggancia l'asset: upload su **Cloudinary** (`engine/scripts/cloudinary_upload.mjs`, credenziali in `engine/.env.local`), scrive `Asset finale` (multipleAttachments = `[{url}]`, caroselli **in ordine**) + `Cloudinary public_id` → **`Status = Approvato`**. Caroselli: convertire le immagini in **JPEG 1080×1350**.
3. **app esterna `social-publisher`** (Vercel) intercetta i record **Approvato** e pubblica su IG/FB alla `Data pubblicazione`.
- **Limiti publisher:** carosello → IG+FB automatici; **reel → IG automatico, FB reel manuale**. Reel via API: musica **dentro** il file (no catalogo IG), MP4 **H.264 + AAC** ≤ ~90s.
- Sponsor: linka i record `Attivo=true` con logo; nella caption metti gli **@handle IG** (campo `IG handle`); se manca l'handle (es. **Ortana** non ce l'ha) → solo logo, niente tag.

## 9. Inserire Nino nel FRONTEND del sito (questo repo)
Next.js 16 · **App Router** (`src/app`, route group `(public)`) · componenti per sezione in `src/components` · `next/image` già in uso · asset statici in `public/`.
- **Asset pronti:** `public/nino/*.png` (cutout trasparenti) + `public/nino/cover-video-alpha.webm` (animato, alpha) + `public/nino/nino-idle.mp4`.
- **Componente riusabile** (crealo in `src/components/ui/Nino.tsx`):
  ```tsx
  import Image from "next/image";
  const POSE = {
    cover:    { src: "/nino/nino-cover.png",   w: 1345, h: 2048 }, // hands-on-hips, waist-up (default sito)
    hero:     { src: "/nino/nino-hero.png",    w: 1514, h: 2304 },
    casco:    { src: "/nino/nino-casco.png",   w: 1749, h: 2011 },
    guanti:   { src: "/nino/nino-guanti.png",  w: 1606, h: 1775 },
    occhiali: { src: "/nino/nino-occhiali.png",w: 1964, h: 1792 },
    borraccia:{ src: "/nino/nino-borraccia.png",w: 1505, h: 1792 },
    luci:     { src: "/nino/nino-luci.png",    w: 1690, h: 1792 },
  } as const;
  export function Nino({ pose = "cover", className, priority, label }:
    { pose?: keyof typeof POSE; className?: string; priority?: boolean; label?: string }) {
    const p = POSE[pose];
    return (
      <Image src={p.src} width={p.w} height={p.h} priority={priority} className={className}
        alt={label ?? ""} aria-hidden={label ? undefined : true} />  // decorativo di default
    );
  }
  ```
- **Versione animata** (Nino che respira, fondo trasparente):
  ```tsx
  <video src="/nino/cover-video-alpha.webm" autoPlay loop muted playsInline aria-hidden className="..." />
  ```
- **Dove usarlo:** mascotte nella sezione **Scuola** (hero/inviti), pagine **bambini/sicurezza**, empty‑state/404, stati di caricamento. Sta benissimo **su fondo navy** (è trasparente) o dentro **card bianche**; ancoralo in basso e lascialo "uscire" dal bordo per un effetto hero.
- **Accessibilità:** se è solo decorativo → `alt=""` + `aria-hidden`; se veicola un messaggio → `alt` descrittivo (es. "Nino indossa il casco").
- **Design system del sito** (coerenza coi cutout): navy `#050E3F` / `#1F2D5A`; accenti confetti `sky #3A82C8`, `grass #5FAC36`, `ember #E09618`, `flag #C01818`, `sun #EFE63A`; pattern in `public/pattern.svg` / `pattern-light.svg`; loghi in `public/logo-scuola.png`, `logo-triono-racing.png`.

## 10. Convenzioni & lezioni (per non ripetere gli errori)
- ✅ Usa **sempre l'immagine di Nino brandizzata** coi loghi; ❌ mai la "maglia pulita".
- ✅ Cutout: **Adobe** per le immagini, **two‑background matting** per i video; ❌ mai flood‑fill (aloni/patch bianche).
- ✅ Nino **ancorato al bordo inferiore** e **ingrandito** (taglio = bordo del contenuto).
- ✅ Sotto ENERVIT **niente tagline**.
- ✅ Le **dotazioni di sicurezza** della scuola sono **5**: casco, guanti, occhiali, borraccia, luci.
- ✅ Sfondi navy = texture reale `sfondo-real.png` + velo, non navy piatto.
- ✅ Per gli oggetti tenuti (casco/borraccia) il logo Scuola va sull'oggetto, ma la maglia resta "come viene".
- ✅ **Vittoria** è la gemella femminile (§11): stessi costanti brand, carattere "ribelle ma femminile, non bambolina".
- ✅ Video alpha mascotte sul sito: **rifai sempre il matte da zero col two-background + `-auto-alt-ref 0`** (non ri-encodare un master vecchio), altrimenti **rettangolo opaco su mobile**. Verifica su **device reale** — Chrome headless non rende il `<video>` a larghezza mobile. Vedi §12.
- ✅ Hero della Scuola = **duo** Nino+Vittoria, **niente parallax**; su mobile le mascotte stanno **dietro al testo** con velo bianco e **piedi dentro la card** (§12).

---

## 11. Vittoria — controparte femminile (creata 2026-06-15)
Gemella di Nino: **stessi costanti di brand** (3D Pixar/Disney, ~11 anni, kit navy confetti + tutti i loghi, ENERVIT senza tagline, guanti navy, generazione su sfondo bianco → cutout). Cambia il personaggio.

- **Nome — ragionamento**: scelto tra nomi ispirati a **campionesse del ciclismo**. *Vittoria* = nome della campionessa **Vittoria Bussi** (record dell'ora) + significa **"vittoria"** + storico marchio ciclistico (gomme **Vittoria**). Vincolo esplicito dell'utente: **NON "Nina"**. Vezzeggiativo "Vitto". (Prima di arrivarci si erano valutate piste brand/ciclismo/positività — es. Aria, Iride, Luce, Tria — poi virate sulle campionesse.)
- **Aspetto — ragionamento**: richiesta utente "**ribelle ma femminile, non una bambolina**" → la femminilità passa dall'*attitudine*, non da fiocchi/trucco/rosa. Risultato: **coda alta spettinata** con ciuffi ribelli, **bandana sportiva** in un accento confetti (giallo/`sun`), **occhi marroni grandi + lentiggini** (tratti "famiglia" con Nino), espressione **decisa/sbarazzina** (smirk). Niente makeup/blush marcato.
- **Higgsfield Soul**: `Vittoria - Triono Scuola Ciclismo` · soul_id `e973d27e-a37a-43fc-9993-f96ae5fbeaee` (tipo `soul_2`). Master reference (uploaded media): `2eb317f4-fb9f-4a23-bff9-3bb14aa6dbe5` (= `Vittoria/Vittoria.png`). Soul addestrato su 12 immagini (6 angoli × 2) + master, generate con `nano_banana_2` i2i dal master.
- **Generare immagini di Vittoria**: come Nino (`nano_banana_2` i2i) **ma** con reference = il **master di Vittoria** (`2eb317f4…`), non quelli di Nino, così resta lei. Per pose/espressioni nuove o video si può usare il **Soul V2** (`model: soul_2` + `soul_id`).
- **Asset** (cartella `Vittoria/` alla radice del repo): `Vittoria.png` (master), `training/` (12 img set Soul), `poses/` (7 pose su bianco), `cutout/` (7 PNG trasparenti Adobe: cover, hero, casco, guanti, occhiali, borraccia, luci), `anim/` (idle + sorgenti `vittoria-white.mp4`/`-black.mp4` per ri-mattare), **`vittoria-ids.md`** (record completo con tutti gli ID e i prompt). Asset hero pronti in `public/vittoria/`.
- **Pipeline pose/cutout** = identica a Nino (§2 + §3): pose su bianco → cutout Adobe → PNG trasparenti.

## 12. Hero "duo" nel sito (pagina Scuola) — come funziona (2026-06-15)
Componente: `src/components/scuola/ScuolaHeroNino.tsx` (usato da `ScuolaHero.tsx` in `/la-scuola`). Rende il **duo Nino + Vittoria** come video scontornati con alpha (animazione idle "respiro").

- **Composizione (z crescente)**: card bianca + canvas "reveal" geometrico (z0) → **mascotte** (z5) → **velo bianco solo-mobile** (z10) → **contenuto/testo** (z20).
- **Desktop**: duo a destra, accanto al testo (lì non c'è testo → ben visibili). Vittoria dietro/sinistra (un filo più piccola: `h-[90%]`, `-mr-[7%]`), Nino davanti/destra (`z-10`).
- **Mobile**: il duo fa da **backdrop DIETRO al testo** (il contenuto è `z-20`, sopra le mascotte), ammorbidito da un **velo bianco** (`sm:hidden`, gradient `to top` ~0.90→0.12) per la leggibilità. Mascotte ancorate **dentro la card** (`right-0 bottom-2`) così i **piedi non escono** sul navy della sezione sotto.
- **Niente parallax**: rimosso del tutto da desktop e mobile (su touch "ballava", su desktop superfluo). La scia *reveal* del canvas resta.
- **Asset usati**: `public/nino/nino-figura.{webm,mov,png}` + `public/vittoria/vittoria-figura.{webm,mov,png}` — WebM VP8 alpha (Chrome/Firefox), `.mov` HEVC `hvc1` alpha (Safari), poster PNG. Sorgente: idle "respiro" 5s generato con **Kling 3.0** (start frame = posa hero su bianco) → **two-background matting** (§3).

### ⚠️ Lezione "rettangolo opaco su mobile" (debug 2026-06-15)
Un video alpha mascotte può apparire come **rettangolo opaco su mobile** (Chrome **e** Safari) anche se il file "ha l'alpha" (ffmpeg lo decodifica). È successo a **Nino**: ok su desktop, rettangolo su mobile; **Vittoria** (stesso identico componente) ok ovunque → la differenza era **l'asset**, non il browser. **Causa**: il webm di Nino veniva da una sessione precedente con matte/encoding diverso. **Fix che NON basta**: ri-encodare partendo dal master alpha vecchio. **Fix corretto**: **rifare il matte da zero** col two-background (`hero.mp4` su bianco + Higgsfield `remove_background` su nero) e re-encodare `libvpx yuva420p -auto-alt-ref 0` — esattamente il pipeline di Vittoria. **Verifica**: Chrome **headless NON renderizza il `<video>` a larghezza mobile** (a desktop sì) → il rettangolo mobile **non è riproducibile in headless**, va controllato su **device reale**.
