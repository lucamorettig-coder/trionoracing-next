# APEX — Velodromo Notturno
### Design System v2 · Triono Racing · Parte pubblica

> La regia broadcast notturna di una gara su pista. **Un solo telaio, quattro livree.**
> Dark-first, telemetria come chrome, tipografia monumentale, palco a 5 livelli di profondità.
>
> **Scope:** solo parte pubblica (7 pagine + 3 legali). L'area riservata `/portale` resta sul
> DS v0.1 chiaro. Questo documento è la **spec di sistema**, non le pagine finali.

**Deliverable del set**
- `apex-tokens.css` — token semantici per Tailwind v4 (telaio + 4 livree + z-scale + motion).
- `DS-APEX.md` — questo documento.
- `apex-showcase.html` — showcase interattivo self-contained (palco dal vivo, switcher, tutti i componenti e gli elementi firma CODE).

---

## 1 · Principi

1. **La gara è il chrome.** Telemetria, ticker, HUD, countdown non sono decorazione: sono l'interfaccia. Il dato è cittadino di prima classe.
2. **Un telaio, quattro verniciature.** Il *telaio* (superfici, tipografia, geometria, z-scale, motion) è immutabile. Ogni *anima* del brand è una **livrea**: cambia solo `--accent`, `--accent-2`, `--glow`, `--selection` e la temperatura duotone.
3. **I componenti sono ciechi ai colori.** Nessun componente conosce un hex di livrea. Usano solo token semantici. → *Nuovo evento = ~10 righe di CSS.*
4. **Il palco ha profondità.** 5 livelli z. L0 (la pista, il contenuto) è **sacro**: mai coperto.
5. **Il buio respira.** Budget di densità severo. Un solo elemento dominante per livello, per sezione.
6. **Serio, race, broadcast.** Zero folklore, zero decorativismo da sagra. La Scuola è calda e giocosa *dentro* questa estetica (mascotte, sticker), mai fuori.
7. **Il brand padre firma tutto.** NavBar e Footer sono **sempre** in livrea Racing.

---

## 2 · Token — Telaio (immutabile)

Definiti in `:root`. Nessuna livrea li tocca. **Anti-pattern vietato** (il vecchio `.theme-209`): rimappare la scala navy dentro una livrea. Il navy è telaio.

### 2.1 Superfici
| Token | Valore | Uso |
|---|---|---|
| `--stage-bg` | `#030818` | Fondo palco globale (L−2) |
| `--stage-navy` | `#050E3F` | Navy deep — continuità brand, superfici rialzate |
| `--stage-surface` | `#0A1230` | Card / pannelli |
| `--stage-surface-2` | `#0E1838` | Secondo livello di superficie |
| `--stage-line` / `--stage-line-soft` | `#1B2650` / `#131C40` | Bordi / hairline |

### 2.2 Inchiostro
| Token | Valore | Uso |
|---|---|---|
| `--stage-ink` | `#EAF0FF` | Testo primario |
| `--stage-ink-dim` | `#B7C0E0` | Corpo attenuato |
| `--stage-muted` | `#8A94B8` | Secondario / didascalie / label off |
| `--stage-faint` | `#4A5480` | Ghost, disabilitati, tracce |

### 2.3 Tipografia
- **`--font-display` = Archivo** (variable, `font-stretch: 125%`, wght 800–900). Headline **sempre uppercase**, tracking negativo. Parole-chiave in `-webkit-text-stroke: 2px var(--accent)` (classe `.stroke-word`).
- **`--font-body` = Inter** (continuità DS v0.1).
- **`--font-data` = JetBrains Mono** — telemetria, eyebrow, label, badge. 11px, `letter-spacing: .14–.18em`, uppercase.

**Scala fluida** (`clamp`): `--fs-hero` (numeroni broadcast) → `--fs-display` (titolo sezione) → `--fs-h1…h6` → `--fs-body-lg / body / small` → `--fs-data` (11px) / `--fs-data-sm` (10px). Line-height: hero `.9`, display `.94`, heading `1.02`, body `1.6`, data `1.3`.

> **Scale minime:** mai testo sotto 14px sullo stage tranne i mono-label (11px / 10px) che vivono a `weight ≥600` e tracking largo per compensare.

### 2.4 Geometria
- **`--radius: 0`** — niente raggi, mai.
- **`--clip-cta`** = `polygon(0 0,100% 0,94% 100%,0 100%)` — CTA angolata. Varianti `--clip-cta-l`, `--clip-tag`, `--clip-panel`.

### 2.5 Spacing & guscio
Scala `--space-1…9`. `--gutter` (padding orizzontale pagina, fluido), `--section-y` / `--section-y-lg` (respiro verticale sezione), `--maxw: 1320px`, `--maxw-prose: 64ch`.

### 2.6 Scala Z del palco
`--z-fondale: 0` · `--z-scenografia: 10` · `--z-pista: 20` · `--z-oggetti: 30` · `--z-regia: 40`.

### 2.7 Ombre di profondità
**Più l'oggetto è avanti, più l'ombra è netta e vicina** (offset e blur piccoli, opacità alta); più è dietro, più è grande e diffusa.

| Token | Valore | Livello |
|---|---|---|
| `--shadow-scenografia` | `0 60px 160px rgba(0,0,0,.45)` | L−1 lontano, diffuso |
| `--shadow-pista` | `0 30px 70px rgba(0,0,0,.50)` | L0 |
| `--shadow-oggetti` | `0 16px 36px rgba(0,0,0,.62)` | L+1 più netto |
| `--shadow-regia` | `0 4px 14px rgba(0,0,0,.72)` | L+2 vicino, tagliente |
| `--shadow-glow` | alone `--glow` | hover / luci |

### 2.8 Floodlight & grain
`--floodlight` (gradiente radiale multi-stop con tinta `--accent` al 12%). Grain SVG `feTurbulence`, `--grain-opacity: .05`, `fixed`, animato `steps()`. Sempre presente, sopra il fondale.

---

## 3 · Token — Livree

Implementazione: **scope `[data-livery="…"]`** sul wrapper di pagina/sezione. Rimappa **solo** i token semantici. Regola: **1 accento + 1 supporto per livrea, mai palette complete.**

| Livrea | Scope | `--accent` | `--accent-2` | Duotone | Voce |
|---|---|---|---|---|---|
| **Racing** *(default)* | `racing` | `#37C8FF` ciano | `#F4E718` giallo | Navy freddo | Tecnica: dati, gare, orgoglio di maglia |
| **Scuola** | `scuola` | `#F4E718` giallo | `#FF8A3D` arancio | Ambra caldo | Calda: genitori, sicurezza |
| **Marathon 209** | `marathon` | `#EF4444` rosso | `#FACC15` giallo | Rosso | Epica: il numero, la leggenda |
| **Ciclocross** *(futura)* | `ciclocross` | `#EAF4FF` ghiaccio | `#7FB2FF` azzurro | Blu-ghiaccio | Invernale, grintosa |

**Derivati per livrea:** `--glow` (hover/luci), `--selection`, `--duotone`. Ricetta duotone foto: `grayscale(1)` + overlay `color-mix(in srgb, var(--accent) 15%, transparent)` + `--vignette` navy.

**Governance livree**
- Il telaio non si tocca. Solo token semantici.
- Il rosso semantico d'errore va **evitato** nelle pagine 209 (conflitto col rosso di livrea).
- Ogni accento livrea non si riusa come colore semantico altrove.
- **Ciclocross** è definita nei token e nello switcher ma **non ha asset né pagina**: è la prova che un nuovo evento costa ~10 righe di CSS.

---

## 4 · Il palco a 5 livelli

| Livello | Nome | Contenuto | Movimento | Regole |
|---|---|---|---|---|
| **L−2** (z 0) | Fondale | Stage dark + floodlight + grain + video ambient | Fisso | Video: §7 |
| **L−1** (z 10) | Scenografia | Numeroni ghost, waveform, silhouette, altimetrie, slash | Parallax `--par-scenografia` (0.22×) | Max 1 dominante/sezione |
| **L0** (z 20) | Pista | Testo, card, CTA, foto | Scroll naturale | **SACRO: mai coperto** |
| **L+1** (z 30) | Oggetti di scena | Cutout, mascotte, sticker, props | Parallax `--par-oggetti` (1.22×) + mouse `--par-mouse-oggetti` + float | Max 2–3/viewport; overlap solo su bordi card/foto ≤20%, mai su testo/CTA |
| **L+2** (z 40) | Regia | HUD, ticker, countdown, progress | Fixed/sticky | Chrome broadcast, sempre sopra |

**Regole del palco**
- **Budget di densità:** il buio deve respirare.
- **Zona di rispetto tipografica:** ≥ 1 riga attorno alla headline; nessun prop la tocca.
- **Velocità parallax = token di livello, non per elemento** (`--par-*`).
- **Props decorativi** `aria-hidden="true"`. Se un elemento veicola informazione, la versione informativa vive a L0.
- **Mobile <768px:** 1 solo prop L+1 per sezione · niente mouse-parallax · L−1 ridotto al dominante.

---

## 5 · Motion spec

Solo `transform` e `opacity`. `will-change` con parsimonia. Tutto disattivato sotto `prefers-reduced-motion` (i token durata → `1ms`, parallax → 0, video → poster).

| Elemento | Trigger | Animazione | Durata / easing |
|---|---|---|---|
| Switch livrea | route/scope | Transizione token colore | `--dur-switch` 500ms ease |
| Props L+1 | scroll/mouse | Parallax lerp; float | float `--dur-float` 5.5s ease-in-out |
| Headline | in-view | Reveal staggered per parola | `--dur-reveal` 600ms `--ease-stage` |
| Ticker | continuo | Marquee CSS seamless (doppio chunk) | `--dur-ticker` ~30s linear |
| HUD | continuo | Random-walk clampato | tick 1–2s |
| Doodle Scuola | in-view | Stroke draw | `--dur-draw` 3.2s |
| Glitch 209 | raro (8–12s) | Slice orizzontale | `--dur-glitch` <200ms |
| Hover CTA | hover | Glow + micro-translate | `--dur-hover` 200ms |

**`useStageParallax`** — un unico modulo (JS vanilla nello showcase / hook React in prod) che governa scroll + pointer con **lerp** (`--lerp` 0.08) e un **kill-switch globale**. Il repo oggi è CSS-only: questa è l'unica novità JS e va isolata e spegnibile (vedi dock dello showcase). Su reduced-motion / mobile il modulo non applica trasformazioni.

---

## 6 · I 9 componenti

Per ognuno: **anatomia · props · varianti per livrea · stati · mobile & reduced-motion.** Tutti usano solo token semantici.

### 6.1 StageProp
Wrapper posizionabile per qualunque oggetto di scena.
- **Props:** `level` (−2…+2 → z), `parallax` (token velocità del livello), `anchor` (top/right/bottom/left), `children`.
- **Default:** `position: absolute`, `pointer-events: none`, `aria-hidden="true"`.
- **Varianti livrea:** nessuna propria; ospita i PropKit.
- **Mobile:** attributo `data-mobile="hide"` → nascosto quando serve rientrare nel budget.

### 6.2 PropKit *(registry)*
Registry `livrea → 4 elementi firma con varianti`. **Le pagine compongono dal registry, non inventano.** Elementi `CODE` = SVG/CSS parametrici su `--accent` (§7); gli altri sono asset. Cambia col solo swap di livrea.

### 6.3 Ticker
- **Anatomia:** marquee mono infinito seamless a **doppio chunk** (il track è largo il doppio, anima a `translateX(-50%)`).
- **Props:** `items[]` (`{ label, value }`), `velocità` (`--dur-ticker`).
- **Livrea:** contenuti e `--accent` sul `value`.
- **Stati:** continuo; fermo sotto reduced-motion (leggibile da fermo).
- **A11y:** `aria-hidden` (ridondante) oppure `role="marquee"` consapevole.

### 6.4 HUD
- **Anatomia:** griglia di celle mono; ogni cella = label + valore tabular-nums + unità in `--accent`; dot **LIVE** pulsante.
- **Props:** `metriche[]` (`{ key, value, unit, min, max }`).
- **Comportamento:** random-walk **clampato** entro `[min,max]`, tick 1–2s.
- **Stati:** LIVE (pulse) / statico (reduced-motion).
- **A11y:** `aria-hidden`; il dato reale, se rilevante, è a L0.

### 6.5 SectionLap
- **Anatomia:** eyebrow `LAP 0N` + riga luminosa + label; sotto, titolo display.
- **Props:** `numero`, `label`.
- **Uso:** struttura sezioni ("LAP 01 — CHI SIAMO"). Il numero è mono `--accent`.

### 6.6 Countdown
- **Anatomia:** unità (giorni/ore/min/sec) in display 900 tabular-nums, separatori `:` in `--accent`.
- **Props:** `target` (data).
- **Uso:** Marathon / eventi. Degrada a `00:00:00:00` senza JS.

### 6.7 FondaleVivo
Incapsula **tutte** le regole del §7 sul video L−2.
- **Props:** `src`, `poster`.
- **Trattamento obbligatorio:** `grayscale` + tinta `--accent` ~15% + `--vignette` navy + `opacity ≤ .4` + `scale(1.05)`. Ambient 10–20s loop, niente volti protagonisti, **mai audio**. `autoplay muted loop playsinline` + poster; max 1/viewport; lazy al viewport.
- **Degrada:** reduced-motion / save-data / no-asset → **solo poster** (o gradiente simulato).
- **Regola:** il video **mai** senza trattamento duotone.

### 6.8 CTA
- **Anatomia:** label mono uppercase + arrow; `clip-path: var(--clip-cta)` (angolo netto).
- **Varianti:** `--primary` (fill `--accent`, testo ink scuro), `--support` (fill `--accent-2`), `--ghost` (bordo `--accent`).
- **Stati:** default · **hover** (glow `--glow` + `translateY(-2px)`, arrow +4px) · focus-visible (anello `--accent`) · disabled (superficie muta, `pointer-events:none`).
- **Regola:** truncation **mai** sulle CTA.

### 6.9 Card APEX
- **Anatomia:** superficie `--stage-surface`, bordo hairline, barretta accento in alto, `radius 0`.
- **Varianti:** base · `--photo` (foto duotone in testa) · per-livrea via accento.
- **Stati:** default · hover (`translateY(-4px)` + bordo accent + glow) · focus-visible.

---

## 7 · Elementi firma per livrea

Marcati **CODE** = SVG/CSS parametrici su `--accent`, parte del DS (li disegniamo noi, riusabili). Gli altri sono asset (cutout, mascotte); nello showcase → placeholder/asset reali.

**Racing** — velocità misurata, luce fredda
- **R1** Cutout atleta + **eco-scia** *(asset + CODE)*: 2 duplicati monocromi accent sfalsati via `filter`.
- **R2** Telemetria ghost *(CODE, L−1)*: numeroni outline mono giganti (`312W`, `54 KM/H`) + waveform SVG animata.
- **R3** Targa dorsale *(CODE, L+1)*: rettangolo bianco angolato, numero nero, micro-testo "TRIONO RACING". Firma card e ritratti.
- **R4** Racing line *(CODE, L−1/L+1)*: traiettoria SVG stroke accent con punto di corda pulsante.

**Scuola** — mascotte Nino & Vittoria (**mai** foto di bambini, **mai** bambini generati)
- **S1 / S3 / S4** *(asset)*: pose singole, duo/scenette, video alpha. Max 1 video/pagina, reduced-motion → poster.
- **S2** Cartoleria *(CODE + grafica)*: **sticker** (bordo bianco adesivo), **toppa** (testo ruotato di qualche grado), **doodle** SVG a pastello con `stroke-draw`. Sistema parametrico su `--accent`/`--accent-2`.
- **Regole:** max 2 mascotte/viewport · solo nella livrea Scuola · mai sopra il testo · float lento.

**Marathon 209** — polvere e calore, monumentale orizzontale
- **M1** Numerone 209 monolite *(CODE, L−1)*: outline gigante, glitch-slice raro (8–12s, <200ms), buca i confini di sezione.
- **M2** Altimetria race-data *(CODE, L−1)*: profilo SVG con km marker mono e un solo picco quotato ("KM 141 · 890M"). Dati fittizi finché non arriva il GPX.
- **M3** Slash diagonali *(CODE)*: 2–3 barre rosse ~−18°, bordi netti, una con grain.
- **M4** Sequenza d'azione *(asset + CODE)*: 2 echi monocromi a opacità decrescente + frame pieno.

**Ciclocross dei Pini** — fango e freddo, notturno floodlight *(solo token + 1 elemento dimostrativo)*
- **C1** pini nella nebbia *(CODE, accennato)* · C2 traccia pneumatico *(CODE)* · C3 portage / C4 planches *(asset)*.

**Regia della differenza 209 ↔ CX:** polvere/fango · caldo/freddo · sole di giugno/notturno floodlight · orizzontale/verticale · rosso su nero/ghiaccio su navy.

---

## 8 · Accessibilità

### 8.1 Contrasto per livrea — **verificato su `#030818`**
Ratio WCAG ricalcolati (non stimati). Testo su superficie accent → **sempre ink scuro** `#04091c`.

| Accento | Ratio vs `#030818` | Small text (AA 4.5) | Regola d'uso |
|---|---|---|---|
| Giallo `#F4E718` | **15.5 : 1** | AA + AAA ✓ | Testo piccolo consentito. |
| Ghiaccio `#EAF4FF` | **17.4 : 1** | AA + AAA ✓ | Testo piccolo consentito. |
| Ciano `#37C8FF` | **10.3 : 1** | AA + AAA ✓ | OK anche small; per data-label ≤11px usare **weight ≥500** (leggibilità della hue satura, non contrasto). |
| Rosso `#EF4444` | **5.3 : 1** | AA ✓ · **AAA ✗** | Il più debole. Body a lungo respiro → usare **ink**; rosso per titoli/accenti **≥18px** o **≥14px bold**. Mai come rosso-errore nelle pagine 209. |

> **Nota rispetto all'assunzione iniziale** (ciano e rosso "solo large/bold"): il ricalcolo mostra che **ciano passa AA/AAA anche small** (10.3:1) e **rosso passa AA small** (5.3:1) ma non AAA. La soglia reale da presidiare è il **rosso**: è l'unico che merita la regola ≥18px / ≥14px bold per il testo funzionale.

### 8.2 Altre regole
- **focus-visible** = anello `--accent`, offset 3px. **Ordine di focus = DOM (L0)**, mai i livelli visivi.
- **HUD / ticker:** `aria-hidden` (contenuto ridondante) o `role="marquee"` consapevole.
- **Headline Archivo expanded:** testare con testi lunghi reali (es. "Ciclocross dei Pini · Winter Series"); truncation **mai** sulle CTA.
- **No-JS / JS lento:** il palco degrada a statico, props in posizione finale.
- **Performance:** props webp <150KB, `loading="lazy"` sotto la piega, **nessun layout shift** (posizionamento `absolute`).

---

## 9 · Matrice di degradazione

| Contesto | Comportamento |
|---|---|
| **Mobile <768px** | 1 solo prop L+1 per sezione · niente mouse-parallax · L−1 ridotto al dominante. |
| **prefers-reduced-motion** | Tutto presente, statico. Durate → 1ms, parallax → 0, video → poster, float/pulse/ticker fermi. |
| **No-JS / JS lento** | Palco statico: props in posizione finale, reveal già visibili (stato nascosto gated dietro `.js`), HUD/ticker fermi ma leggibili, countdown a `00`. |
| **Asset mancante** | FondaleVivo → poster/gradiente · cutout → silhouette · mascotte → assente senza gap · nessun CLS. |

---

## 10 · Governance & traducibilità

- **Immutabilità del telaio:** ogni modifica ai token `:root` è un cambio di sistema, non di pagina.
- **Zero CSS per-livrea nei componenti:** se un componente ha bisogno di conoscere una livrea, è un bug di design.
- **Traducibilità React + Tailwind v4:** markup e classi dello showcase sono trasportabili 1:1. In produzione i componenti diventano React; `apex-tokens.css` si importa in `globals.css` dopo `@import "tailwindcss"` e i token si espongono a `@theme inline` dove servono come utility.
- **Il JS è un'eccezione isolata:** solo `useStageParallax`, spegnibile globalmente. Il resto resta CSS-first.

---

## 11 · Criteri di accettazione (checklist)

- [x] Lo switcher livree cambia carattere completo di hero/HUD/ticker/card col **solo swap delle variabili** — zero CSS per-livrea nei componenti.
- [x] **L0 sempre leggibile:** nessun prop copre testo/CTA in nessuna variante.
- [x] Tutti gli elementi **CODE** (R2, R3, R4, eco-scia, cartoleria S2, M1, M2, M3, meccanica M4, C1) presenti come SVG/CSS parametrici su `--accent`.
- [x] Tabella contrasti per livrea completa, con soglie esplicite per ciano e rosso.
- [x] `apex-tokens.css` importabile in Tailwind v4 senza modifiche; showcase apribile da file senza build.
- [x] Con `prefers-reduced-motion` emulato, lo showcase resta completo e comprensibile da fermo.
