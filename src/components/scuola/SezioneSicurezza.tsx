import Image from "next/image";
import { StageScene } from "@/components/apex/StageScene";
import { SectionLap } from "@/components/apex/SectionLap";
import { Toppa } from "@/components/apex/propkit/scuola/Toppa";
import { Doodle } from "@/components/apex/propkit/scuola/Doodle";

/**
 * Sezione "Sicurezza in sella" — APEX DS v2, livrea Scuola (EVO-039).
 * Cinque dotazioni mostrate da Vittoria (cutout su card calda `apex-card--warm`,
 * leggibile sul palco scuro) + bolla finale di Nino. Cartoleria S2 (Toppa +
 * Doodle) come accenti decorativi intorno alle dotazioni.
 * Server Component — entrate via `.reveal` CSS.
 */

type Dotazione = {
  n: number;
  img: string;
  nome: string;
  desc: string;
};

const DOTAZIONI: Dotazione[] = [
  {
    n: 1,
    img: "/vittoria/vittoria-casco.webp",
    nome: "Casco",
    desc: "Sempre allacciato, anche per un giro corto. È la regola numero uno della scuola.",
  },
  {
    n: 2,
    img: "/vittoria/vittoria-occhiali.webp",
    nome: "Occhiali",
    desc: "Riparano gli occhi da sole, vento, insetti e polvere. Sguardo sempre sulla strada.",
  },
  {
    n: 3,
    img: "/vittoria/vittoria-guanti.webp",
    nome: "Guanti",
    desc: "Presa più sicura sul manubrio e mani protette in caso di caduta.",
  },
  {
    n: 4,
    img: "/vittoria/vittoria-borraccia.webp",
    nome: "Borraccia",
    desc: "Bere spesso, anche prima di avere sete. Sempre a portata di mano.",
  },
  {
    n: 5,
    img: "/vittoria/vittoria-luci.webp",
    nome: "Luci",
    desc: "Visibili davanti e dietro nelle ore di poca luce. Farsi vedere è metà della sicurezza.",
  },
];

export function SezioneSicurezza() {
  return (
    <StageScene id="sicurezza" data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <div className="reveal max-w-[780px] relative">
          <Toppa className="absolute -top-2 right-0 hidden sm:block">Dai 4 anni</Toppa>
          <SectionLap
            numero="06"
            label="SICUREZZA IN SELLA"
            title={
              <>
                Pronti a pedalare: <span className="accent-word">cosa serve per andare sicuri.</span>
              </>
            }
          />
        </div>
        <p className="reveal -mt-6 mb-12 max-w-[62ch] text-stage-muted">
          Vittoria e Nino mostrano l&apos;equipaggiamento, uno alla volta. Cinque cose semplici che
          rendono ogni uscita più sicura — e più divertente.
        </p>

        <div className="relative">
          <Doodle variant="stella" className="hidden lg:block absolute -top-8 left-[18%]" />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
            {DOTAZIONI.map((d, i) => (
              <article
                key={d.n}
                className={`apex-card apex-card--warm apex-card--photo reveal-slide reveal-delay-${Math.min(i + 1, 6)} flex flex-col`}
              >
                {/* .apex-card--photo forza background: var(--stage-navy) sul box foto
                    (pensato per foto reali in duotone) — qui il cutout Vittoria ha
                    bisogno della superficie CHIARA warm per restare leggibile, quindi
                    lo style inline (specificità massima) sovrascrive il navy con lo
                    stesso avorio di .apex-card--warm. */}
                <div
                  className="apex-card__photo relative"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <Image
                    src={d.img}
                    alt={`Vittoria mostra ${d.nome.toLowerCase()}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 220px"
                    className="object-contain object-bottom p-3"
                  />
                </div>
                <div className="apex-card__body flex flex-col">
                  {/* font-size inline: batte la regola unlayered .apex-card h3
                      (fs-h3 ~30px) che tagliava "OCCHIALI"/"BORRACCIA" sulla
                      larghezza card. min-w-0 permette il wrap se serve. */}
                  <h3 className="flex items-center gap-2.5 min-w-0" style={{ fontSize: "1.125rem", lineHeight: 1.1 }}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold bg-accent text-[#04091c]">
                      {d.n}
                    </span>
                    <span className="min-w-0">{d.nome}</span>
                  </h3>
                  <p className="text-[13px] leading-relaxed">{d.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bolla finale di Nino */}
        <div className="reveal mt-10 flex items-end justify-center gap-0">
          <div className="relative hidden sm:block w-[110px] shrink-0 aspect-[3/4] -mr-4 z-10 self-end">
            <Image
              src="/nino/nino-casco.webp"
              alt=""
              aria-hidden
              fill
              sizes="110px"
              className="object-contain object-bottom drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)]"
            />
          </div>
          <div className="relative max-w-[560px] bg-accent px-7 py-5 text-center shadow-[var(--shadow-oggetti)]">
            <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#04091c]/70 mb-1.5">
              Nino dice
            </span>
            <p className="text-[18px] font-semibold leading-snug text-[#04091c]">
              Il casco prima di tutto, sempre! Poi controlliamo il resto e siamo pronti a partire.
            </p>
          </div>
        </div>
      </div>
    </StageScene>
  );
}
