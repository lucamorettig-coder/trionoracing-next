# components/ui — Triono Racing

10 componenti pronti per Next.js 15 + Tailwind v4 + shadcn/ui + TypeScript.

## Setup minimo nel repo target

```bash
pnpm add class-variance-authority clsx tailwind-merge lucide-react
pnpm add @radix-ui/react-slot
# Per Clerk:
pnpm add @clerk/nextjs
```

Copia in `components/ui/`:

| File | Componente |
|---|---|
| `button.tsx` | `<Button/>` con variante A (default) + variante B "hero" pill |
| `card.tsx` | `<Card/>`, `<CardIcon/>`, `<CardHeader/>`, `<CardTitle/>`, `<CardBody/>`, `<CardContent/>`, `<CardFooter/>` |
| `hero.tsx` | `<Hero/>` con `variant="video"` o `"pattern"` |
| `navbar.tsx` | `<NavBar/>` sticky + mobile drawer |
| `footer.tsx` | `<Footer/>` con pattern di sfondo + newsletter |
| `form.tsx` | `<FormField/>`, `<Label/>`, `<Input/>`, `<Textarea/>`, `<Select/>`, `<Checkbox/>`, `<Radio/>`, `<FormHelper/>`, `<FormError/>` |
| `news-card.tsx` | `<NewsCard/>` per griglia news |
| `badge.tsx` | `<Badge/>` con 7 varianti |
| `section-header.tsx` | `<SectionHeader/>` opener di sezione |
| `icons.tsx` | Icone custom Triono + re-export Lucide |

Inoltre:

- `lib/utils.ts` — utility `cn()` (shadcn standard)
- `lib/clerk-appearance.ts` — appearance config per Clerk
- `styles/theme.css` — blocco `@theme` di Tailwind v4 con tutti i token

## Assets richiesti in `/public/assets/`

```
public/
  assets/
    logo-triono-racing.png
    logo-scuola.png
    pattern.svg          ← già fornito
    pattern-light.svg    ← già fornito
```

## Esempio composizione (home, sketch)

```tsx
import { NavBar } from "@/components/ui/navbar";
import { Hero } from "@/components/ui/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardIcon, CardTitle, CardBody, CardContent } from "@/components/ui/card";
import { NewsCard } from "@/components/ui/news-card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { HelmetIcon, WheelIcon, MedalIcon } from "@/components/ui/icons";

export default function HomePage() {
  return (
    <>
      <NavBar />

      <main>
        <Hero
          variant="video"
          videoSrc="/hero.mp4"
          posterSrc="/hero-poster.jpg"
          eyebrow="Scuola di Ciclismo · A.S.D. Triono Racing"
          title={<>In bici, sicuri,<br/>insieme.</>}
          subtitle="Maestri federali, gruppi piccoli per età, attenzione totale alla sicurezza. Dai 6 ai 16 anni."
          primaryCta={{ label: "Iscrivi tuo figlio", href: "/iscrizioni" }}
          secondaryCta={{ label: "Scopri la Scuola", href: "/scuola" }}
        />

        <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <SectionHeader
            eyebrow="Scuola di Ciclismo"
            title="Imparare in sella, in tutta sicurezza."
            subtitle="Lezioni guidate da maestri federali, gruppi piccoli per età."
            cta={{ label: "Vedi tutti i gruppi", href: "/scuola" }}
          />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Card>
              <CardContent>
                <CardIcon><HelmetIcon /></CardIcon>
                <CardTitle>Sicurezza prima di tutto</CardTitle>
                <CardBody>Casco, ginocchiere e supervisione costante in ogni allenamento.</CardBody>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <CardIcon color="sky"><WheelIcon /></CardIcon>
                <CardTitle>Tecnica progressiva</CardTitle>
                <CardBody>Equilibrio, frenata, curva, salto. Programma per fasce d'età.</CardBody>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <CardIcon color="sun"><MedalIcon /></CardIcon>
                <CardTitle>Spirito di squadra</CardTitle>
                <CardBody>Gare, eventi, gite. Crescere in bici insieme agli amici.</CardBody>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* News */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <SectionHeader
            eyebrow="News & Aggiornamenti"
            title="Cosa succede in squadra"
            align="center"
          />
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <NewsCard
              cover="/news/iscrizioni.jpg"
              category="Scuola"
              categoryVariant="info"
              title="Aperte le iscrizioni alla Scuola 2026/27"
              date="2026-09-12"
              excerpt="Posti limitati per garantire qualità delle lezioni."
              href="/news/iscrizioni-2026"
            />
            {/* … */}
          </div>
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <a href="/news">Tutte le news</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
```
