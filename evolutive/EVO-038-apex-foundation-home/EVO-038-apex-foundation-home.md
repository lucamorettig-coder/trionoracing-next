# EVO-038 — DS v2 APEX foundation + restyle Home

> **Ombrello**: EVO-037 (Restyle APEX parte pubblica) · prima figlia
> **Stato**: in implementazione · branch `evo/EVO-038-apex-foundation-home` · 2026-07-12
> **Design handoff**: `design-handoff/` (DS-APEX.md · apex-tokens.css · apex-showcase.html — bundle Claude Design "Apex Velodromo Notturno")

## Requisiti

Portare in produzione la **fondazione del Design System v2 APEX** (token telaio+livree, 9 componenti, elementi firma CODE necessari alla home) e il **restyle della homepage** — prima pagina del rollout pagina-per-pagina. Il chrome (NavBar/Footer) passa ad APEX su **tutte** le pagine pubbliche. Struttura della home invariata: stesse 6 sezioni, zero contenuti nuovi.

## In scope
- Font Archivo (variable wdth) + JetBrains Mono via next/font.
- `src/app/apex-tokens.css` (copia ri-scopata `[data-stage]` del canonico) + `src/app/apex.css` (classi componente dallo showcase).
- Componenti `src/components/apex/`: Grain, ApexCta, ApexCard, SectionLap, Ticker, Hud, Countdown, FondaleVivo, StageProp, useStageParallax.
- PropKit: TelemetriaGhost, TargaDorsale, RacingLine, EchoStack, Monolite209.
- Asset: `public/apex/racing-road-sprint.webp` (<150KB, da cutout fal.ai).
- Chrome: ApexNavBar + ApexFooter su layout `(public)`.
- Home: hero (statico + HeroCampagne reskin), ticker, sezioni Scuola/Mappa/Amatori/Marathon, CtaFinale.

## Out of scope
- Restyle delle altre 6 pagine pubbliche (figlie successive EVO-037).
- Migrazione `.theme-209` (evolutiva marathon-209).
- Cartoleria Scuola S2, mascotte (livrea Scuola → evolutiva la-scuola).
- Livrea Ciclocross oltre i token. Portale.

## Vincoli chiave (fase 5 del planning)
- **Token scoped `[data-stage]`**: il portale non deve cambiare (no `:root`, no `color-scheme` globale, `::selection` scoped).
- Pagine non migrate: ricevono chrome dark ma restano chiare (data-stage non setta background; il fondo stage lo applica la pagina migrata).
- Invarianti home: ISR 600, metadata/OG, JSON-LD, fetch Airtable paralleli SAFE (campagne hero EVO-035 + sfondi video), consent-gating mappa, meccanica a11y HeroCampagne integrale.
- A11y: contrasti da tabella DS-APEX §8, props `aria-hidden`, focus = DOM, reduced-motion statico, no-JS degradato, mobile 1 prop/sezione.
- Regola mascotte: home = livrea Racing → nessuna mascotte.

## WBS
1. **MT1 Fondazioni** — font, token scoped, apex.css, Grain.
2. **MT2 Componenti core** — 9 componenti (`src/components/apex/`).
3. **MT3 Chrome** — ApexNavBar, ApexFooter, layout (public).
4. **MT4 PropKit + asset** — elementi firma CODE + webp racing.
5. **MT5 Home** — restyle 6 sezioni + ticker.
6. **MT6 Pass trasversale** — a11y/mobile/degradazione + gate.

Wave: 1 → (2 ∥ 4) → 3 → 5 → 6.

## Log

### [2026-07-12] Avvio implementazione
Branch creato da main `d9e50b2`. Design handoff copiato in `design-handoff/`. Piano approvato dall'utente (chrome APEX ovunque; EVO-037 ombrello + EVO-038 figlia).

### [2026-07-12] Implementazione MT1→MT6 completata sul branch
- MT1 `1bbcbd5` fondazioni (token scoped, font, apex.css, Grain) — conflitto `--font-display` risolto rinominando Anton in `--font-anton`.
- MT2 `aceb0f7` componenti core (9) — CSS-first: client solo Hud/Countdown/FondaleVivo/StageScene.
- MT4 `7f128c6` PropKit + `public/apex/racing-road-sprint.webp` (584×546, 58KB); glitch Monolite209 reso CSS-only.
- MT3 `808de4b` chrome APEX su tutto il pubblico.
- MT5 `9979540` restyle home (6 sezioni, ticker, hero campagne reskin meccanica-invariata; fix overflow titolo Marathon via override locale `--fs-display`).
- MT6 verifiche: lint/tsc/build verdi (home `○` ISR 10m) · invarianti SEO (1 h1, OG, canonical, JSON-LD, 0 iframe pre-consenso) · reduced-motion (token 1ms/0 verificati via CDP) · mobile 375 reale senza overflow (`scrollWidth=375`) · 7 pagine legacy 200 sotto chrome dark · CtaFinale APEX ok su chi-siamo.
- **Lezione tooling**: Chrome headless ha larghezza minima finestra ~500px → `--window-size=375` produce screenshot ingannevoli (layout a 500 croppato a 375, "tutto tagliato a destra"). Verifica mobile affidabile = CDP `Emulation.setDeviceMetricsOverride` (`mobile:true`) via `--remote-debugging-port` + WebSocket nativo Node.

### [2026-07-12] Smoke post-branch + iterazioni (7 commit)
Round di smoke con l'utente sulla home APEX, tutti risolti sul branch prima del merge:
1. `352b98f` **FondaleVivo z-index**: floodlight/vignetta (`::before/::after` con z-index espliciti) coprivano il video → nessun z-index, ordine naturale ::before→video→::after.
2. `18f82ef` **hairline gap mascotte**: margine `mt-4` su fondo stage uniforme letto come "buco" → `border-t border-stage-line-soft`.
3. `d1058ad` **`scripts/dev-shot.mjs`**: verifica visiva affidabile (preview MCP bloccato su chrome-error).
4. `8581a60` **trim padding trasparente** cutout iwantyou (24px sotto → gap 5-12px) — con scoperta cache `.next/dev/cache/images`.
5. `b25b1e9` **palco vivo**: `section`→`<StageScene>` su tutte le sezioni + props in HeroCampagne (telemetria/waveform/targa/mascotte parallax) + fix scroll-parallax relativo alla sezione.
6. `e8704bc` **mascotte su tutte le slide** (Nino balance-bike, duo iscrizione) — asset da libreria Cowork.
7. `02c3afd` **logo bianco reale** al posto del filtro CSS.

### [2026-07-12] Go-live — Fase 8
- **PR #98** squash merge su `main` → `b6a0d93`. Branch `evo/EVO-038-apex-foundation-home` cancellato.
- **Produzione verificata**: https://trionoracing.it/ serve la home APEX (marker `apex-nav`/`data-stage`/`data-livery="racing"`/`apex-fondale`/`logo-triono-racing-white` presenti; screenshot render OK: telemetria 54 KM/H, waveform, targa 11, Vittoria, ticker, 3 slide campagne, 8 stage props; logo bianco nitido).
- **Comunicazioni Hero PROD** (`appszpkU1aXb3xrFM`): `IMMAGINE_URL` delle slide "Le iscrizioni sono aperte" e "Allenarsi giocando" erano `None` → PATCH ai path locali (`/scuola/duo-iscrizione.webp`, `/scuola/allenarsi-balance.webp`); visibili entro finestra ISR (~5m).
- **Gate**: typecheck OK · 0 errori lint · build compila.
- **verify-implementation**: skill non disponibile in sessione (pattern noto EVO-010+) → verifica inline sopra per dimensione.

**Follow-up aperti:**
- ⏳ **Video sfondo hero (esterno)**: gli asset Cloudinary `duezeronove` erano 404 per un rename accidentale del cloud (→`trionoracing`→ripristinato `duezeronove`); il rename propaga lentamente sulla CDN. Fino al recupero la home mostra il fallback statico del fondale (nessun crash). Il codice/Airtable sono corretti (puntano a `duezeronove`, asset esistenti agli stessi path). Verificare che il video torni a caricare quando la delivery Cloudinary si allinea.
- Prossima figlia EVO-037: restyle pagina (candidata `/la-scuola`).
