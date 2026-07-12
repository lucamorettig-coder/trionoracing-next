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
| EVO-038 | **Fondazione DS v2** (token, 9 componenti, propkit Racing/209 minimal, chrome ApexNavBar/ApexFooter) + **Home** | in implementazione |
| EVO-0XX | /la-scuola (livrea Scuola, mascotte, cartoleria S2) | da pianificare |
| EVO-0XX | /marathon-209 (livrea marathon, migrazione .theme-209, altimetria da GPX) | da pianificare |
| EVO-0XX | /chi-siamo + /gli-amatori-triono | da pianificare |
| EVO-0XX | /diventa-maestro + /contatti + legali | da pianificare |

L'ombrello resta aperto finché tutte le figlie non sono chiuse.

## Log

### [2026-07-12] Apertura ombrello
Concept e DS v2 progettati in Cowork (HANDOFF-APEX) e Claude Design (bundle apex-velodromo-notturno). Gap analysis asset completata (PIANO-ASSET.md). Prima figlia EVO-038 avviata.
