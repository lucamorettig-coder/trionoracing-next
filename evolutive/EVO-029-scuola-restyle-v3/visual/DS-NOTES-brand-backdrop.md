# DS — Nuova modalità sfondo "Brand Backdrop" (EVO-029)

Output `design:design-system` (extend). Pattern net-new del progetto.

## Problema
Il mockup v3 introduce uno sfondo animato di forme geometriche del brand (three.js r128: tetraedri/ottaedri/icosaedri/tori/coni che ruotano e fluttuano, + parallax mouse, + variante wireframe sulla CTA). Va portato in produzione su una landing **conversion-critical** senza il costo di three.js/GSAP.

## Tecnica scelta: SVG inline + CSS keyframes, ZERO JS
Confronto:
| Tecnica | Peso | CLS/INP | reduced-motion | 3D look | Verdetto |
|---|---|---|---|---|---|
| three.js (mockup) | ~150kb gz + WebGL | rischio INP | manuale | sì | ❌ troppo pesante |
| Canvas 2D + rAF | ~0kb dep, JS main-thread | INP/batteria, serve pausa visibilità | manuale | parziale | ⚠️ ok ma JS inutile |
| **SVG + CSS keyframes** | **0 JS** | **impossibili (transform GPU)** | **1 media query** | 2D (drift+rotate) | ✅ **scelto** |
| CSS puro (no SVG) | 0 JS | ok | ok | scarso | forme povere |

**Conseguenze positive**: `BrandBackdrop` resta **Server Component** (niente `"use client"`); nessun layout shift (layer `fixed`/`absolute`); si animano **solo** `transform`/`opacity` (mai width/height/top/left); le animazioni CSS sono auto-throttlate dal browser quando off-screen/tab nascosta (niente listener `visibilitychange`). **Parallax mouse rimosso** di proposito (lezione `NINO.md` §12).

## API componente
`src/components/ui/brand-backdrop.tsx` (Server Component)
| Prop | Tipo | Default | Descrizione |
|---|---|---|---|
| `variant` | `"page" \| "cta"` | `"page"` | page = layer pagina sottile; cta = denso/wireframe per card scura |
| `className` | `string` | — | posizionamento contenitore (es. `fixed inset-0` o `absolute inset-0`) |

Rende `<div aria-hidden className="brand-backdrop brand-backdrop--{variant} {className}">` con N forme SVG inline (`<svg class="bd-shape bd-shape--a">` …) — poligoni/anelli/triangoli che richiamano il motivo "confetti" del kit. `pointer-events-none` sempre.

## CSS (in `globals.css`)
- `.brand-backdrop{position:absolute;inset:0;overflow:hidden;pointer-events:none}` (il consumer aggiunge `fixed` per la pagina).
- `.bd-shape{position:absolute;will-change:transform;opacity:var(--bd-op)}` + posizioni/scale per indice.
- Keyframes `bd-float-a..d`: combinazioni di `translate3d(...)` + `rotate(...)` lente (durate 18–40s, `ease-in-out`, `alternate`/`infinite`), delay sfalsati → moto organico.
- `@media (prefers-reduced-motion: reduce){ .bd-shape{ animation:none !important } }` → forme ferme nello stato finale (decorative, nessun flash).
- **Mobile**: `@media (max-width:640px)` nasconde ~metà delle forme (`.bd-shape--e,…{display:none}`) per alleggerire.

### Variante `page`
- Forme **navy** (`--color-navy-500/600/700/300`), `--bd-op: .05–.08` (sottile, **non** deve ridurre il contrasto del testo — WCAG). Filled. Layer `fixed inset-0 z-0` montato a livello pagina; contenuto `z-[1]`.

### Variante `cta`
- Forme **wireframe** (`fill:none;stroke`), accenti `sky-500`/`sun-500`/navy chiaro, `--bd-op: .4–.5`. `absolute inset-0` **dentro** la card CTA navy-900 (sostituisce il `#cta3d` del mockup). Più dense.

## Linee guida d'uso
- **Quando**: sfondo di pagina su landing editoriali ricche (es. `/la-scuola`); variante cta su card CTA scure. NON su pagine dense di dati / portale.
- **Convivenza con utility esistenti**: il backdrop sta **dietro**. Le sezioni che lo devono rivelare usano `bg-transparent` o band translucide (`bg-bg-soft/70` con `backdrop-blur` leggero se serve leggibilità); le sezioni che lo coprono usano i soliti bg opachi (`.photo-bg-navy`, card bianche, `.pattern-*`). **Non** mettere `.brand-backdrop` sullo stesso elemento di `.pattern-*`/`.photo-bg-*` (si occluderebbero). Una sola istanza `page` per pagina.
- **Ritmo**: mantenere lo "stacco di sfondo" (CLAUDE.md) alternando sezioni che rivelano il backdrop e sezioni a banda piena.
- **Accessibilità**: `aria-hidden`, `pointer-events-none`, decorativo; reduced-motion → statico.
- **Perf/CWV**: non è LCP; nessun reflow; solo transform/opacity animati; cap forme (≤14 page, ≤10 cta); ridotte su mobile.

## Token
Nessun nuovo token colore necessario (navy/sky/sun esistenti). Il gap `sun 200/300/400` è irrilevante qui (si usa `sun-500` a bassa opacità). Eventuali durate animazione restano inline nelle keyframes (no token motion dedicati per ora).

## Documentazione DS
Aggiungere una voce "Brand Backdrop" alla sezione sfondi del DS (commento in `globals.css` accanto a `.pattern-*`/`.photo-bg-*` + questa nota). Promuovere a pattern stabile dopo la 1ª istanza in produzione (regola EVO-012/022).
