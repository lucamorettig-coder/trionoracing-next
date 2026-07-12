# EVO-040 — Migrazione Cloudinary a cloud dedicato

- **ID**: EVO-040 · **Slug**: cloudinary-migration
- **Data inizio**: 2026-07-13 · **Stato**: in implementazione (PR aperta al push)
- **Tipo**: infrastruttura · **Area**: media/delivery · **Priorità**: alta (sito live con media rotti)

## Problema
Il cloud Cloudinary `duezeronove` è **condiviso** con il sito legacy duezeronove.it ed è su piano **Free** (25 crediti/mese). La quota è stata esaurita — accelerata dal doppio rename del cloud name (invalidazione cache CDN → picco di banda) — e Cloudinary ha **bloccato la delivery account-wide**: 404 su tutte le immagini/video (anche su asset appena caricati), mentre l'API restava attiva. Diagnosi via MCP Cloudinary: `credits 24.08/25 (96%)`, upload ok + delivery 404.

## Soluzione
Nuovo account Cloudinary **dedicato** `u5hvesvu` (Free, decoupled da duezeronove.it). Migrati i soli asset usati dal sito (~32, non i 737 totali).

### Export nonostante la delivery bloccata (chiave tecnica)
`generate_archive` in `mode=download` restituisce lo ZIP **direttamente dall'endpoint API** (`api.cloudinary.com`), che funziona anche con la delivery bloccata. → export → upload signed sul nuovo cloud **preservando il public_id** (così cambia solo il cloud name negli URL).

### Asset migrati
- 4 capi kit (root `hf_2026...`) · 14 galleria (`sito/immagini/scuola-01..14`) · 9 bacheca amatori (root `IMG_*`/`amatore_triono_1`) · 5 video sfondi (`sito/sfondi/*`) · 1 OG 209 (`og/og-209-2026`).
- Nota: le 9 bacheca avevano asset_folder `sito/immagini` ≠ public_id di delivery (root) → ri-caricate al public_id corretto e ripuliti i doppioni.

### Codice (questa PR)
- `next.config.ts`: remotePattern `/u5hvesvu/**`.
- `src/lib/kit-scuola.ts`: URL + strip versione `/v1779548283/` (version-less).
- `src/components/scuola/SezioneGalleria.tsx`, `src/components/amatori/BachecaFoto.tsx`: `CLD` cloud name.
- `src/lib/sfondi-video.ts`: commento.

### Airtable (fuori PR, applicato)
- `Sfondi Video` DEV (`app7FOqBdmmW0jBf5`) + PROD (`appszpkU1aXb3xrFM`): VIDEO_URL + POSTER_URL ri-puntati (version-less).
- Base 209: `og_image_url` ri-puntato.

## Verifica
- Delivery nuovo cloud: immagini 200 (kit/galleria/bacheca/og-209), 5 video mp4 validi 200 (transcode `f_auto` al primo hit → 423→200).
- App locale (post pulizia `.next/cache`): kit 4/4, bacheca 9/9 caricate dal nuovo cloud; video hero src `u5hvesvu` (headless non renderizza `<video>`, verifica via mp4 valido).
- Gate: tsc ✅ · lint 0 err ✅ · build ✅.

## Follow-up go-live (utente / Vercel)
1. **Vercel env**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=u5hvesvu` (+ `CLOUDINARY_API_KEY`/`_SECRET` nuovi) su **Production + Preview**, poi **redeploy** (NEXT_PUBLIC inlined a build-time).
2. Vecchio cloud `duezeronove` invariato (lo usa duezeronove.it).
3. Il nuovo account è Free: monitorare la quota; il doppio rename del cloud è la lezione (non rinominare i cloud).

## Coordinamento con EVO-039
EVO-039 (restyle /la-scuola, PR #101) tocca `SezioneGalleria.tsx` → conflitto atteso. Ordine: merge EVO-040 prima (Cloudinary torna) → rebase EVO-039 → verifica kit/galleria pieni → merge EVO-039.
