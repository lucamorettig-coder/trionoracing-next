# Triono Racing — Design System

> Versione 0.1 · Foundation · maggio 2026  
> Stack target: Next.js 15 (App Router) · Tailwind v4 · shadcn/ui · TypeScript

---

## 1. Brand principles

Cinque principi guida che precedono ogni decisione visiva.

| # | Principio | Significato |
|---|---|---|
| 01 | **Ariosi, mai vuoti** | Whitespace generoso, ma ogni sezione ha un centro chiaro. Niente padding vuoto per riempire pagina. |
| 02 | **Energici, mai aggressivi** | Movimento, dinamismo, colori vivi a piccole dosi. Niente rosso strillato, niente Bebas, niente brutalismo. |
| 03 | **Caldi per i genitori** | Il pubblico primario è chi cerca una scuola sicura per i figli. Toni accoglienti, copy chiaro, mai gergo da gara. |
| 04 | **Tecnici per gli atleti** | Quando parliamo a amatori/agonisti il tono si fa più diretto, dati e numeri sono in primo piano (font mono opzionale). |
| 05 | **Una squadra, due voci** | Triono Racing è un brand padre. Scuola e Amatori condividono il sistema; cambia solo il volume del colore. La Marathon 209 è un evento ospite con un suo design system dedicato. |

---

## 2. Palette colori

8 colori brand → estesi in scale Tailwind. Tutti i valori sono pubblicati come CSS variables nel blocco `@theme` di Tailwind v4.

### 2.1 Token CSS (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  /* ============ NAVY (primario) ============ */
  --color-navy-50:  #EEF1F8;
  --color-navy-100: #D7DEED;
  --color-navy-200: #AFBCDA;
  --color-navy-300: #8298BF;
  --color-navy-400: #5572A2;
  --color-navy-500: #34528A;   /* Navy chiaro (palette top-left) */
  --color-navy-600: #1F3D75;
  --color-navy-700: #1F2D5A;   /* PRIMARIO brand */
  --color-navy-800: #11215A;
  --color-navy-900: #050E3F;   /* Hero scuri / "premium" */
  --color-navy-950: #020730;

  /* ============ SKY (secondario · blu chiaro) ============ */
  --color-sky-50:   #EEF6FD;
  --color-sky-100:  #D6EAFB;
  --color-sky-200:  #ADD4F7;
  --color-sky-300:  #7FB8EC;
  --color-sky-400:  #5099DE;
  --color-sky-500:  #3A82C8;   /* Accento / link */
  --color-sky-600:  #2A6BA9;
  --color-sky-700:  #225589;
  --color-sky-800:  #1B4470;
  --color-sky-900:  #14335A;

  /* ============ GRASS (success · verde) ============ */
  --color-grass-50:  #F0F8EB;
  --color-grass-100: #DAEFCD;
  --color-grass-500: #5FAC36;
  --color-grass-600: #4F932B;
  --color-grass-700: #3F7522;

  /* ============ EMBER (warning · arancione) ============ */
  --color-ember-50:  #FDF4E5;
  --color-ember-100: #FCE4BD;
  --color-ember-500: #E09618;
  --color-ember-600: #BC7E12;
  --color-ember-700: #8E5F0E;

  /* ============ FLAG (error · rosso) ============ */
  --color-flag-50:   #FBEAEA;
  --color-flag-100:  #F4C3C3;
  --color-flag-500:  #C01818;
  --color-flag-600:  #9D1414;
  --color-flag-700:  #791010;

  /* ============ SUN (accento Scuola · giallo) ============ */
  --color-sun-50:    #FFFCE4;
  --color-sun-100:   #FCF6AC;
  --color-sun-500:   #EFE63A;
  --color-sun-600:   #C3BB1E;
  --color-sun-700:   #8C8615;

  /* ============ NEUTRI (cool warm-tinted) ============ */
  --color-bg:        #FFFFFF;
  --color-bg-soft:   #FAFBFD;   /* sfondi alternati */
  --color-bg-muted:  #F2F4F9;   /* card sezione */
  --color-line:      #E4E7EF;   /* bordi */
  --color-line-soft: #EEF0F5;
  --color-ink-muted: #6B7388;
  --color-ink:       #14193A;   /* testo body */

  /* ============ RADIUS ============ */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 28px;
  --radius-pill: 9999px;

  /* ============ SHADOWS ============ */
  --shadow-xs:  0 1px 2px rgba(20, 25, 58, 0.04);
  --shadow-sm:  0 2px 6px rgba(20, 25, 58, 0.06), 0 1px 2px rgba(20, 25, 58, 0.04);
  --shadow-md:  0 8px 20px rgba(20, 25, 58, 0.08), 0 2px 6px rgba(20, 25, 58, 0.04);
  --shadow-lg:  0 20px 40px rgba(20, 25, 58, 0.10), 0 4px 12px rgba(20, 25, 58, 0.05);
  --shadow-hero: 0 40px 80px rgba(5, 14, 63, 0.18);
}
```

### 2.2 Uso dei colori

| Token | Uso |
|---|---|
| `navy-700` | **Primario brand.** Header background, footer, CTA primary fill, hero scuri standard. |
| `navy-900` | Variante "premium" per hero, sezioni con video ambient, sfondo per pattern. |
| `sky-500` | Link inline, accenti, evidenziazioni testuali, illustrazioni vettoriali. |
| `grass-500` | Stato success (iscrizione completata, pagamento OK, certificato medico valido). |
| `ember-500` | Warning (iscrizione in scadenza, certificato in scadenza). |
| `flag-500` | Error (errore form, certificato scaduto, gara annullata). |
| `sun-500` | Accento Scuola, puntuale. Highlight su parole chiave, badge "novità Scuola", decorazioni. |
| `bg`, `bg-soft`, `bg-muted` | Sfondi base alternati per sezioni. Mai grigio puro. |
| `ink` / `ink-muted` | Testo body e secondario su sfondo chiaro. |

**Contrasti AA garantiti:** `navy-700` su `bg` (16.4:1), `navy-900` su `bg` (18.8:1), `ink` su `bg` (15.7:1), `ink-muted` su `bg` (5.1:1, sufficiente per body ≥14px). Tutti i CTA primari (`navy-700` fill + testo bianco) sono AAA.

---

## 3. Tipografia

Tre famiglie ammesse — la decisione finale spetta al cliente dopo lo showcase. Tutte hanno gamma 400/500/600/700/800 e sono moderne e neutre.

### Candidate

| Famiglia | Personalità | Quando vince |
|---|---|---|
| **Inter** | Neutra, ultra-leggibile, default sicuro | Pubblico misto, lunghi testi (regolamento, news, area genitori) |
| **Manrope** | Calda, morbida, terminazioni "umane" | Family-friendly forte, gentilezza, lato Scuola predominante |
| **Geist** | Moderna, geometrica, leggermente tech | Posizionamento più premium/contemporaneo, identità racing più forte |

### Scala tipografica

| Token | Size / Line | Weight | Letter spacing | Uso |
|---|---|---|---|---|
| `display` | 72–96 / 0.95 | 700 | -0.02em | Hero, big claim |
| `h1` | 56 / 1.05 | 700 | -0.015em | Page title |
| `h2` | 40 / 1.1 | 700 | -0.01em | Section title |
| `h3` | 28 / 1.2 | 600 | -0.005em | Sub-section |
| `h4` | 22 / 1.3 | 600 | 0 | Card title |
| `body-lg` | 18 / 1.6 | 400 | 0 | Lead paragraph |
| `body` | 16 / 1.65 | 400 | 0 | Default |
| `body-sm` | 14 / 1.55 | 400 | 0 | Caption, helper |
| `micro` | 12 / 1.4 | 500 | 0.06em uppercase | Eyebrow, label |

Mobile: ridurre display/h1/h2 di un gradino (display 56, h1 40, h2 32).

---

## 4. Spacing scale

Base 4. Token: `--space-{n}`.

```
0   1   2   3   4   5   6   7   8   9   10   12   14   16   20   24
0   4   8   12  16  20  24  32  40  48  56   64   80   96  128  160
```

| Misura | Uso |
|---|---|
| 4–8 | Gap tra label e input, icone inline |
| 12–16 | Padding piccoli (badge, chip, input) |
| 20–24 | Gap tra elementi correlati in una card |
| 32–48 | Padding card, gap tra card in griglia |
| 64–96 | **Padding verticale sezioni mobile** |
| 96–160 | **Padding verticale sezioni desktop** |

Container massimo: `1280px` (interno con padding 24 mobile / 48 desktop).

---

## 5. Border radius

| Token | Valore | Uso |
|---|---|---|
| `radius-xs` | 4px | Toggles, mini-tag |
| `radius-sm` | 8px | Badge, chip |
| `radius-md` | 12px | Input, select, textarea |
| `radius-lg` | 16px | **Card standard**, button |
| `radius-xl` | 20px | Card feature, modal |
| `radius-2xl` | 28px | Card hero, image container grande |
| `radius-pill` | 9999px | Tag, pill button, avatar |

Niente angoli vivi (0px) tranne progress bar e linee divisorie.

---

## 6. Shadow scale

Ombre con tinta navy, non grigio puro — coerenti con la luce calda del brand.

| Token | Uso |
|---|---|
| `shadow-xs` | Hover discreti su elementi piccoli |
| `shadow-sm` | Card standard a riposo |
| `shadow-md` | Card hover, dropdown, popover |
| `shadow-lg` | Modal, drawer, sticky CTA mobile |
| `shadow-hero` | Image container nel hero, big feature card |

---

## 7. Motion

Tre principi:

1. **Vivo ma sobrio.** Niente bouncing, niente parallax pesanti.
2. **Coerente nei timing.** Tutte le micro-interazioni 200ms, transizioni di pagina 300–400ms.
3. **Easing umano.** `cubic-bezier(0.4, 0, 0.2, 1)` come default; `cubic-bezier(0.16, 1, 0.3, 1)` per entrate al scroll.

| Trigger | Durata | Easing |
|---|---|---|
| Hover bottoni / link | 180ms | `ease-out` |
| Card hover (lift + shadow) | 220ms | default |
| Drawer / modal in | 280ms | `ease-out` |
| Drawer / modal out | 200ms | `ease-in` |
| Fade-in al scroll | 600ms | `out-expo` |
| Stagger lista cards | 80ms gap | default |

---

## 8. Pattern di brand

Pattern geometrico ricorrente (cerchi, triangoli, diamanti, rombi) — la firma visiva di Triono. Disponibile in due versioni:

- `pattern.svg` — toni desaturati su navy scuro. Per sfondi navy/hero/footer.
- `pattern-light.svg` — stesso pattern in navy desaturato su crema. Per fasce decorative su sfondo chiaro.

### Dove usarlo (uso "discreto")

✅ Footer (sfondo navy).  
✅ Hero secondari delle sotto-pagine (Scuola, Amatori, Maestri).  
✅ Dietro a CTA importanti, come riempimento di una card accento.  
✅ Come divider stretto (16–32px) tra due sezioni di colore diverso.

### Dove **non** usarlo

❌ Mai dietro a corpo di testo lungo (regolamento, articoli).  
❌ Mai sopra una foto (uno solo dei due deve "parlare").  
❌ Mai a opacità piena su elementi piccoli: il pattern si legge solo su superfici ≥ 240×240px.  
❌ Mai su sezione Marathon 209 (ha già un suo motivo splatter giallo).

---

## 9. Fotografia e illustrazione

### 9.1 Foto reali — disponibili

✅ **Sezioni Scuola di Ciclismo:** bambini in allenamento, lezioni, eventi della scuola. Crop verticali e orizzontali ammessi, sempre con persone identificabili (mai foto vuote di bici sulla strada).

### 9.2 Sezioni che richiedono trattamento grafico

Per assenza di asset, queste sezioni usano pattern + tipografia + blocchi colore + icone — **mai foto stock**.

| Sezione | Trattamento |
|---|---|
| Amatori / Squadra Triono Racing | Card accento con `pattern.svg`, grandi numeri (anno fondazione, tesserati), tipografia espressiva |
| Maestri (federali) | Card con iniziali grandi + colore brand + dati (federazione, anni esperienza) |
| Gare / Calendario | Tabella + chip percorso + badge anno |
| Marathon 209 | **Skin separata**: vedi §11 |

### 9.3 Roadmap fotografico (da produrre)

Lista prioritaria di shooting da pianificare:

1. **Squadra Triono Racing** — gruppo team, ritratti atleti, mezzi (alta priorità).
2. **Maestri Scuola** — ritratti maestri federali, mezzi, dietro le quinte (alta priorità).
3. **Gare** — foto azione MTB, paddock, podio (media).
4. **Marathon MTB** — foto evento (bassa, già coperto per 209 da altro pacchetto).
5. **Struttura / sede** — esterni, magazzino, area meet-up (media).

### 9.4 Stile placeholder nei componenti

Finché le foto non sono disponibili, i componenti usano un placeholder a strisce diagonali sobrie (`navy-50` su `bg-soft`) con label `monospace` che descrive il contenuto richiesto. **Mai foto stock generiche**.

```
┌─────────────────────────────┐
│ /// /// /// /// /// /// /// │
│ /// /// /// /// /// /// /// │
│  PHOTO: BAMBINI IN MTB      │
│  4:3 · ORIZZONTALE          │
│ /// /// /// /// /// /// /// │
└─────────────────────────────┘
```

---

## 10. Iconografia

**Base: Lucide React** (ships con shadcn/ui). Stroke 1.75–2px. Dimensione default 20px.

### 10.1 Icone custom Triono (set ridotto)

5 icone disegnate ad-hoc, stesso peso/stile di Lucide:

| Nome | Uso |
|---|---|
| `WheelIcon` | Eventi MTB, percorsi, riparazioni |
| `HelmetIcon` | Sicurezza, equipaggiamento Scuola |
| `MountainIcon` | Marathon, percorsi off-road |
| `BikeIcon` | Override del Lucide bike, con telaio MTB più definito |
| `MedalIcon` | Risultati, podio, palmarès |

Stroke 1.75px, fill: `currentColor` o `transparent`. Tutte le icone vivono dentro un container quadrato 24×24 con padding visivo proporzionato.

---

## 11. Sezione Marathon 209 — design ospite

La Marathon MTB 209 è un evento dell'ASD ma ha **già un suo design system** (red/yellow, Anton display, splatter, race-bib). Sul sito Triono, la sezione/landing dedicata a 209 **eredita quel sistema** invece di forzarla nel navy/rounded del brand padre.

Regole di transizione:

- Il blocco 209 è introdotto da una "porta" visiva: una fascia di separazione full-width che annuncia il cambio di linguaggio.
- Dentro il blocco 209 valgono: `Anton` display, palette red/yellow, neutri warm, angoli vivi.
- All'uscita dal blocco si torna al navy Triono.
- La NavBar e il Footer di Triono restano sempre in stile Triono — sono il "guscio" che contiene l'evento.

Implementazione: il sottoalbero React della sezione 209 ha la sua `<ThemeScope>` con scope di CSS variables override.

---

## 12. Clerk appearance config

Per `<SignIn/>`, `<SignUp/>`, `<UserButton/>`. Da importare dove serve Clerk.

```ts
// lib/clerk-appearance.ts
import type { Appearance } from "@clerk/types";

export const trionoClerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1F2D5A",          // navy-700
    colorBackground: "#FFFFFF",
    colorText: "#14193A",             // ink
    colorTextSecondary: "#6B7388",    // ink-muted
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14193A",
    colorDanger: "#C01818",           // flag-500
    colorSuccess: "#5FAC36",          // grass-500
    colorWarning: "#E09618",          // ember-500
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    borderRadius: "16px",             // radius-lg
    spacingUnit: "4px",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-[0_20px_40px_rgba(20,25,58,0.10),0_4px_12px_rgba(20,25,58,0.05)] border border-[#E4E7EF] rounded-[20px]",
    headerTitle: "text-[28px] font-bold tracking-tight text-[#14193A]",
    headerSubtitle: "text-[#6B7388]",
    socialButtonsBlockButton:
      "rounded-[12px] border-[#E4E7EF] hover:bg-[#F2F4F9] transition-colors",
    formButtonPrimary:
      "bg-[#1F2D5A] hover:bg-[#050E3F] rounded-[16px] h-12 text-[15px] font-semibold normal-case transition-colors shadow-[0_2px_6px_rgba(20,25,58,0.06)]",
    formFieldInput:
      "rounded-[12px] border-[#E4E7EF] h-12 focus:border-[#1F2D5A] focus:ring-2 focus:ring-[#1F2D5A]/15",
    formFieldLabel: "text-[14px] font-semibold text-[#14193A]",
    footerActionLink: "text-[#3A82C8] hover:text-[#1F2D5A] font-semibold",
    identityPreviewEditButton: "text-[#3A82C8]",
    avatarBox: "rounded-full ring-2 ring-[#FFFFFF]",
    userButtonPopoverCard:
      "rounded-[20px] shadow-[0_20px_40px_rgba(20,25,58,0.10)] border border-[#E4E7EF]",
    userButtonPopoverActionButton: "rounded-[12px] hover:bg-[#F2F4F9]",
  },
};
```

Uso:

```tsx
import { SignIn } from "@clerk/nextjs";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-soft)] p-6">
      <SignIn appearance={trionoClerkAppearance} />
    </main>
  );
}
```

---

## 13. Mood board testuale

Riferimenti pubblici da consultare per inquadrare il livello qualitativo atteso (non da copiare):

1. **rapha.cc** — fotografia ciclismo di altissima qualità, narrazione testuale, layout ariosi.
2. **velodrom.cc** — sport + family-friendly su sfondo chiaro, navy come accento.
3. **specialized.com/us/en/c/bikes/kids** — sezione kids che è family-friendly senza essere infantile.
4. **canyon.com/en-de/youth/** — uso intelligente di accent color giallo su navy per linea junior.
5. **cyclingtips.com** — densità e tipografia per articoli/news lunghi.

---

## 14. Componenti prodotti

Tutti in `/components/ui/` come `.tsx`, pronti per shadcn/ui:

| File | Componente | Note |
|---|---|---|
| `button.tsx` | `<Button/>` | 6 varianti, 3 size, loading, icon-only — **2 varianti A/B** |
| `card.tsx` | `<Card/>` + sotto-componenti | 3 varianti: default, feature, accent |
| `hero.tsx` | `<Hero/>` | Video ambient + overlay + 2 CTA — **2 varianti A/B** |
| `navbar.tsx` | `<NavBar/>` | Sticky, mobile drawer |
| `footer.tsx` | `<Footer/>` | Colonne + newsletter + pattern di sfondo |
| `form.tsx` | `<Input/>`, `<Textarea/>`, `<Select/>`, `<Checkbox/>`, `<Radio/>`, `<Label/>`, `<FormField/>` | Stati focus/error/disabled |
| `news-card.tsx` | `<NewsCard/>` | Verticale per griglia |
| `badge.tsx` | `<Badge/>` | 6 varianti, 2 size |
| `section-header.tsx` | `<SectionHeader/>` | Eyebrow + h2 + sub + CTA inline |
| `icons.tsx` | `<WheelIcon/>` + 4 altre custom + re-export Lucide |

Vedi lo showcase HTML per la preview visuale completa.
