# Report di verifica — EVO-044 (restyle APEX ultime pagine pubbliche)

**Nota**: `verify-implementation` risulta puntata su un altro progetto ("Cycling Experience") — bug noto e ricorrente (AGENTS.md EVO-010/024/032/035/043). Report prodotto manualmente con la stessa struttura per dimensione, sulle convenzioni reali di `trionoracing-next`.

**File modificati** (commit squash `207d1cf`, PR #110): 19 file — `src/app/(public)/{diventa-maestro,contatti,privacy,condizioni,cookie}/page.tsx`, `src/app/(public)/layout.tsx`, `src/components/diventa-maestro/{HeroManifesto,SezioneChiCerchiamo,SezioneTI2,SezioneCosaFarai,CtaContattaci}.tsx`, `src/components/contatti/ContactForm.tsx`, `src/components/apex/legal/{ApexLegalSection,ApexLegalTable}.tsx` (nuovi), `src/components/consent/{CookieBanner,CookiePreferences,Switch}.tsx`.

**Data**: 2026-07-14. **Produzione**: https://trionoracing.it (tutte e 5 le pagine 200, verificato post-deploy).

---

### A. Compliance funzionale (vs requisiti EVO-044)

| Requisito | Status | Note |
|---|---|---|
| `/diventa-maestro` restyle APEX livrea Scuola (5 componenti + wrapper) | ✅ | Verificato live: hero Vittoria + livrea scuola, CTA finale Nino |
| `/contatti` restyle APEX livrea Racing (form + aside), logica invariata | ✅ | Form Zod/honeypot/stati invariati (solo classi), verificato via lettura diff |
| 3 pagine legali restyle APEX + consolidamento `ApexLegalSection`/`ApexLegalTable` | ✅ | Testo legale verificato invariato carattere per carattere (diff) |
| Cookie banner + modal preferenze theme-aware per path | ✅ | Verificato live su `/diventa-maestro` (dark) e `/portale/login` (chiaro invariato) |
| Fix P1 volontariato/retribuito | ✅ | "Ruolo volontario" live in produzione (verificato via curl) |
| Fix P1 mailto precompilato | ✅ | Subject/body precompilati in `CtaContattaci.tsx` |
| Fix P2 nav link "Diventa Maestro" | ✅ | Presente in nav su tutte le pagine pubbliche (verificato via curl) |
| Nessuna modifica a contenuto/logica fuori scope | ✅ | `ConsentProvider`, API `/api/contatti`, `getSiteSettings` non toccati |

---

### B. Convenzioni progetto (AGENTS.md)

✅ **Rispettate:**
- Pattern pagina identico alle altre già migrate (`data-livery`+`Grain`+JSON-LD)
- `@/components/ui/form`, `@/components/ui/dialog`, `@/components/ui/button` (condivisi col portale) **non modificati** — solo override via `className` (tailwind-merge), verificato dai subagenti leggendo il sorgente di `cn()`
- Convenzioni git rispettate: 17 commit atomici, Conventional Commits scope EVO-044, squash merge

⚠️ **Attenzione (non bloccante, annotato durante l'implementazione):**
- `.apex-eyebrow` è CSS unlayered con `color: var(--stage-muted)` proprio: le utility `text-accent`/`text-accent-2` aggiunte sopra non hanno effetto — comportamento **identico a tutte le altre pagine APEX già live** (non una regressione introdotta qui, non corretto per non alterare l'estetica già approvata del resto del sito).
- Bug pre-esistente (non introdotto da questa PR, verificato anche sulla versione precedente in produzione) risolto durante questa evolutiva: overflow orizzontale mobile su `/contatti` (`grid-cols-1` esplicito aggiunto).

❌ **Violazioni:** nessuna trovata.

---

### C. Design system (DS APEX)

✅ **Rispettate:**
- Riuso puro di componenti/token APEX esistenti (`SectionHead`, `ApexCard`-style, `Grain`, propkit scuola)
- Fix `variant="h2"` sui titoli lunghi di `/diventa-maestro` (la variante `display` di default era sovradimensionata per frasi descrittive di 11-13 parole) — coerente con l'intento documentato del componente ("h2 = quieto/utility")
- Nessun side-stripe border, nessun nuovo token introdotto
- Cookie banner/modal: regole GDPR anti-dark-pattern preservate 1:1 su entrambi i temi (pari prominenza Accetta/Rifiuta, banner non bloccante, X/Escape=cancel)

⚠️ **Attenzione:** nessuna.

❌ **Violazioni:** nessuna trovata.

---

### Sintesi

**Score**: 8/8 requisiti funzionali ✅ · 0 violazioni convenzioni · 0 violazioni design system.

**Azioni richieste prima del commit**: nessuna (già mergeato, verificato post-deploy).

**Azioni consigliate (non bloccanti, fuori scope EVO-044)**:
1. Corpo pagina `/diventa-maestro` resta esile per un "manifesto" (2 requisiti, 3 card TI2, 2 pillole) — decisione di contenuto lasciata al titolare, annotata in fase 6 come follow-up.
2. Valutare se estendere il pattern theme-aware (per-path) ad altri componenti condivisi pubblico/portale, se ne emergeranno in futuro.
