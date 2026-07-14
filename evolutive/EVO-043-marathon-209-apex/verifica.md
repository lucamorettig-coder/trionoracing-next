# Report di verifica — EVO-043 (restyle APEX /marathon-209)

**Nota**: la skill `verify-implementation` risulta puntata su un altro progetto ("Cycling Experience", path `/sessions/.../cycling-experience`) — bug noto e già documentato in AGENTS.md (EVO-010/024/032/035). Report prodotto manualmente con la stessa struttura per dimensione, sulle convenzioni reali di `trionoracing-next` (AGENTS.md).

**File modificati** (commit squash `c60e037`, PR #108): `src/app/(public)/marathon-209/page.tsx`, `src/components/marathon-209/{MarathonHero,CosaEla209,Percorso,InfoPratiche,Edizioni,CtaMarathon}.tsx`, `src/components/apex/propkit/marathon/AltimetriaProfile.tsx` (nuovo), `src/components/home/SezioneMarathon.tsx` (commento), `public/og/marathon-209.jpg` (nuovo), `memory.md`, `evolutive/EVO-043-marathon-209-apex/EVO-043-marathon-209-apex.md`.

**Data**: 2026-07-14. **Produzione**: https://trionoracing.it/marathon-209 (200, verificato post-deploy).

---

### A. Compliance funzionale (vs requisiti EVO-043)

| Requisito | Status | Note |
|---|---|---|
| Migrazione wrapper pagina `.theme-209` → `data-livery="marathon"` + `Grain` | ✅ | Entrambi i rami (edizione presente/assente) migrati, JSON-LD invariati |
| Restyle Hero (StageProp+Monolite209, CTA esterne, Countdown opzionale) | ✅ | Verificato live: Monolite209 outline visibile, badge stato, CTA funzionanti |
| Restyle Cos'è la 209 (3 ApexCard) | ✅ | Copy invariato, icone+testo |
| Restyle Percorso + integrazione AltimetriaProfile | ✅ | Verificato live: profilo stilizzato + numeri reali (es. "1508 M D+") |
| Restyle Info pratiche + fix griglia auto-fit (P1) | ✅ | Verificato live: 0 celle vuote con 7 elementi |
| Restyle Edizioni + fix badge dinamico (P0) | ✅ | Verificato live in produzione: "ULTIMA EDIZIONE" (non più "PROSSIMA") |
| Restyle CTA finale + fix copy post-evento (P0) | ✅ | Verificato live in produzione: "Missione compiuta / Grazie per essere stati con noi" |
| Nuovo componente `AltimetriaProfile` (attiva `.apex-altimetria`) | ✅ | aria-hidden su SVG, numeri reali come testo vero, silhouette deterministica |
| OG image dedicata + fallback in `generateMetadata` | ✅ | Asset deployato (200, 132KB), fallback verificato nel codice (Airtable ha già un `ogImage` proprio per l'edizione corrente, quindi il fallback non è attivo oggi ma è pronto per quando manca) |
| Nessuna modifica a dati Airtable/JSON-LD/i18n | ✅ | `airtable-209.ts` non toccato, `EventJsonLd`/`BreadcrumbJsonLd` invariati |

---

### B. Convenzioni progetto (AGENTS.md)

✅ **Rispettate:**
- Pattern pagina identico alle 3 già migrate (`data-livery` + `Grain` + JSON-LD + sezioni), `ApexNavBar`/`ApexFooter` non ri-montati (ereditati dal layout)
- Riuso puro di componenti APEX esistenti (`StageScene`, `SectionHead`, `ApexCard`, `StageProp`, `Grain`, `Monolite209`, `Countdown`), nessun nuovo token
- CTA esterne (target="_blank") costruite con classi `apex-cta` dirette invece di `<ApexCta>` (che usa `next/link`, non gestisce bene i link esterni) — scelta corretta e coerente
- Nessun side-stripe border (assoluto divieto DS): gli accenti "top border" su Percorso/badge overlay non sono side-stripe
- `Date.now()` → `new Date().getTime()` nei 3 file che lo richiedevano, pattern già in uso nel resto del codebase (lint `react-hooks/purity`)
- Convenzioni git rispettate: 9 commit atomici (uno per macro-task WBS), Conventional Commits con scope EVO-043, squash merge

⚠️ **Attenzione (non bloccante):**
- `SezioneMarathon.tsx` (Home) e chi-siamo/`Timeline.tsx` menzionano ancora "6ª edizione"/"sesta edizione" mentre `Edizioni.tsx` conta "5ª edizione 2026" — discrepanza di numerazione pre-esistente **fuori scope EVO-043** (tocca componenti di altre evolutive già mergiate), notata durante la ricognizione ma non corretta qui.
- Bug site-wide `backdrop-filter` mancante nell'header `ApexNavBar` (trovato in critique, fuori scope) → task separato già spawnato dall'utente in sessione parallela.

❌ **Violazioni:** nessuna trovata.

---

### C. Design system (DS APEX)

✅ **Rispettate:**
- Token corretti: `bg-stage-surface`/`border-stage-line`/`text-stage-ink`/`text-stage-ink-dim`/`text-stage-muted`/`text-accent` (via `@theme inline` in `globals.css`) — mai `text-stage-faint` su testo leggibile (trap noto)
- `ApexCard` con prop `photo` non usata qui (nessun rischio del bug doppio-aspect-ratio EVO-042)
- `.apex-wrap` non vincolato con `max-w` Tailwind diretto (trap unlayered noto) — non applicabile qui, nessuna sezione ne aveva bisogno
- Griglie auto-fit (`repeat(auto-fit, minmax(...))`) invece di colonne fisse per N variabile (Info pratiche, Percorso) — coerente con la guida impeccable "responsive grids senza breakpoint"
- Marcatori numerati solo dove genuina sequenza (Edizioni, timeline cronologica reale) — nessun eyebrow/numero di riflesso altrove
- Motion: solo il glitch-slice CSS-only già esistente nel propkit `Monolite209`, nessun nuovo primitivo di animazione

⚠️ **Attenzione:**
- `Percorso.tsx` usa `borderTopColor: p.coloreHex` (accento colore per-percorso da Airtable) — un top-border da 3px, non un side-stripe (vietato solo left/right), ma da monitorare se in futuro il DS lo formalizza diversamente.

❌ **Violazioni:** nessuna trovata.

---

### Sintesi

**Score**: 10/10 requisiti funzionali ✅ · 0 violazioni convenzioni · 0 violazioni design system.

**Azioni richieste prima del commit**: nessuna (già mergeato, verificato post-deploy).

**Azioni consigliate (non bloccanti, fuori scope EVO-043)**:
1. Task già spawnato per il fix `backdrop-filter` mancante in `ApexNavBar` (site-wide).
2. Allineare la numerazione edizione ("6ª"/"sesta" su Home/chi-siamo vs "5ª" su questa pagina) in una futura micro-evolutiva o fix diretto.
3. Aggiornare `fotoHeroAlt`/`fotoCtaFinaleAlt` su Airtable con testo descrittivo invece del filename grezzo (trovato in critique, P2, fix dati non codice).
