# EVO-037 — Restyle APEX parte pubblica (ombrello)

> **Stato**: ombrello aperto · 2026-07-12
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
| EVO-0XX | /marathon-209 (livrea marathon, migrazione `.theme-209` → `[data-livery="marathon"]`, altimetria da GPX reale — **serve il GPX da Luca**) | da pianificare |
| EVO-0XX | /diventa-maestro + /contatti + legali | da pianificare |

Nota: **EVO-040** (migrazione Cloudinary, chiusa) NON è figlia di questo ombrello — è un'evolutiva infrastrutturale indipendente, nata da un incidente (quota Cloudinary esaurita) scoperto durante lo smoke di EVO-039.

L'ombrello resta aperto finché tutte le figlie non sono chiuse.

## Log

### [2026-07-13] EVO-042 chiusa (3ª figlia: /chi-siamo + /gli-amatori-triono)
Migrazione delle 2 pagine allo stage scuro APEX livrea Racing, con espansione mirata (sezioni nuove `CosaSiamoOggi` su chi-siamo, `DoveQuando` su amatori, entrambe cross-link/logistica su fatti reali, no claim inventati). PR #107 squash `e579f1b`, live. Restano da pianificare: /marathon-209 (serve GPX) e /diventa-maestro+/contatti+legali.

### [2026-07-12] Apertura ombrello
Concept e DS v2 progettati in Cowork (HANDOFF-APEX) e Claude Design (bundle apex-velodromo-notturno). Gap analysis asset completata (PIANO-ASSET.md). Prima figlia EVO-038 avviata.
