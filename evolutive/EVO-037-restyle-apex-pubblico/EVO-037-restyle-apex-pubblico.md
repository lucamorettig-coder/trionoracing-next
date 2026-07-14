# EVO-037 — Restyle APEX parte pubblica (ombrello)

> **Stato**: ✅ CHIUSO · aperto 2026-07-12 · chiuso 2026-07-14 — intero sito pubblico ora in APEX.
> **Concept**: APEX · Velodromo Notturno — regia broadcast notturna, dark-first, "un telaio quattro livree", palco a 5 livelli.
> **Fonti di verità design**: `~/Documents/Claude/Projects/Area Riservata Triono/restyle-pubblico/HANDOFF-APEX.md` (+ STUDIO-APEX-LIVREE, STUDIO-APEX-LIVELLI, PIANO-ASSET) e bundle Claude Design `evolutive/EVO-038-apex-foundation-home/design-handoff/` (DS-APEX.md + apex-tokens.css + apex-showcase.html).

## Strategia

Il restyle si implementa **pagina per pagina** in sotto-evolutive figlie. Decisioni chiuse:

- **Chrome APEX subito ovunque**: NavBar+Footer dark (livrea Racing) su tutte le pagine pubbliche dalla prima figlia (EVO-038). Un solo chrome; le pagine chiare non migrate convivono col chrome dark finché non tocca a loro.
- **Portale escluso**: `/portale` resta su DS v0.1 chiaro. I token APEX sono scoped `[data-stage]` sul layout pubblico.
- **Livrea Ciclocross**: solo token (pagina inesistente).
- **`.theme-209` → `[data-livery="marathon"]`**: migrazione nell'evolutiva della pagina marathon-209, non prima.
- **Asset**: gap analysis in PIANO-ASSET.md — unica produzione nuova = cartoleria Scuola S2; cutout fal.ai esistenti da ottimizzare webp <150KB; GPX 209 da procurare (input Luca).

## Sotto-evolutive figlie

| ID | Pagine / scope | Stato |
|---|---|---|
| EVO-038 | **Fondazione DS v2** (token, 9 componenti, propkit Racing/209 minimal, chrome ApexNavBar/ApexFooter) + **Home** | ✅ chiusa — live |
| EVO-039 | **/la-scuola** (livrea Scuola, mascotte, cartoleria S2 doodle) | ✅ chiusa — live |
| EVO-041 | Rifiniture /la-scuola (2 round fix post-feedback: hero, card, cover, band) | ✅ chiusa — live |
| EVO-042 | **/chi-siamo + /gli-amatori-triono** (livrea Racing, + 2 sezioni nuove CosaSiamoOggi/DoveQuando) | ✅ chiusa — live |
| EVO-043 | **/marathon-209** (livrea marathon, migrazione `.theme-209` → `[data-livery="marathon"]`, nuovo `AltimetriaProfile` con profilo stilizzato — no GPX disponibile, numeri reali Airtable) | ✅ chiusa — live |
| EVO-044 | **/diventa-maestro + /contatti + legali + cookie banner** (livrea Scuola per diventa-maestro, Racing neutra per contatti/legali; nuovo `ApexLegalSection`/`ApexLegalTable`; cookie banner theme-aware per path) | ✅ chiusa — live |

Nota: **EVO-040** (migrazione Cloudinary, chiusa) NON è figlia di questo ombrello — è un'evolutiva infrastrutturale indipendente, nata da un incidente (quota Cloudinary esaurita) scoperto durante lo smoke di EVO-039.

**Tutte le figlie sono chiuse — ombrello chiuso il 2026-07-14.** L'intero sito pubblico è ora sul DS APEX; resta fuori scope solo `/portale` (DS v0.1 chiaro, per scelta esplicita di strategia).

## Log

### [2026-07-14] EVO-044 chiusa (5ª e ultima figlia: /diventa-maestro + /contatti + legali + cookie banner) — OMBRELLO CHIUSO
Migrazione delle ultime pagine pubbliche rimaste sul DS legacy: `/diventa-maestro` (livrea Scuola, mascotte Nino/Vittoria invariate), `/contatti` (livrea Racing, form invariato), 3 pagine legali (nuovo componente condiviso `ApexLegalSection`/`ApexLegalTable`, testo legale verificato invariato via diff), e il sistema di cookie consent reso **theme-aware per path** (dark APEX sul pubblico, DS v0.1 chiaro invariato su `/portale/*`, dato che è montato nel root layout condiviso). Un `/impeccable critique` su `/diventa-maestro` (score 31/40) ha trovato — oltre al disallineamento atteso — un'ambiguità di contenuto reale (ruolo Maestro volontario o retribuito?, chiarito dall'utente: volontario) e una mancanza di via di conversione a bassa frizione (fix: mailto precompilato). Un bug **pre-esistente** di overflow mobile su `/contatti` (verificato anche sulla versione precedente in produzione) è stato scoperto e risolto durante lo smoke test. PR #110 squash `207d1cf`, live. Con questa chiusura **l'intero sito pubblico di trionoracing.it è in APEX**.

### [2026-07-14] EVO-043 chiusa (4ª figlia: /marathon-209)
Migrazione della pagina evento dal DS legacy `.theme-209` allo stage scuro APEX livrea marathon. Nessun GPX reale (input mai arrivato, l'utente ha indicato di usare solo i dati già su Airtable): nuovo componente `AltimetriaProfile` con profilo SVG stilizzato + numeri reali sovrapposti. Un `/impeccable critique` sulla pagina live ha scoperto 2 bug P0 di contenuto (badge/CTA "pre-evento" su una gara già conclusa), fissati nella stessa evolutiva. PR #108 squash `c60e037`, live. Resta da pianificare solo /diventa-maestro+/contatti+legali.

### [2026-07-13] EVO-042 chiusa (3ª figlia: /chi-siamo + /gli-amatori-triono)
Migrazione delle 2 pagine allo stage scuro APEX livrea Racing, con espansione mirata (sezioni nuove `CosaSiamoOggi` su chi-siamo, `DoveQuando` su amatori, entrambe cross-link/logistica su fatti reali, no claim inventati). PR #107 squash `e579f1b`, live. Restano da pianificare: /marathon-209 (serve GPX) e /diventa-maestro+/contatti+legali.

### [2026-07-12] Apertura ombrello
Concept e DS v2 progettati in Cowork (HANDOFF-APEX) e Claude Design (bundle apex-velodromo-notturno). Gap analysis asset completata (PIANO-ASSET.md). Prima figlia EVO-038 avviata.
