# EVO-046 — La porta della prova · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dare al sito una porta d'ingresso a basso attrito — la lezione di prova gratuita — accanto a quella esistente dell'iscrizione, e spostare tutti i contenuti a scadenza in una fascia che si aggiorna e si spegne da sola.

**Architecture:** La hero torna deterministica (un `<h1>` fisso, il claim di marca) e si divide in due campi: tipografia con fondale video trattato a sinistra, fotografia con le mascotte a destra. Sotto la tipografia, due porte dichiarate a parole. Sotto la hero, una fascia di regia a tre slot sostituisce il ticker hardcoded: la prova e gli allenamenti sono cablati nel codice, gli eventi arrivano da Airtable e scadono per data. `HeroCampagne` viene ritirata: i suoi record alimentano lo slot eventi.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · design system APEX v2 · Airtable REST via `src/lib/*` · ISR

**Spec di riferimento:** [`docs/superpowers/specs/2026-08-06-messaggio-home-triono-design.md`](../specs/2026-08-06-messaggio-home-triono-design.md)
**Decisioni:** [`docs/brainstorming-messaggio-home/DECISIONI.md`](../../brainstorming-messaggio-home/DECISIONI.md)

---

## Global Constraints

Valgono per **ogni** task. Non ripetute nei singoli task.

- **Numerazione:** questa è **EVO-046**. EVO-045 risulta in corso nel vault benché non sia nel repo. Branch: `evo/EVO-046-porta-prova`, creato **da `main` aggiornato**, non dal branch corrente.
- **Non esiste un test runner su `src/`.** Gli unici test del repo stanno in `emails/`. I gate di qualità sono, in quest'ordine: `npm run lint` · `npm run typecheck` · `npm run build`. La verifica comportamentale si fa sull'HTML renderizzato (`curl` sul dev server) e sullo schermo (`node scripts/dev-shot.mjs`). **Non inventare un'infrastruttura di test**: non è nello scope.
- **Un solo `<h1>` in home**, ed è il claim di marca `In bici, sicuri, insieme.`
- **Zero prove sociali inventate.** Nessun numero, testimonianza, logo partner, claim di scarsità.
- **La parola *gratis* compare una sola volta nel primo viewport**, nel prezzo della porta A.
- **Nessuna didascalia nomina il Ciclodromo Renato Perona** sulla fotografia, finché il luogo dello scatto non è verificato.
- **Perimetro del comodato, vincolante:** alla **prova** il bambino viene **sempre con la propria bici**; la bici da corsa in comodato d'uso gratuito riguarda **solo chi si iscrive al corso che comprende la strada**. Nessun copy può lasciar intendere il contrario.
- **APEX:** un solo fondale vivo per viewport · budget di **un** prop su mobile · il contenuto della pista è sacro.
- **WCAG 2.1 AA:** `text-stage-faint` fallisce AA su testo piccolo, usare `text-stage-muted` · `prefers-reduced-motion` rispettato · alt descrittivo sulla fotografia, `alt=""` + `aria-hidden` sulle mascotte.
- **Commit frequenti**, uno per task. Messaggi in italiano, prefisso `feat:` / `fix:` / `chore:` / `docs:`.
- **`git add` con path espliciti.** Mai `git add -A`: trascina worktree e file non correlati.

---

## File Structure

**Nuovi**

| File | Responsabilità |
|---|---|
| `public/photos/scuola/prima-partenza.jpg` | La fotografia del primo viewport |
| `src/lib/whatsapp.ts` | Deriva l'href `wa.me` da un numero e un messaggio. Nessuna dipendenza React |
| `src/components/home/PorteHero.tsx` | Le due porte. **Non ha prop per una terza CTA** |
| `src/components/home/FotoHero.tsx` | Campo fotografico + le due mascotte come props di palco |
| `src/components/home/FasciaRegia.tsx` | La fascia a tre slot sotto la hero |
| `src/components/home/CosaMettiamoNoi.tsx` | Blocco servizi dentro la sezione Scuola |
| `src/app/(public)/prova/page.tsx` | La pagina `/prova` |
| `src/components/prova/ConsegnaWhatsApp.tsx` | Il momento di uscita verso WhatsApp, con le alternative |

**Modificati**

| File | Modifica |
|---|---|
| `src/components/home/HomeHero.tsx` | Diventa deterministica, due campi, niente `HeroCampagne` |
| `src/app/(public)/page.tsx` | `HomeTicker` → `FasciaRegia` |
| `src/components/home/SezioneScuola.tsx` | Ospita `CosaMettiamoNoi` |
| `src/components/contatti/ContactForm.tsx` | Nuovo motivo `Lezione di prova` |
| `src/app/api/contatti/route.ts` | Enum zod allineato |
| `src/app/(public)/contatti/page.tsx` | Copy: separa "venire a guardare" da "provare in sella" |
| `src/components/scuola/SezioneComeIscriversi.tsx` | `LinkProva` → `/prova` |
| `PRODUCT.md` | Emendamento CTA primaria |

**Rimossi**

| File | Perché |
|---|---|
| `src/components/home/HomeTicker.tsx` | Sostituito dalla fascia. Hardcoded, annuncia una data del 28 giugno |
| `src/components/home/HeroCampagne.tsx` | La hero è deterministica; i record alimentano lo slot ② |

---

## Task 1 · Branch e fotografia

**Files:**
- Create: `public/photos/scuola/prima-partenza.jpg`
- Source: `/Users/luca/Downloads/IMG_4560.heic`

**Interfaces:**
- Consumes: niente
- Produces: il path `/photos/scuola/prima-partenza.jpg`, immagine **verticale**, larghezza 1400px, usata da `FotoHero` (Task 5)

- [ ] **Step 1: Creare il branch da `main` aggiornato**

```bash
cd /Users/luca/Developer/trionoracing-next
git fetch origin
git switch -c evo/EVO-046-porta-prova origin/main
```

- [ ] **Step 2: Convertire e ridimensionare la fotografia**

`sips` è preinstallato su macOS e legge HEIC nativamente. La foto è verticale: si conserva l'orientamento e si limita il lato lungo.

```bash
sips -s format jpeg -s formatOptions 82 -Z 1867 \
  "/Users/luca/Downloads/IMG_4560.heic" \
  --out public/photos/scuola/prima-partenza.jpg
```

- [ ] **Step 3: Verificare dimensioni e peso**

```bash
sips -g pixelWidth -g pixelHeight public/photos/scuola/prima-partenza.jpg
ls -lh public/photos/scuola/prima-partenza.jpg
```

Atteso: verticale (altezza > larghezza), lato lungo 1867px, peso sotto i 600 KB. Se supera 600 KB, riabbassare `formatOptions` a 75 e ripetere.

- [ ] **Step 4: Commit**

```bash
git add public/photos/scuola/prima-partenza.jpg
git commit -m "chore(EVO-046): fotografia della hero — bambino prima della partenza"
```

---

## Task 2 · Helper `whatsappHref`

**Files:**
- Create: `src/lib/whatsapp.ts`

**Interfaces:**
- Consumes: niente
- Produces: `whatsappHref(raw: string | undefined, message?: string): string | null` — usata da `FasciaRegia` (Task 6) e `ConsegnaWhatsApp` (Task 3)

> **Nota di verifica.** Questo modulo non ha un deliverable osservabile da solo, e il progetto non ha un test runner su `src/`. I gate qui sono `lint` e `typecheck`; la verifica comportamentale avviene nel Task 3, dove l'href finisce nell'HTML renderizzato e si controlla con `curl`.

- [ ] **Step 1: Scrivere il modulo**

```ts
/**
 * Costruisce un link WhatsApp a partire dal numero gestito su Airtable
 * (chiave "scuola-telefono", vedi src/lib/site-settings.ts).
 *
 * Il numero NON va mai hardcoded: se la chiave è assente la funzione
 * ritorna null e il consumer degrada su un'alternativa (form o telefono)
 * invece di mostrare un link rotto.
 */
export function whatsappHref(raw: string | undefined, message?: string): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // wa.me vuole il numero in formato internazionale senza "+", spazi o simboli.
  const digits = trimmed.startsWith("+")
    ? trimmed.replace(/[^\d]/g, "")
    : `39${trimmed.replace(/[^\d]/g, "")}`;

  // Un numero italiano in E.164 ha 12 cifre (39 + 10). Sotto le 11 è
  // certamente malformato: meglio nessun link che un link rotto.
  if (digits.length < 11) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Messaggio precompilato della richiesta di prova. Contiene già tutto ciò
 * che serve per rispondere una volta sola, senza il rimpallo di domande.
 */
export const MESSAGGIO_PROVA =
  "Ciao! Vorrei far provare mio figlio/a alla Scuola di Ciclismo. " +
  "Età: __ · Giorno preferito: martedì (strada) / giovedì (MTB)";
```

- [ ] **Step 2: Eseguire i gate**

```bash
npm run lint && npm run typecheck
```

Atteso: entrambi puliti, nessun output di errore.

- [ ] **Step 3: Commit**

```bash
git add src/lib/whatsapp.ts
git commit -m "feat(EVO-046): helper whatsappHref derivato da scuola-telefono"
```

---

## Task 3 · Pagina `/prova`

**Files:**
- Create: `src/app/(public)/prova/page.tsx`
- Create: `src/components/prova/ConsegnaWhatsApp.tsx`
- Modify: `src/components/scuola/SezioneComeIscriversi.tsx:256` (href di `LinkProva`)

**Interfaces:**
- Consumes: `whatsappHref`, `MESSAGGIO_PROVA` da `src/lib/whatsapp.ts` · `getSiteSettings`, `formatPhoneIT`, `phoneHref` da `src/lib/site-settings.ts` · `SectionHead`, `ApexCta` da `src/components/apex/`
- Produces: la route `/prova`, destinazione della porta A (Task 4) e del link nella fascia (Task 6)

- [ ] **Step 1: Scrivere il componente di consegna a WhatsApp**

`src/components/prova/ConsegnaWhatsApp.tsx` — server component, nessuno stato.

```tsx
import { getSiteSettings, formatPhoneIT, phoneHref } from "@/lib/site-settings";
import { whatsappHref, MESSAGGIO_PROVA } from "@/lib/whatsapp";

/**
 * Il momento di uscita dal sito. Non è un bottone e basta: dice chi
 * risponde, cosa succede dopo, e offre le alternative allo stesso livello
 * per chi non usa WhatsApp.
 */
export async function ConsegnaWhatsApp() {
  const settings = await getSiteSettings();
  const telefono = settings["scuola-telefono"];
  const referente = settings["scuola-referente"];
  const wa = whatsappHref(telefono, MESSAGGIO_PROVA);

  return (
    <div className="apex-card apex-card--warm p-6 lg:p-8">
      <p className="text-[15px] leading-relaxed">
        Ci scrivi, concordiamo insieme il giorno, e vieni. Risponde
        {referente ? ` ${referente}` : " una persona della scuola"}, non un centralino.
      </p>

      {wa ? (
        <a href={wa} className="apex-cta apex-cta--primary mt-6 inline-flex">
          Scrivi su WhatsApp
          <span className="apex-cta__arrow" aria-hidden="true">
            →
          </span>
        </a>
      ) : null}

      <p className="mt-6 text-[13px] text-stage-muted">
        Preferisci un altro modo?{" "}
        {telefono ? (
          <>
            Chiama il{" "}
            <a href={phoneHref(telefono)} className="underline underline-offset-2">
              {formatPhoneIT(telefono)}
            </a>{" "}
            oppure{" "}
          </>
        ) : null}
        <a href="/contatti?motivo=prova" className="underline underline-offset-2">
          scrivici dal modulo contatti
        </a>
        .
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Scrivere la pagina**

`src/app/(public)/prova/page.tsx`.

```tsx
import type { Metadata } from "next";
import { SectionHead } from "@/components/apex/SectionHead";
import { ConsegnaWhatsApp } from "@/components/prova/ConsegnaWhatsApp";
import { Grain } from "@/components/apex/Grain";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Prova gratuita · Scuola di Ciclismo Triono, Terni",
  description:
    "Fino a due lezioni di prova gratuite alla Scuola di Ciclismo Triono, al Ciclodromo Renato Perona di Terni. Serve solo la bici del bambino e il casco. Si concorda prima, senza iscriversi.",
  alternates: { canonical: "/prova" },
};

export const revalidate = 600;

export default function ProvaPage() {
  return (
    <div data-livery="scuola" className="bg-stage-bg text-stage-ink">
      <Grain />
      <BreadcrumbJsonLd items={[{ name: "Prova gratuita", url: "/prova" }]} />

      <section className="apex-section--hero">
        <div className="apex-wrap">
          <SectionHead
            kicker="SCUOLA DI CICLISMO · TERNI"
            title="Venite a provare, prima di decidere."
            intro="Fino a due lezioni gratuite, senza iscriversi. Si concorda il giorno e si viene: nessun impegno, né prima né dopo."
          />

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="apex-h2">Cosa serve</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
                <li>
                  <strong>La bici del bambino</strong>, qualunque essa sia. Non serve una bici da
                  corsa o da mountain bike: va bene quella che usa già.
                </li>
                <li>
                  <strong>Il casco.</strong> È obbligatorio, ed è la prima regola della scuola.
                </li>
              </ul>

              <h2 className="apex-h2 mt-12">Quando</h2>
              <ul className="mt-4 space-y-2 text-[15px]">
                <li>
                  <strong>Martedì 17:00 – 18:30</strong> · bici da strada
                </li>
                <li>
                  <strong>Giovedì 17:00 – 18:30</strong> · mountain bike
                </li>
              </ul>
              <p className="mt-3 text-[14px] text-stage-muted">
                Ciclodromo Renato Perona, Terni. Dai 4 anni.
              </p>

              <h2 className="apex-h2 mt-12">Come funziona</h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed">
                La prova va concordata prima: ci scrivi, fissiamo insieme il giorno e ti aspettiamo.
                Sono fino a due lezioni, gratuite, e valgono sia per il corso su strada sia per
                quello in mountain bike. Iscriversi non c&apos;entra: si decide dopo, con calma.
              </p>

              <p className="mt-8 max-w-[60ch] text-[14px] text-stage-muted">
                Una cosa che le famiglie non si aspettano: chi poi si iscrive al corso che comprende
                la strada riceve la <strong className="text-stage-ink">bici da corsa in comodato
                d&apos;uso gratuito</strong>. Alla prova, invece, il bambino viene sempre con la sua.
              </p>
            </div>

            <div className="lg:col-span-5">
              <ConsegnaWhatsApp />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

> **Attenzione al `grid`:** `grid-cols-1 lg:grid-cols-12` con `grid-cols-1` esplicito è obbligatorio. Senza, sotto `lg:` il container non ha colonne esplicite, il track implicito si dimensiona su `auto` e può produrre overflow orizzontale reale (lezione EVO-044).

- [ ] **Step 3: Verificare prop e classi usate, prima di dare per scontato che esistano**

```bash
rg -n "kicker|title|intro|variant" src/components/apex/SectionHead.tsx | head -20
rg -n "BreadcrumbJsonLd" src/components/seo/json-ld.tsx | head -5
rg -n "\.apex-card--warm|\.apex-h2|\.apex-section--hero" src/app/apex.css | head
```

Se le firme non combaciano, adeguare le chiamate alle prop reali. **Non modificare i componenti condivisi** per farli combaciare.

**`.apex-h2` non esiste** — verificato: in `apex.css` non c'è. Usare l'elemento con `style={{ fontSize: "var(--fs-h2)" }}`, che è un token reale, e togliere la classe dal markup del passo 2.

`.apex-card--warm` è la superficie avorio della livrea Scuola (EVO-039) e qui è corretta, perché la pagina dichiara `data-livery="scuola"`. **Attenzione alla cascata:** `apex.css` definisce `.apex-card--warm p { color: ... }` come regola *unlayered*, che batte le utility Tailwind. Dentro quella card un `text-stage-muted` su un `<p>` viene **neutralizzato**. Non combattere la cascata con `!important`: il colore caldo lì è quello giusto, quindi togliere la utility dal markup del passo 1 e lasciare che sia la card a decidere.

> **Nota sul deep link.** `/contatti?motivo=prova` risolve al motivo giusto solo dopo il Task 9. Fino ad allora cade su *Altro*, che è un degrado accettabile e non un errore: il form funziona comunque.

- [ ] **Step 4: Puntare il link esistente di `/la-scuola` alla nuova pagina**

In `src/components/scuola/SezioneComeIscriversi.tsx`, dentro `LinkProva` (intorno a riga 256), sostituire:

```tsx
      href="/contatti?motivo=scuola"
```

con:

```tsx
      href="/prova"
```

- [ ] **Step 5: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

Atteso: tutti puliti, e nel report di build compare la route `/prova`.

- [ ] **Step 6: Verificare l'href WhatsApp nell'HTML renderizzato**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/prova | grep -oE 'https://wa\.me/[0-9]+\?text=[^"]{0,60}'
curl -s http://localhost:3000/prova | grep -c 'Ciclodromo Renato Perona'
```

Atteso: un href `wa.me` con prefisso `39` e il testo precompilato; almeno una occorrenza del ciclodromo (qui è corretto nominarlo, è la sede delle lezioni — il divieto riguarda la **didascalia della fotografia**).

Se l'href non compare, la chiave `scuola-telefono` non sta arrivando: verificare `.env.local` e la tabella `Impostazioni Sito`. Il degrado a `null` è voluto, non è un bug del componente.

- [ ] **Step 7: Verificare che non ci sia overflow orizzontale**

```bash
node scripts/dev-shot.mjs /prova --mobile --eval "document.documentElement.scrollWidth - document.documentElement.clientWidth"
```

Atteso: `0`. Se è positivo, filtrare gli offender escludendo `position:fixed` e gli elementi con antenato `overflow-x:hidden` prima di dichiarare un bug (`.apex-grain` produce falsi positivi).

- [ ] **Step 8: Commit**

```bash
git add src/app/\(public\)/prova/page.tsx src/components/prova/ConsegnaWhatsApp.tsx src/components/scuola/SezioneComeIscriversi.tsx
git commit -m "feat(EVO-046): pagina /prova con consegna a WhatsApp"
```

---

## Task 4 · Le due porte

**Files:**
- Create: `src/components/home/PorteHero.tsx`

**Interfaces:**
- Consumes: `ApexCta` da `@/components/apex/ApexCta`
- Produces: `<PorteHero />` — nessuna prop. Usata da `HomeHero` (Task 5)

Il componente **non accetta prop**: è la garanzia strutturale che non possano diventare tre porte. La regola sta nel tipo, non in un commento.

- [ ] **Step 1: Scrivere il componente**

```tsx
import { ApexCta } from "@/components/apex/ApexCta";

/**
 * Le due porte d'ingresso della home.
 *
 * Non sono due intensità dello stesso atto: sono due domande con risposta
 * ovvia, ognuna col proprio prezzo d'ingresso dichiarato. Il genitore si
 * auto-seleziona su un fatto, non su un giudizio.
 *
 * IL COMPONENTE NON HA PROP, ED È VOLUTO: è la garanzia che non possano
 * diventare tre. Se serve una terza azione, non va aggiunta qui.
 */
export function PorteHero() {
  return (
    <div className="mt-8">
      <p className="apex-eyebrow text-stage-muted">Due modi per cominciare.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {/* Porta A — la prova */}
        <div className="flex flex-col items-start">
          <p className="apex-data text-accent">Tuo figlio non ha mai provato?</p>
          <ApexCta href="/prova" className="mt-3">
            Prenota una prova
          </ApexCta>
          <p className="apex-data mt-3 text-stage-muted">
            Fino a 2 lezioni, gratis · basta una bici qualsiasi e il casco
          </p>
        </div>

        {/* Porta B — l'iscrizione */}
        <div className="flex flex-col items-start">
          <p className="apex-data text-accent-2">Hai già deciso?</p>
          <ApexCta href="/portale/iscrizioni" variant="support" className="mt-3">
            Iscrivi tuo figlio
          </ApexCta>
          {/* Sotto i 553px di altezza utile il prezzo di porta B scende per
              progetto: è una riga da 11px per chi ha già deciso, e quei pixel
              servono a tenere entrambe le porte sopra la piega su iPhone SE. */}
          <p className="apex-data mt-3 hidden text-stage-muted [@media(min-height:554px)]:block">
            Tutto online · foto e certificato medico
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificare che le classi usate esistano nel design system**

```bash
rg -n "\.apex-data|\.apex-eyebrow|--accent-2\b" src/app/apex.css src/app/globals.css | head -10
rg -n "text-accent\b|text-accent-2\b|text-stage-muted" src/app/globals.css | head -10
```

Se `text-accent` / `text-accent-2` non sono utility esistenti, usare `style={{ color: "var(--accent)" }}`. **Non inventare token.**

> Ricorda la trappola verificata: la regola unlayered `.apex-data { color }` batte le utility Tailwind **sull'elemento che la porta**, ma non sui figli. Qui `.apex-data` e la utility di colore stanno sullo stesso elemento, quindi il colore lo decide `.apex-data`: se il risultato non è quello atteso, spostare il colore in `style` invece di combattere la cascata.

- [ ] **Step 3: Gate**

```bash
npm run lint && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/home/PorteHero.tsx
git commit -m "feat(EVO-046): componente PorteHero, due porte dichiarate senza terza CTA"
```

---

## Task 5 · Hero deterministica a due campi

**Files:**
- Create: `src/components/home/FotoHero.tsx`
- Modify: `src/components/home/HomeHero.tsx` (riscrittura completa)

**Interfaces:**
- Consumes: `PorteHero` (Task 4) · `getSfondoVideo`, `cloudinaryVideoOptimized` · `StageScene`, `StageProp`, `FondaleVivo`
- Produces: la hero della home. **Non consuma più `getComunicazioniHeroAttive`**, che passa a `FasciaRegia` (Task 6)

- [ ] **Step 1: Scrivere il campo fotografico**

`src/components/home/FotoHero.tsx`.

```tsx
import Image from "next/image";
import { StageProp } from "@/components/apex/StageProp";

/**
 * Campo fotografico della hero: la fotografia reale della scuola, con le
 * mascotte come props di palco ai suoi bordi — a bordo pista, come il
 * genitore che guarda.
 *
 * Le mascotte sono agganciate al bordo INFERIORE (regola NINO.md §6/§12:
 * il taglio del cutout coincide col bordo, mai figure che fluttuano) e non
 * coprono il bambino reale.
 *
 * NESSUNA DIDASCALIA nomina il luogo dello scatto finché non è verificato.
 */
export function FotoHero() {
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden lg:min-h-[560px]">
      <Image
        src="/photos/scuola/prima-partenza.jpg"
        alt="Un bambino della scuola, di spalle e col casco allacciato, fermo accanto alla sua bici prima di partire."
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 46vw"
        className="object-cover object-center"
      />

      {/* Mascotte: due su desktop, una sola su mobile (budget prop APEX). */}
      <StageProp
        level="oggetti"
        anchor={{ left: "2%", bottom: 0, width: "min(160px, 22%)" }}
      >
        <Image
          src="/vittoria/vittoria-figura-poster.png"
          alt=""
          aria-hidden
          width={420}
          height={640}
          className="h-auto w-full object-bottom"
        />
      </StageProp>

      <StageProp
        level="oggetti"
        anchor={{ right: "2%", bottom: 0, width: "min(170px, 23%)" }}
        mobileHide
      >
        <Image
          src="/nino/nino-figura-poster.png"
          alt=""
          aria-hidden
          width={420}
          height={640}
          className="h-auto w-full object-bottom"
        />
      </StageProp>
    </div>
  );
}
```

- [ ] **Step 2: Riscrivere `HomeHero`**

Sostituire **l'intero contenuto** di `src/components/home/HomeHero.tsx`.

```tsx
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { StageScene } from "@/components/apex/StageScene";
import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { PorteHero } from "@/components/home/PorteHero";
import { FotoHero } from "@/components/home/FotoHero";

/**
 * Hero della home — DETERMINISTICA (EVO-046).
 *
 * L'<h1> è e resta il claim di marca: non dipende più da cosa ha scritto
 * l'amministratore su Airtable. È anche la precondizione tecnica per poter
 * garantire dove cade la piega, perché l'altezza non varia col contenuto.
 *
 * Composizione a due campi: tipografia + fondale vivo trattato a sinistra
 * (lì il video è texture, non deve essere leggibile), fotografia a destra
 * (lì l'immagine deve essere leggibile). Un solo fondale vivo per viewport,
 * come prescrive APEX.
 *
 * Le comunicazioni Airtable NON stanno più qui: alimentano lo slot eventi
 * della fascia di regia (src/components/home/FasciaRegia.tsx).
 */
export async function HomeHero() {
  const sfondo = await getSfondoVideo("home-hero");
  const videoSrc = sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined;

  return (
    <StageScene className="min-h-[86vh]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[52fr_46fr]">
        {/* Campo tipografico */}
        <div className="relative flex items-center py-20 lg:py-24">
          <FondaleVivo src={videoSrc} poster={sfondo?.posterUrl} />

          <div className="apex-wrap relative w-full" style={{ zIndex: "var(--z-pista)" }}>
            <div className="apex-eyebrow reveal">SCUOLA DI CICLISMO E SQUADRA · TERNI</div>

            <h1
              className="apex-display mt-5 max-w-[15ch]"
              style={{ fontSize: "var(--fs-hero)", lineHeight: "var(--lh-hero)" }}
            >
              <span className="reveal">In bici,</span>{" "}
              <span className="stroke-word reveal reveal-delay-1">sicuri,</span>
              <br />
              <span className="accent-word reveal reveal-delay-2">insieme.</span>
            </h1>

            <p
              className="reveal reveal-delay-2 mt-6 max-w-[52ch] text-stage-ink-dim"
              style={{ fontSize: "var(--fs-body-lg)" }}
            >
              Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona di Terni.
              <span className="hidden sm:inline">
                {" "}
                Si comincia con due lezioni di prova gratuite, e poi si continua con la squadra.
              </span>
            </p>

            <div className="reveal reveal-delay-3">
              <PorteHero />
            </div>
          </div>
        </div>

        {/* Campo fotografico */}
        <FotoHero />
      </div>
    </StageScene>
  );
}
```

- [ ] **Step 3: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 4: Verificare che l'`<h1>` sia tornato il claim di marca**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/ | grep -oE '<h1[^>]*>.{0,120}'
curl -s http://localhost:3000/ | grep -c '<h1'
```

Atteso: **esattamente un** `<h1>`, e contiene `In bici,` / `sicuri,` / `insieme.` — non il titolo di una campagna Airtable. Questo è il vincolo che oggi in produzione **non** è rispettato: è il cuore del task.

- [ ] **Step 5: Verificare che *gratis* compaia una sola volta nel primo viewport**

```bash
curl -s http://localhost:3000/ | grep -o 'gratis' | wc -l
```

Atteso: `1`. Se è maggiore, una delle occorrenze va rimossa: la parola vive solo nel prezzo della porta A.

- [ ] **Step 6: Verificare la piega su tutti i viewport utili**

```bash
for v in "375 667" "375 812" "390 844" "1280 720" "1440 900"; do
  set -- $v
  echo "=== ${1}x${2} ==="
  node scripts/dev-shot.mjs / --w $1 --h $2 --eval "
    const porte = [...document.querySelectorAll('a.apex-cta')].slice(0,2);
    JSON.stringify(porte.map(p => Math.round(window.innerHeight - p.getBoundingClientRect().bottom)))
  "
done
```

Atteso: entrambi i valori **positivi** su ogni viewport — sono i pixel di margine fra il fondo di ciascuna porta e la piega. Un valore negativo significa che quella porta è sotto la piega e va corretto (ridurre `--fs-hero` per altezza, o accorciare il sottotitolo mobile) **prima** di procedere.

Annotare i cinque risultati nel messaggio di commit: sono la baseline che i task successivi non devono peggiorare.

- [ ] **Step 7: Screenshot di controllo del registro misto**

```bash
node scripts/dev-shot.mjs / --w 1440 --h 900
node scripts/dev-shot.mjs / --mobile
```

Guardare i due file in `.dev-shots/`. Le mascotte devono leggere come **props di palco agganciati al bordo inferiore**, non come adesivi incollati di fianco alla foto. Se galleggiano, il cutout ha padding trasparente in fondo e va ritagliato al bbox (lezione EVO-038), non spostato con un offset.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/HomeHero.tsx src/components/home/FotoHero.tsx
git commit -m "feat(EVO-046): hero deterministica a due campi con le due porte

L'<h1> torna a essere il claim di marca e non dipende più dalle campagne
Airtable. Margini della piega misurati: [inserire i cinque valori del passo 6]."
```

---

## Task 6 · La fascia di regia

**Files:**
- Create: `src/components/home/FasciaRegia.tsx`
- Modify: `src/app/(public)/page.tsx:3,54`
- Delete: `src/components/home/HomeTicker.tsx`

**Interfaces:**
- Consumes: `getComunicazioniHeroAttive` da `@/lib/comunicazioni-hero` · `whatsappHref`, `MESSAGGIO_PROVA` (Task 2) · `getSiteSettings`
- Produces: `<FasciaRegia />`, che sostituisce `<HomeTicker />` in `page.tsx`

- [ ] **Step 1: Rileggere la forma dei dati delle comunicazioni**

```bash
rg -n "export type ComunicazioneHero" -A 12 src/lib/comunicazioni-hero.ts
```

Usare **i nomi di campo reali** che questo comando restituisce. Gli attesi sono `titolo`, `sottotitolo`, `ctaLabel`, `ctaUrl`, `priorita`: se differiscono, adeguare il componente ai nomi veri.

- [ ] **Step 2: Scrivere la fascia**

```tsx
import { getComunicazioniHeroAttive } from "@/lib/comunicazioni-hero";
import { getSiteSettings } from "@/lib/site-settings";
import { whatsappHref, MESSAGGIO_PROVA } from "@/lib/whatsapp";

/**
 * Fascia di regia — il livello operativo della home (EVO-046).
 *
 * Sostituisce HomeTicker, che era hardcoded e ha annunciato per sei
 * settimane una gara del 28 giugno già passata. Qui i tre slot hanno tre
 * proprietari diversi:
 *
 *   ① LA PROVA        cablato nel codice, non può sparire
 *   ② IN PROGRAMMA    da Airtable, scade da solo per data
 *   ③ ALLENAMENTI     cablato, cambia una volta l'anno
 *
 * Lo slot ① NON ha un bottone pieno: l'azione piena la porta già la porta A
 * della hero, e ripeterla produrrebbe quattro CTA con due sole etichette
 * nel primo viewport desktop.
 */
export async function FasciaRegia() {
  const [comunicazioni, settings] = await Promise.all([
    getComunicazioniHeroAttive(),
    getSiteSettings(),
  ]);

  const wa = whatsappHref(settings["scuola-telefono"], MESSAGGIO_PROVA);
  const [primo, ...altri] = comunicazioni;

  return (
    <section className="border-y border-stage-line bg-stage-surface">
      <div className="apex-wrap grid grid-cols-1 gap-8 py-10 md:grid-cols-3 md:gap-10">
        {/* ① La prova */}
        <div>
          <p className="apex-eyebrow text-accent">La prova · subito</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            Due lezioni gratuite, senza iscriversi.
          </p>
          {wa ? (
            <a
              href={wa}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
            >
              Scrivi su WhatsApp
              <span aria-hidden>→</span>
            </a>
          ) : (
            <a
              href="/prova"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
            >
              Come prenotare
              <span aria-hidden>→</span>
            </a>
          )}
        </div>

        {/* ② In programma — da Airtable, un evento alla volta */}
        <div>
          <p className="apex-eyebrow text-stage-muted">In programma</p>
          {primo ? (
            <>
              <p className="mt-2 text-[15px] font-semibold leading-snug">{primo.titolo}</p>
              {primo.sottotitolo ? (
                <p className="mt-1 text-[14px] leading-relaxed text-stage-muted">
                  {primo.sottotitolo}
                </p>
              ) : null}
              {primo.ctaUrl && primo.ctaLabel ? (
                <a
                  href={primo.ctaUrl}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
                >
                  {primo.ctaLabel}
                  <span aria-hidden>→</span>
                </a>
              ) : null}
              {altri.length > 0 ? (
                <p className="apex-data mt-3 text-stage-muted">
                  Poi: {altri.map((c) => c.titolo).join(" · ")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[14px] leading-relaxed text-stage-muted">
              Nessun appuntamento in programma al momento.
            </p>
          )}
        </div>

        {/* ③ Allenamenti */}
        <div>
          <p className="apex-eyebrow text-stage-muted">Allenamenti</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            Martedì strada · Giovedì MTB
            <br />
            17:00–18:30, Ciclodromo Renato Perona, Terni
          </p>
          <a
            href="/la-scuola"
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-2"
          >
            Come funziona la Scuola
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Sostituire il ticker nella home**

In `src/app/(public)/page.tsx`, riga 3, sostituire l'import:

```tsx
import { HomeTicker } from "@/components/home/HomeTicker";
```

con:

```tsx
import { FasciaRegia } from "@/components/home/FasciaRegia";
```

e nel JSX sostituire `<HomeTicker />` con `<FasciaRegia />`.

- [ ] **Step 4: Rimuovere il ticker e verificare che non resti orfano**

```bash
git rm src/components/home/HomeTicker.tsx
rg -n "HomeTicker" src/ || echo "nessun riferimento residuo"
```

Atteso: nessun riferimento residuo.

- [ ] **Step 5: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 6: Verificare che la data morta sia sparita e la campagna sia viva**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/ | grep -c '28 GIU 2026' || echo "0 — corretto"
curl -s http://localhost:3000/ | grep -o 'In programma'
```

Atteso: zero occorrenze della data passata, e lo slot "In programma" presente. Se su Airtable c'è una comunicazione attiva, deve comparire qui — non più nella hero.

- [ ] **Step 7: Verificare che la piega non sia peggiorata**

Rieseguire il ciclo del Task 5 passo 6 e confrontare con la baseline annotata nel commit precedente. La fascia sta sotto la piega per progetto: i margini delle porte non devono cambiare.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/FasciaRegia.tsx src/app/\(public\)/page.tsx src/components/home/HomeTicker.tsx
git commit -m "feat(EVO-046): fascia di regia al posto del ticker hardcoded

Le comunicazioni Airtable scendono dallo slot hero allo slot eventi, che
scade da solo per data. Rimosso HomeTicker, fermo al 28 giugno."
```

---

## Task 7 · Ritiro di `HeroCampagne`

**Files:**
- Delete: `src/components/home/HeroCampagne.tsx`

**Interfaces:**
- Consumes: niente
- Produces: niente. È una rimozione di codice diventato morto nel Task 5

`HeroCampagne` non ha più consumatori: la hero è deterministica e i record di `Comunicazioni Hero` alimentano lo slot ② della fascia. Rimuoverla evita di lasciare in repo un componente che reintrodurrebbe silenziosamente l'`<h1>` variabile se qualcuno lo rimontasse.

Questo task chiude anche la correzione del commento stale a `HeroCampagne.tsx:31`, che dichiarava il contrario di ciò che il file faceva: il file non esiste più.

- [ ] **Step 1: Verificare che sia davvero orfano**

```bash
rg -n "HeroCampagne" src/ docs/ || echo "nessun riferimento nel codice"
```

Se compaiono riferimenti in `src/`, **fermarsi**: qualcosa lo usa ancora e il Task 5 non è completo. I riferimenti in `docs/` sono attesi e non vanno rimossi.

- [ ] **Step 2: Rimuovere il file**

```bash
git rm src/components/home/HeroCampagne.tsx
```

- [ ] **Step 3: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

Atteso: build pulita. Un errore di import qui significa che il passo 1 aveva dato un falso negativo.

- [ ] **Step 4: Verificare che l'admin comunicazioni continui a funzionare**

```bash
rg -n "revalidatePath" src/app/portale/admin/comunicazioni/*.ts* | head
```

Atteso: `revalidatePath("/")` ancora presente. L'admin non va toccato: scrive gli stessi record, che ora atterrano nella fascia.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(EVO-046): rimuove HeroCampagne, orfana dopo la hero deterministica"
```

---

## Task 8 · Blocco «Cosa mettiamo noi»

**Files:**
- Create: `src/components/home/CosaMettiamoNoi.tsx`
- Modify: `src/components/home/SezioneScuola.tsx`

**Interfaces:**
- Consumes: niente
- Produces: `<CosaMettiamoNoi />`, montata dentro `SezioneScuola`

- [ ] **Step 1: Scrivere il blocco**

```tsx
/**
 * I due servizi che il sito non nominava da nessuna parte e che i genitori
 * non possono immaginare da soli (EVO-046).
 *
 * PERIMETRO DEL COMODATO, VINCOLANTE: vale DOPO l'iscrizione, e solo per
 * chi sceglie il corso che comprende la strada. Alla prova il bambino
 * viene sempre con la propria bici. Non modificare questo copy senza
 * riverificare il perimetro: è un impegno che la scuola deve mantenere.
 */
const SERVIZI = [
  {
    titolo: "La bici da corsa",
    testo:
      "Chi si iscrive al corso che comprende la strada riceve la bici da corsa in comodato d'uso gratuito. Non serve comprarla per capire se piace.",
  },
  {
    titolo: "L'area riservata",
    testo:
      "Iscrizione, rinnovo del certificato medico, quote e rate mensili: tutto online, in un'unica area riservata.",
  },
  {
    titolo: "I maestri",
    testo: "Maestri federali e gruppi piccoli, divisi per età.",
  },
] as const;

export function CosaMettiamoNoi() {
  return (
    <div className="mt-16">
      <h3 className="apex-eyebrow text-stage-muted">Cosa mettiamo noi</h3>
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {SERVIZI.map((s) => (
          <div key={s.titolo}>
            <p className="text-[15px] font-semibold">{s.titolo}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-stage-muted">{s.testo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Montarlo dentro `SezioneScuola`**

```bash
rg -n "ApexCta|</div>|apex-wrap" src/components/home/SezioneScuola.tsx | sed -n '1,25p'
```

Inserire `<CosaMettiamoNoi />` **dopo** il blocco delle CTA (intorno a riga 127), dentro lo stesso contenitore `apex-wrap`, aggiungendo l'import in testa al file:

```tsx
import { CosaMettiamoNoi } from "@/components/home/CosaMettiamoNoi";
```

- [ ] **Step 3: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 4: Verificare il copy renderizzato e il perimetro**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/ | grep -o "comodato d'uso gratuito"
curl -s http://localhost:3000/ | grep -o 'gratis' | wc -l
```

Atteso: il comodato compare una volta; `gratis` resta a **1** — il blocco servizi usa *gratuito*, non *gratis*, e il conteggio del primo viewport non cambia.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/CosaMettiamoNoi.tsx src/components/home/SezioneScuola.tsx
git commit -m "feat(EVO-046): blocco Cosa mettiamo noi — comodato bici e area riservata"
```

---

## Task 9 · Motivo «Lezione di prova» e copy di `/contatti`

**Files:**
- Modify: `src/components/contatti/ContactForm.tsx:19,21-26,28-39`
- Modify: `src/app/api/contatti/route.ts:25-30`
- Modify: `src/app/(public)/contatti/page.tsx:95-98`

**Interfaces:**
- Consumes: niente
- Produces: il deep link `/contatti?motivo=prova`, usato da `ConsegnaWhatsApp` (Task 3)

> **Gotcha già pagato tre volte in questo progetto.** Il campo Airtable `MOTIVO` è una **singleSelect**: se il valore inviato non è fra le sue choices, Airtable risponde `422 INVALID_MULTIPLE_CHOICE_OPTIONS`. Il fallimento è silenzioso in UI. La choice va creata su **PROD e DEV** prima del codice.

- [ ] **Step 1: Aggiungere la choice su Airtable, PROD e DEV**

Nella tabella dei contatti, campo `MOTIVO`, aggiungere la choice **`Lezione di prova`** — testo esatto, maiuscole comprese — su entrambe le basi: PROD `appszpkU1aXb3xrFM` e DEV `app7FOqBdmmW0jBf5`.

L'API Airtable **non** consente di aggiungere choices a una singleSelect via `update_field`: o si scrive un record con `typecast: true`, o si aggiunge a mano dalla UI di Airtable. **Verificare che la choice esista su entrambe le basi prima di procedere.**

- [ ] **Step 2: Allineare l'enum zod del server**

In `src/app/api/contatti/route.ts`, riga 25, sostituire:

```ts
  motivo: z.enum([
    "Scuola di Ciclismo",
    "Tesseramento Amatori",
    "Marathon 209",
    "Altro",
  ]),
```

con:

```ts
  motivo: z.enum([
    "Lezione di prova",
    "Scuola di Ciclismo",
    "Tesseramento Amatori",
    "Marathon 209",
    "Altro",
  ]),
```

- [ ] **Step 3: Allineare il client**

In `src/components/contatti/ContactForm.tsx`, riga 19, sostituire il tipo:

```ts
type Motivo = "Scuola di Ciclismo" | "Tesseramento Amatori" | "Marathon 209" | "Altro";
```

con:

```ts
type Motivo =
  | "Lezione di prova"
  | "Scuola di Ciclismo"
  | "Tesseramento Amatori"
  | "Marathon 209"
  | "Altro";
```

l'array `MOTIVI` (riga 21):

```ts
const MOTIVI: Motivo[] = [
  "Lezione di prova",
  "Scuola di Ciclismo",
  "Tesseramento Amatori",
  "Marathon 209",
  "Altro",
];
```

e aggiungere il caso in `motivoFromKey` (riga 28), **prima** del `default`:

```ts
    case "prova":
      return "Lezione di prova";
```

- [ ] **Step 4: Correggere il copy di `/contatti`**

In `src/app/(public)/contatti/page.tsx`, righe 95-98, sostituire:

```tsx
              <p className="mt-4 text-sm text-stage-ink-dim">
                Sei il benvenuto in qualsiasi lezione per conoscere maestri, bambini e ambiente.
                Niente prenotazione, basta presentarsi.
              </p>
```

con:

```tsx
              <p className="mt-4 text-sm text-stage-ink-dim">
                Per <strong>venire a guardare</strong> una lezione e conoscere maestri, bambini e
                ambiente non serve prenotare: basta presentarsi.
              </p>
              <p className="mt-2 text-sm text-stage-ink-dim">
                Per far <strong>provare tuo figlio in sella</strong>, invece, ci accordiamo prima sul
                giorno:{" "}
                <a href="/prova" className="underline underline-offset-2">
                  ecco come prenotare la prova
                </a>
                .
              </p>
```

- [ ] **Step 5: Gate e build**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 6: Verificare il deep link e l'invio reale**

```bash
npm run dev &
sleep 8
curl -s "http://localhost:3000/contatti?motivo=prova" | grep -o 'Lezione di prova' | head -2
```

Atteso: il valore compare fra le opzioni del select.

Poi **inviare davvero il form** dal browser con motivo *Lezione di prova* e verificare che il record arrivi su Airtable. È l'unico modo per accorgersi di un 422 da singleSelect: build, lint e typecheck non lo vedono.

- [ ] **Step 7: Commit**

```bash
git add src/components/contatti/ContactForm.tsx src/app/api/contatti/route.ts src/app/\(public\)/contatti/page.tsx
git commit -m "feat(EVO-046): motivo Lezione di prova e distinzione guardare/provare su /contatti"
```

---

## Task 10 · Emendamento a `PRODUCT.md`

**Files:**
- Modify: `PRODUCT.md`, sezione *Conversion & proof*

**Interfaces:**
- Consumes: niente
- Produces: niente. È il documento di brand allineato a ciò che il sito fa

- [ ] **Step 1: Sostituire le righe della sezione *Conversion & proof***

Sostituire le righe `- Primary CTA:`, `- Secondary CTA:`, `- La riga che un visitatore deve ricordare...` e `- Proof on hand:` con:

```markdown
- Primary CTA: Prenota una prova (gratuita, fino a 2 lezioni)
- Secondary CTA: Iscrivi tuo figlio — per chi ha già deciso. Sempre a un clic, sempre presente nel chrome e accanto alla porta bassa, mai la prima cosa che vede un estraneo.
- Tertiary: Scopri la Scuola / Chi siamo.
- Nota: l'obiettivo di business resta l'iscrizione. La prova è il primo passo del percorso verso l'iscrizione, non un obiettivo alternativo.
- Proof on hand: la lezione di prova È la nostra prova. In assenza di testimonianze, numeri e loghi, l'esperienza diretta è l'unica evidenza che possiamo offrire, e va trattata come tale.
- La riga che un visitatore deve ricordare dopo 10 secondi: *"Qui i bambini iniziano in sicurezza e chi cresce diventa atleta della squadra — e si può venire a provare prima di decidere."*
```

- [ ] **Step 2: Verificare che non resti la vecchia formulazione**

```bash
rg -n "Primary CTA" PRODUCT.md
rg -n "nessuna prova \(testimonianze" PRODUCT.md || echo "vecchia riga sostituita"
```

Atteso: una sola riga `Primary CTA`, ed è quella nuova.

- [ ] **Step 3: Commit**

```bash
git add PRODUCT.md
git commit -m "docs(EVO-046): PRODUCT.md — la prova diventa la CTA primaria dichiarata

L'obiettivo di business resta l'iscrizione: la riga precedente confondeva
obiettivo e CTA."
```

---

## Task 11 · Verifica finale e apertura PR

**Files:** nessuno modificato. È il gate di consegna.

- [ ] **Step 1: Gate completi da pulito**

```bash
rm -rf .next
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 2: Rimisurare la piega sui cinque viewport**

Rieseguire il ciclo del Task 5 passo 6. Tutti e dieci i valori devono essere positivi. Annotarli nella descrizione della PR: sono la promessa che i lavori futuri non devono rompere.

- [ ] **Step 3: Verificare i contrasti sul rendering reale**

```bash
node scripts/dev-shot.mjs / --eval "
  const t=[...document.querySelectorAll('.apex-data, .apex-eyebrow, p')].slice(0,40);
  JSON.stringify(t.map(e=>({txt:e.textContent.trim().slice(0,28), col:getComputedStyle(e).color, size:getComputedStyle(e).fontSize})))
"
```

Nessun testo piccolo significativo deve usare `--stage-faint` (~#4A5480): fallisce AA sul palco scuro. Usare `text-stage-muted`.

- [ ] **Step 4: Verificare `prefers-reduced-motion` e la navigazione da tastiera**

```bash
node scripts/dev-shot.mjs / --eval "
  JSON.stringify([...document.querySelectorAll('a.apex-cta')].map(a=>({href:a.getAttribute('href'), txt:a.textContent.trim()})))
"
```

Atteso: le due porte con `href` `/prova` e `/portale/iscrizioni`. Verificare a mano nel browser che il focus sia visibile su entrambe e che con `prefers-reduced-motion: reduce` il fondale non si animi.

- [ ] **Step 5: Verificare che i tre blocchi non siano partiti**

```bash
echo "Liberatoria della famiglia acquisita?  [ ]"
echo "Luogo dello scatto verificato?         [ ]"
echo "scuola-telefono raggiungibile su WA?   [ ]"
rg -n "Ciclodromo" src/components/home/FotoHero.tsx || echo "OK: nessuna didascalia sul luogo"
```

I primi due sono **bloccanti per il merge in produzione**, non per la PR. Vanno riportati nella descrizione della PR come checklist aperta.

- [ ] **Step 6: Aprire la PR**

```bash
git push -u origin evo/EVO-046-porta-prova
gh pr create --title "EVO-046: la porta della prova" --body "$(cat <<'EOF'
## Cosa cambia

Il sito aveva una sola porta d'ingresso, quella con lo scalino più alto: `Iscrivi tuo figlio`, ripetuto quattro volte in home. Chi voleva solo far provare il figlio non trovava nulla, e apriva l'iscrizione completa. Questa PR aggiunge la porta bassa e sposta i contenuti a scadenza dove possono spegnersi da soli.

- Hero **deterministica**: l'`<h1>` torna a essere il claim di marca e non dipende più dalle campagne Airtable
- Due porte dichiarate a parole, ognuna col proprio prezzo d'ingresso
- Nuova pagina `/prova` con la consegna a WhatsApp e le alternative
- **Fascia di regia** al posto di `HomeTicker`, che annunciava ancora una gara del 28 giugno
- Le comunicazioni Airtable scendono dalla hero allo slot eventi, che scade per data
- Blocco «Cosa mettiamo noi»: comodato della bici da corsa e area riservata
- `/contatti` distingue il venire a guardare dal provare in sella
- `PRODUCT.md` emendato: la prova è la CTA primaria, l'iscrizione resta l'obiettivo

## Margini della piega misurati

[inserire i dieci valori del passo 2]

## Bloccante prima del merge in produzione

- [ ] Liberatoria della famiglia del bambino ritratto
- [ ] Verifica del luogo dello scatto (finché è aperta, nessuna didascalia nomina il ciclodromo)
- [ ] Conferma che `scuola-telefono` sia raggiungibile su WhatsApp

## Note

Nessun test automatico: il progetto non ha un test runner su `src/`. Verifica su lint, typecheck, build, HTML renderizzato e screenshot.

Spec: `docs/superpowers/specs/2026-08-06-messaggio-home-triono-design.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Fuori scope, per le evolutive successive

- **Seconda evolutiva:** sovrapposizione di Narni Sport Night sullo slot ① nella finestra 1–19 settembre.
- **Terza evolutiva:** allineamento delle CTA su `CtaScuola` e valutazione di una prop `variant` su `CtaFinale` — che è condivisa da home, `/chi-siamo` e `/gli-amatori-triono` e **non può** parlare di bambini o di prova.
