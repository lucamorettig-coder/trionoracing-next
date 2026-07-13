import Image from "next/image";
import { KIT_SCUOLA, cloudinaryOptimized, type CapoKit } from "@/lib/kit-scuola";
import { SectionLap } from "@/components/apex/SectionLap";
import { StageScene } from "@/components/apex/StageScene";

/**
 * Tag mono con numero + nome capo — variante "PillNumero" per il palco APEX:
 * bg-accent (giallo elettrico livrea Scuola) + ink scuro fisso #04091c,
 * stesso pairing di .apex-cta--primary/.apex-sticker/.apex-toppa in apex.css.
 * Overlay sul bordo inferiore della card, come nel DS v0.1.
 */
function PillNumero({ capo }: { capo: CapoKit }) {
  const numero = String(capo.numero).padStart(2, "0");
  return (
    <div className="absolute -bottom-3 left-5 right-5 inline-flex w-fit max-w-[calc(100%-2.5rem)] items-center gap-2 bg-accent px-3 py-1.5 text-[#04091c] shadow-[var(--shadow-oggetti)]">
      <span className="shrink-0 font-mono text-[11px] font-bold tracking-[0.08em]">{numero}</span>
      <span className="min-w-0 text-[11px] font-semibold uppercase leading-tight tracking-wide">{capo.nome}</span>
    </div>
  );
}

/**
 * Card capo kit — superficie CALDA (.apex-card--warm) che fa galleggiare il
 * prodotto scontornato sullo stage scuro: i capi restano leggibili (erano su
 * bg-bg-soft chiaro nel DS v0.1). Padding azzerato via inline style perché
 * .apex-card imposta `padding: var(--space-6)` come regola CSS unlayered —
 * più prioritaria di qualunque utility Tailwind (p-0) sullo stesso elemento;
 * l'inline style è l'unico override affidabile senza toccare apex.css.
 */
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
    // Superficie BIANCA (non avorio): i capi hanno fondo bianco puro → su bianco
    // si fondono senza stacco/bordo. mix-blend-multiply assorbe eventuali micro
    // ombre nel bianco della card. Barretta accento in alto per firmare la card.
    // NIENTE overflow-hidden: il pill numero+nome sporge a -bottom-3 e verrebbe
    // mozzato a metà (bug segnalato in EVO-041).
    <div className={`relative bg-white ${className}`.trim()}>
      <span className="absolute left-0 top-0 z-10 h-[3px] w-11 bg-accent" aria-hidden="true" />
      <div className="relative aspect-[3/4] w-full p-8 lg:p-10">
        <div className="relative h-full w-full">
          <Image
            src={cloudinaryOptimized(capo.imageUrl, 1000)}
            alt={capo.alt}
            fill
            className="object-contain mix-blend-multiply"
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
    <StageScene data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        {/* Top block — header: SectionLap + colonna meta mono */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto] lg:gap-12 mb-10 lg:mb-14">
          <div className="reveal">
            <SectionLap
              numero="04"
              label="IL KIT DEL TEAM"
              title={
                <>
                  Vesti i colori.
                  <br />
                  <span className="accent-word">Senti la squadra.</span>
                </>
              }
            />
            <p className="-mt-6 max-w-[52ch] text-stage-muted">
              Quattro capi che vanno dalla pedalata alla merenda. Il kit Triono è
              incluso nell&apos;iscrizione, riconoscibile da lontano in gruppo, come
              davanti al bar dopo la lezione.
            </p>
          </div>

          <div className="reveal reveal-delay-1 lg:text-right">
            <p className="apex-eyebrow">Kit Scuola 2026 · 04 capi · 1 identità</p>
            <p className="mt-1 apex-data text-stage-faint">ASD CIEMME · Terni</p>
          </div>
        </div>

        {/* Bottom block — card capi */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Colonna sinistra: maglia dominante + manifesto navy */}
          <div className="flex flex-col gap-6">
            <div className="reveal-slide reveal-delay-2">
              <CardCapo
                capo={maglia}
                sizesAttr="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="reveal reveal-delay-3 relative flex overflow-hidden border border-stage-line bg-stage-navy">
              <span className="absolute left-0 top-0 h-[3px] w-11 bg-accent-2" aria-hidden="true" />
              <div className="relative w-[38%] min-w-[120px] shrink-0 self-end aspect-[3/4]" aria-hidden="true">
                <Image
                  src="/vittoria/vittoria-stand.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 38vw, 200px"
                  className="object-contain object-bottom"
                />
              </div>
              <div className="flex-1 p-6 lg:p-7">
                <p className="apex-eyebrow text-accent mb-3">Il senso del kit</p>
                <p className="mt-3 text-lg font-semibold leading-snug text-stage-ink lg:text-xl">
                  Quando indossi i colori,{" "}
                  <span className="text-accent">sei già parte</span> di Triono.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-stage-muted">
                  Vittoria e Nino lo portano a ogni lezione. È lo stesso kit che riceverà tuo figlio.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["04 capi", "1 identità", "Incluso nell'iscrizione"].map((c) => (
                    <span
                      key={c}
                      className="apex-data inline-flex items-center border border-stage-line-soft bg-stage-surface px-3 py-1 text-[11px] text-stage-ink-dim"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonna destra: salopette full + felpa/pantalone affiancati */}
          <div className="flex flex-col gap-6">
            <div className="reveal-slide reveal-delay-2">
              <CardCapo
                capo={salopette}
                sizesAttr="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="grid grid-cols-[55fr_45fr] gap-6">
              <div className="reveal-slide reveal-delay-3">
                <CardCapo
                  capo={felpa}
                  sizesAttr="(max-width: 1024px) 55vw, 28vw"
                />
              </div>
              <div className="reveal-slide reveal-delay-4">
                <CardCapo
                  capo={pantalone}
                  sizesAttr="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StageScene>
  );
}
