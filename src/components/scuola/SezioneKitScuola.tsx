import Image from "next/image";
import { KIT_SCUOLA, cloudinaryOptimized, type CapoKit } from "@/lib/kit-scuola";

function PillNumero({ capo }: { capo: CapoKit }) {
  const numero = String(capo.numero).padStart(2, "0");
  return (
    <div className="absolute -bottom-3 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[var(--shadow-sm)]">
      <span className="font-mono text-xs text-ink-muted">{numero}</span>
      <span className="text-sm font-semibold text-ink">{capo.nome}</span>
    </div>
  );
}

function CardCapo({
  capo,
  sizesAttr,
  className = "",
}: {
  capo: CapoKit;
  sizesAttr: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[var(--radius-xl)] bg-bg-soft shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] ${className}`}
    >
      <div className="relative aspect-[3/4] w-full p-8 lg:p-10">
        <div className="relative h-full w-full">
          <Image
            src={cloudinaryOptimized(capo.imageUrl, 1000)}
            alt={capo.alt}
            fill
            className="object-contain"
            sizes={sizesAttr}
          />
        </div>
      </div>
      <PillNumero capo={capo} />
    </div>
  );
}

export function SezioneKitScuola() {
  const [maglia, salopette, felpa, pantalone] = KIT_SCUOLA;

  return (
    <section className="bg-white py-16 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Top block — header */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto] lg:gap-12 mb-12 lg:mb-16">
          <div className="reveal">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-500">
              Il kit del team
            </p>
            <h2 className="mt-3 text-5xl font-bold leading-[1.05] tracking-tight text-navy-900 lg:text-6xl xl:text-7xl">
              Vesti i colori.
              <br />
              Senti la squadra.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-muted">
              Quattro capi che vanno dalla pedalata alla merenda. Il kit Triono è
              incluso nell&apos;iscrizione — riconoscibile da lontano in gruppo, come
              davanti al bar dopo la lezione.
            </p>
          </div>

          <div className="reveal reveal-delay-1 space-y-1 font-mono text-xs text-ink-muted lg:text-right">
            <p className="font-semibold text-ink">Kit Scuola 2026</p>
            <p>04 capi</p>
            <p>1 identità</p>
            <p>ASD CIEMME — Terni</p>
          </div>
        </div>

        {/* Bottom block — card capi */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Colonna sinistra: maglia dominante + manifesto navy */}
          <div className="flex flex-col gap-6">
            <div className="reveal reveal-delay-2">
              <CardCapo
                capo={maglia}
                sizesAttr="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="reveal reveal-delay-3 relative overflow-hidden rounded-[var(--radius-xl)] bg-navy-900 text-white">
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-[position:center_bottom] bg-no-repeat"
                style={{ backgroundImage: "url('/assets/footer-bg.jpg')" }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(5,14,63,0.82) 0%, rgba(5,14,63,0.90) 60%, rgba(5,14,63,0.96) 100%)",
                }}
              />
              <div className="relative z-10 p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                  — Il senso del kit
                </p>
                <p className="mt-4 text-xl font-semibold leading-snug lg:text-2xl">
                  Quando indossi i colori del team,{" "}
                  <span className="text-sun-500">sei già parte</span> di Triono.
                </p>
              </div>
            </div>
          </div>

          {/* Colonna destra: salopette full + felpa/pantalone affiancati */}
          <div className="flex flex-col gap-6">
            <div className="reveal reveal-delay-2">
              <CardCapo
                capo={salopette}
                sizesAttr="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="grid grid-cols-[55fr_45fr] gap-6">
              <div className="reveal reveal-delay-3">
                <CardCapo
                  capo={felpa}
                  sizesAttr="(max-width: 1024px) 55vw, 28vw"
                />
              </div>
              <div className="reveal reveal-delay-4">
                <CardCapo
                  capo={pantalone}
                  sizesAttr="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
