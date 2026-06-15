import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * Sezione "Sicurezza in sella" (nuova — EVO-029).
 * Cinque dotazioni mostrate da Vittoria (cutout su tinta brand) + bolla finale di
 * Nino. Sfondo pulito per fare stacco con "Allenarsi a casa" (che è una band).
 * Server Component — entrate via `.reveal` CSS.
 */

type Dotazione = {
  n: number;
  img: string;
  nome: string;
  desc: string;
  imgBg: string; // tinta dietro il cutout
  badge: string; // colore badge numero
};

const DOTAZIONI: Dotazione[] = [
  {
    n: 1,
    img: "/vittoria/vittoria-casco.webp",
    nome: "Casco",
    desc: "Sempre allacciato, anche per un giro corto. È la regola numero uno della scuola.",
    imgBg: "bg-sun-50",
    badge: "bg-sun-600",
  },
  {
    n: 2,
    img: "/vittoria/vittoria-occhiali.webp",
    nome: "Occhiali",
    desc: "Riparano gli occhi da sole, vento, insetti e polvere. Sguardo sempre sulla strada.",
    imgBg: "bg-sky-50",
    badge: "bg-sky-500",
  },
  {
    n: 3,
    img: "/vittoria/vittoria-guanti.webp",
    nome: "Guanti",
    desc: "Presa più sicura sul manubrio e mani protette in caso di caduta.",
    imgBg: "bg-navy-50",
    badge: "bg-navy-700",
  },
  {
    n: 4,
    img: "/vittoria/vittoria-borraccia.webp",
    nome: "Borraccia",
    desc: "Bere spesso, anche prima di avere sete. Sempre a portata di mano.",
    imgBg: "bg-grass-50",
    badge: "bg-grass-500",
  },
  {
    n: 5,
    img: "/vittoria/vittoria-luci.webp",
    nome: "Luci",
    desc: "Visibili davanti e dietro nelle ore di poca luce. Farsi vedere è metà della sicurezza.",
    imgBg: "bg-ember-50",
    badge: "bg-ember-500",
  },
];

export function SezioneSicurezza() {
  return (
    <section id="sicurezza" className="relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal max-w-[780px]">
          <SectionHeader
            eyebrow={<span className="text-navy-600">Sicurezza in sella</span>}
            title={
              <>
                Pronti a pedalare: <span className="text-sky-500">cosa serve per andare sicuri.</span>
              </>
            }
            subtitle="Vittoria e Nino mostrano l'equipaggiamento, uno alla volta. Cinque cose semplici che rendono ogni uscita più sicura — e più divertente."
          />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
          {DOTAZIONI.map((d, i) => (
            <article
              key={d.n}
              className={`reveal reveal-delay-${Math.min(i + 1, 6)} flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white shadow-[var(--shadow-sm)]`}
            >
              <div className={`relative aspect-square ${d.imgBg}`}>
                <Image
                  src={d.img}
                  alt={`Vittoria mostra ${d.nome.toLowerCase()}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 220px"
                  className="object-contain object-bottom p-3"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-[17px] font-bold text-navy-900">
                  <span
                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white ${d.badge}`}
                  >
                    {d.n}
                  </span>
                  {d.nome}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Bolla finale di Nino */}
        <div className="reveal mt-10 flex items-end justify-center gap-0">
          <div className="relative hidden sm:block w-[110px] shrink-0 aspect-[3/4] -mr-4 z-10 self-end">
            <Image
              src="/nino/nino-occhiali.webp"
              alt=""
              aria-hidden
              fill
              sizes="110px"
              className="object-contain object-bottom drop-shadow-[0_14px_18px_rgba(5,14,63,0.18)]"
            />
          </div>
          <div className="relative max-w-[560px] rounded-[var(--radius-xl)] bg-sun-500 px-7 py-5 text-center shadow-[var(--shadow-md)]">
            <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-sun-700 mb-1.5">
              Nino dice
            </span>
            <p className="text-[18px] font-semibold leading-snug text-navy-900">
              Il casco prima di tutto, sempre! Poi controlliamo il resto e siamo pronti a partire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
