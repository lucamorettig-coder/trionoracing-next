import { HeroCampagne } from "@/components/home/HeroCampagne";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { getComunicazioniHeroAttive } from "@/lib/comunicazioni-hero";
import { StageScene } from "@/components/apex/StageScene";
import { StageProp } from "@/components/apex/StageProp";
import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { ApexCta } from "@/components/apex/ApexCta";
import { Hud } from "@/components/apex/Hud";
import { TelemetriaGhost, Waveform } from "@/components/apex/propkit/TelemetriaGhost";
import { TargaDorsale } from "@/components/apex/propkit/TargaDorsale";

export async function HomeHero() {
  // Sfondo video (slot "home-hero") e comunicazioni/campagne attive (EVO-035)
  // sono indipendenti: fetch in parallelo, no waterfall.
  const [sfondo, comunicazioni] = await Promise.all([
    getSfondoVideo("home-hero"),
    getComunicazioniHeroAttive(),
  ]);

  const videoSrc = sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined;

  // 0 comunicazioni attive → hero statica APEX (stats incluse come HUD).
  // N≥1 → hero dinamica multi-campagna (meccanica EVO-035, reskin APEX).
  if (comunicazioni.length > 0) {
    return (
      <HeroCampagne comunicazioni={comunicazioni} videoSrc={videoSrc} posterSrc={sfondo?.posterUrl} />
    );
  }

  return (
    <StageScene className="min-h-[86vh] flex items-center">
      {/* L−2 Fondale vivo (video Airtable trattato) o fondale statico */}
      <FondaleVivo src={videoSrc} poster={sfondo?.posterUrl} />

      {/* L−1 Scenografia: telemetria ghost + waveform */}
      <StageProp level="sceno" anchor={{ right: "-2%", top: "10%", opacity: 0.9 }}>
        <TelemetriaGhost value="54 KM/H" />
      </StageProp>
      <StageProp level="sceno" anchor={{ left: "2%", bottom: "12%", width: "min(420px, 40vw)" }}>
        <Waveform seed={0.4} />
      </StageProp>

      {/* L+1 Oggetto di scena: targa dorsale (nascosta su mobile — budget 1 prop) */}
      <StageProp level="oggetti" anchor={{ right: "8%", bottom: "18%" }} mobileHide float>
        <TargaDorsale numero="11" />
      </StageProp>

      {/* L0 Pista: contenuto (SACRO) */}
      <div className="apex-wrap relative w-full py-24" style={{ zIndex: "var(--z-pista)" }}>
        <div className="apex-lap__eyebrow apex-eyebrow reveal">
          <span className="apex-lap__num">TRIONO RACING</span>
          <span className="apex-lap__rule" aria-hidden />
          <span className="live">DAL 2015 · TERNI</span>
        </div>
        <h1
          className="apex-display mt-5 max-w-[15ch]"
          style={{ fontSize: "var(--fs-hero)", lineHeight: "var(--lh-hero)" }}
        >
          <span className="reveal">In bici,</span>{" "}
          <span className="stroke-word reveal reveal-delay-1">sicuri,</span>
          <br />
          <span className="accent-word reveal reveal-delay-2">insieme.</span>
        </h1>
        <p className="reveal reveal-delay-2 mt-6 max-w-[52ch] text-stage-ink-dim" style={{ fontSize: "var(--fs-body-lg)" }}>
          Una scuola di ciclismo per bambini a partire da 4 anni di età, guidata da maestri
          federali. Strada e mountain bike, due volte a settimana, al Ciclodromo Renato Perona
          di Terni.
        </p>
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
          <ApexCta href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
          <ApexCta href="/la-scuola" variant="ghost">
            Scopri la Scuola
          </ApexCta>
        </div>

        {/* Stats reali → celle HUD statiche (niente random-walk su dati veri) */}
        <div className="reveal reveal-delay-4 mt-12 max-w-[640px]">
          <Hud
            decorative={false}
            metriche={[
              { key: "anni", label: "Anni di squadra", value: 11, live: true },
              { key: "maestri", label: "Maestri federali", value: 5 },
              { key: "scuola", label: "Anni di Scuola", value: 4 },
              { key: "edizioni", label: "Edizioni 209", value: 6 },
            ]}
          />
        </div>
      </div>
    </StageScene>
  );
}
