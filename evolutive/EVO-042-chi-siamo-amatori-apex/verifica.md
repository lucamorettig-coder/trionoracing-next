# Report di Verifica Implementazione — EVO-042

**File modificati:** `src/app/(public)/chi-siamo/page.tsx`, `src/app/(public)/gli-amatori-triono/page.tsx`, `src/components/chi-siamo/{ChiSiamoHero,Timeline,Fondatori,CosaSiamoOggi}.tsx`, `src/components/amatori/{AmatoriHero,SezioneValori,ComeUnirsi,DoveQuando,BachecaFoto}.tsx`
**Riferimento:** `evolutive/EVO-042-chi-siamo-amatori-apex/EVO-042-chi-siamo-amatori-apex.md` (§4 WBS, §5 verifica coerenza, §6 UX/UI)
**PR:** [#107](https://github.com/lucamorettig-coder/trionoracing-next/pull/107) — squash `e579f1b`, live su `main`
**Data:** 2026-07-13

> Nota: la skill `verify-implementation` installata in sessione risulta puntata su un altro progetto ("Cycling Experience", path `/Users/luca/Developer/cycling-experience`) — pattern già noto (EVO-010/024/032/035). Report prodotto manualmente con la stessa struttura per dimensione, verificato contro le convenzioni reali di `trionoracing-next` (AGENTS.md, PRODUCT.md, `src/app/apex.css`/`apex-tokens.css`).

---

### A. Compliance funzionale (vs WBS §4)

| Requisito (macro-task) | Status | Note |
|---|---|---|
| T1 ChiSiamoHero → hero-palco APEX Racing | ✅ | Hero-palco sobrio senza mascotte, stats invariate, CTA verso /la-scuola e /contatti |
| T2 Timeline → APEX | ✅ | Rail su stage scuro, sequenza anni invariata; corretto in review un `max-w-[960px]` su `.apex-wrap` (CSS unlayered, nessun effetto) spostandolo sull'`<ol>` |
| T3 Fondatori → APEX photo-led | ✅ | Corretto in review un doppio `aspect-ratio` annidato (`ApexCard photo` già forza 4:3+overflow:hidden) che avrebbe tagliato le foto |
| T4 NEW CosaSiamoOggi | ✅ | 3 card cross-link (Scuola/Amatori/Marathon 209), nessun kicker (apertura variata), solo fatti reali |
| T5 AmatoriHero → hero-palco APEX Racing | ✅ | Resta `async`, `getSfondoVideo("amatori-hero")` invariato (ISR EVO-021), nessuna stats (per brief) |
| T6 SezioneValori → APEX | ✅ | 3 card Strada/MTB/Agonismo, icone esistenti riusate |
| T7 ComeUnirsi → APEX | ✅ | Step numerati (sequenza reale) + CTA |
| T8 BachecaFoto → APEX | ✅ | Foto in `apex-duotone`+`border-stage-line`, array foto/alt/Cloudinary invariato |
| T9 NEW DoveQuando | ✅ | Ciclodromo Perona + richiamo Marathon 209, `variant="h2"` (logistica quieta) |
| T10 wrapper /chi-siamo | ✅ | `data-livery="racing"`+`Grain`, metadata/JSON-LD invariati, import CosaSiamoOggi aggiunto |
| T11 wrapper /gli-amatori-triono | ✅ | Idem, ISR `revalidate=600` invariato, import DoveQuando aggiunto |

Nessuno scostamento dalla WBS pianificata in fase 4.

---

### B. Convenzioni AGENTS.md / progetto

✅ **Rispettate:**
- Convenzioni git: branch `evo/EVO-042-...`, commit Conventional Commits con scope EVO-042, un commit per macro-task, squash merge
- Server Components ovunque tranne dove già client (`icons.tsx`, pre-esistente); `AmatoriHero` resta `async`
- Nessuna nuova dipendenza, nessun asset nuovo
- SEO: canonical/OG/JSON-LD/ISR preservati byte-per-byte (verificato anche in produzione via curl)
- Nessun claim/numero inventato nelle 2 sezioni nuove (regola PRODUCT.md "Proof on hand: nessuna prova disponibile — non inventare")

⚠️ **Attenzione:**
- Nessuna

❌ **Violazioni:**
- Nessuna

---

### C. Design system (APEX v2)

✅ **Rispettate:**
- Solo componenti/classi APEX esistenti (`SectionHead`, `ApexCard`, `ApexCta`, `StageProp`, `FondaleVivo`, `apex-section`/`apex-wrap`, `apex-duotone`, `stroke-word`/`accent-word`) — verificati uno per uno contro `apex.css`/`apex-tokens.css`, nessun nome inventato
- Zero hex hardcoded introdotti (verificato via grep sul diff mergiato)
- Contrasto: **zero uso di `text-stage-faint`** su testo piccolo/significativo (trap noto del progetto) — solo `text-stage-ink`/`-ink-dim`/`-muted`, tutti ≥AA sullo stage scuro
- Livrea Racing corretta (`data-livery="racing"`, accento ciano+giallo, coerente con Home/EVO-038)
- Aperture di sezione **variate** (non tutte kicker+display): CosaSiamoOggi senza kicker, Fondatori photo-led, DoveQuando/BachecaFoto `variant="h2"` quieto — rispetta la regola anti-slop `SectionHead` (no eyebrow uniforme)
- Alt text fotografici preservati/reali; icone decorative `aria-hidden` (default del componente `withIcon`)
- Reduced-motion: `.reveal`/`.reveal-delay-N` riusati invariati (già reduced-motion-safe di sistema)

⚠️ **Attenzione:**
- Un "overflow orizzontale mobile" rilevato via check automatico (`scrollWidth>clientWidth`) si è rivelato un falso positivo (layer `.apex-grain` `position:fixed` + video dentro `.stage-scene{overflow:hidden}`) — stesso pattern già presente e accettato su `/la-scuola` in produzione. Non azionabile, non introdotto da questa evolutiva.

❌ **Violazioni:**
- Nessuna

---

### Sintesi

**Score:** 11/11 macro-task compliant, 0 violazioni design system/convenzioni.

**Verifica visiva:** desktop (multi-scroll reale) + mobile (390px), entrambe le pagine, via `scripts/dev-shot.mjs` (Chrome headless CDP) — tutte le sezioni renderizzano correttamente, nessun problema di layout reale.

**Verifica produzione:** `https://trionoracing.it/chi-siamo` e `/gli-amatori-triono` → 200, contenuti nuovi presenti, canonical/OG invariati.

**Azioni richieste prima del commit:** nessuna (già mergiato).

**Azioni consigliate (non bloccanti):**
- Nessuna specifica a questa evolutiva. L'ombrello EVO-037 resta aperto: prossime figlie /marathon-209 (serve GPX) e /diventa-maestro+/contatti+legali.
