import { Button } from "@/components/ui/button";
import {
  Card,
  CardIcon,
  CardTitle,
  CardBody,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Hero } from "@/components/ui/hero";
import { NavBar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { NewsCard } from "@/components/ui/news-card";
import {
  FormField,
  Label,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  FormHelper,
  FormError,
} from "@/components/ui/form";
import { HelmetIcon, WheelIcon, MedalIcon } from "@/components/ui/icons";

export const metadata = {
  title: "DS Playground — Triono Racing",
  robots: { index: false, follow: false },
};

export default function ComponentsDevPage() {
  return (
    <>
      <NavBar />
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 space-y-24">
        <SectionHeader
          eyebrow="DEV · Playground"
          title="Design System Triono — Component Showcase"
          subtitle="Pagina di test interna. Non linkare in produzione."
        />

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="hero">Hero pill</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Badge</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge>Default</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="sun">Sun</Badge>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Card</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Card>
              <CardContent>
                <CardIcon>
                  <HelmetIcon />
                </CardIcon>
                <CardTitle>Sicurezza prima di tutto</CardTitle>
                <CardBody>
                  Casco e supervisione costante in ogni allenamento.
                </CardBody>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <CardIcon color="sky">
                  <WheelIcon />
                </CardIcon>
                <CardTitle>Tecnica progressiva</CardTitle>
                <CardBody>
                  Equilibrio, frenata, curva. Programma per età.
                </CardBody>
              </CardContent>
            </Card>
            <Card variant="accent">
              <CardContent>
                <CardIcon color="sun">
                  <MedalIcon />
                </CardIcon>
                <CardTitle>Spirito di squadra</CardTitle>
                <CardBody>Gare, eventi, gite. Crescere insieme.</CardBody>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form primitives */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Form</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <FormField>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" placeholder="tua@email.it" />
              <FormHelper>Solo per comunicazioni iscrizione.</FormHelper>
            </FormField>
            <FormField>
              <Label htmlFor="email-err" required>
                Email (errore)
              </Label>
              <Input
                id="email-err"
                type="email"
                error
                defaultValue="non-valida"
              />
              <FormError>Inserisci un indirizzo valido.</FormError>
            </FormField>
            <FormField>
              <Label htmlFor="bio">Note</Label>
              <Textarea id="bio" placeholder="Note libere..." />
            </FormField>
            <FormField>
              <Label htmlFor="livello">Livello</Label>
              <Select id="livello" defaultValue="">
                <option value="" disabled>
                  Seleziona...
                </option>
                <option value="base">Base</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzato">Avanzato</option>
              </Select>
            </FormField>
            <div className="flex gap-3 items-center">
              <Checkbox id="agree" />
              <Label htmlFor="agree">Accetto i termini</Label>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Radio name="size" id="s" value="s" defaultChecked />
                <Label htmlFor="s">S</Label>
              </div>
              <div className="flex gap-2 items-center">
                <Radio name="size" id="m" value="m" />
                <Label htmlFor="m">M</Label>
              </div>
              <div className="flex gap-2 items-center">
                <Radio name="size" id="l" value="l" />
                <Label htmlFor="l">L</Label>
              </div>
            </div>
          </div>
        </section>

        {/* News cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">NewsCard</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <NewsCard
              cover="/assets/pattern.svg"
              category="Scuola"
              categoryVariant="info"
              title="Aperte le iscrizioni alla Scuola 2026/27"
              date="2026-09-12"
              excerpt="Posti limitati per garantire qualità delle lezioni."
              href="#"
            />
            <NewsCard
              cover="/assets/pattern.svg"
              category="Gara"
              categoryVariant="warning"
              title="Marathon MTB 209 — iscrizioni aperte"
              date="2026-08-01"
              excerpt="L'evento dell'anno torna a settembre."
              href="#"
            />
            <NewsCard
              cover="/assets/pattern.svg"
              category="News"
              title="Nuovi corsi per i più piccoli"
              date="2026-07-15"
              excerpt="Programma dedicato ai 6-8 anni."
              href="#"
            />
          </div>
        </section>

        {/* Hero pattern */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Hero (pattern variant)</h2>
          <Hero
            variant="pattern"
            eyebrow="A.S.D. Triono Racing"
            title={
              <>
                In bici, sicuri,
                <br />
                insieme.
              </>
            }
            subtitle="Maestri federali, gruppi piccoli per età."
            primaryCta={{ label: "Iscrivi tuo figlio", href: "#" }}
            secondaryCta={{ label: "Scopri la Scuola", href: "#" }}
            stats={[
              { value: "18", label: "anni di scuola", highlight: true },
              { value: "9", label: "maestri federali" },
              { value: "120+", label: "iscritti 2026" },
              { value: "45", label: "gare nel 2026" },
            ]}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
