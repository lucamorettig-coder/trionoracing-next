import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody } from "@/components/ui/card";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

export function SezioneAmatori() {
  return (
    <section className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="La squadra"
            title="Gli amatori Triono Racing."
            subtitle="Una comunità di ciclisti adulti che condividono allenamenti, gare e l'orgoglio di una maglia. Rispetto reciproco, sportività, voglia di sfide vere."
            cta={{ label: "Scopri la squadra", href: "/gli-amatori-triono" }}
          />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <Card variant="accent" className="reveal reveal-delay-1">
            <CardContent>
              <div className="text-sun-500 text-[12px] font-bold uppercase tracking-[0.15em] mb-3">
                Agonisti
              </div>
              <CardTitle className="text-white">Gare regionali e nazionali.</CardTitle>
              <CardBody className="text-white/70">
                Calendario gare, allenamenti programmati, supporto tecnico. Per chi pedala con un obiettivo agonistico.
              </CardBody>
            </CardContent>
          </Card>
          <Card variant="accent" className="reveal reveal-delay-2">
            <CardContent>
              <div className="text-sun-500 text-[12px] font-bold uppercase tracking-[0.15em] mb-3">
                Amatori
              </div>
              <CardTitle className="text-white">Pedalare in compagnia.</CardTitle>
              <CardBody className="text-white/70">
                Uscite di gruppo, MTB e strada, gite, eventi. La squadra come comunità di pari, non solo come team.
              </CardBody>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 reveal reveal-delay-3">
          <PhotoPlaceholder
            aspect="wide"
            caption="Squadra Triono Racing al traguardo"
            description="Foto di gruppo del team amatori con maglia ufficiale, in occasione di una gara o di un raduno. Orientamento ultra-wide 21:9 per dare respiro panoramico."
          />
        </div>
      </div>
    </section>
  );
}
