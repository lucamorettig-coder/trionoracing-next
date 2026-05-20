import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Aspect = "video" | "square" | "portrait" | "wide";
type Tone = "light" | "dark";

interface PhotoPlaceholderProps {
  aspect?: Aspect;
  tone?: Tone;
  caption: string;
  description: string;
  className?: string;
}

const aspectClass: Record<Aspect, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[21/9]",
};

const aspectLabel: Record<Aspect, string> = {
  video: "16:9",
  square: "1:1",
  portrait: "4:5",
  wide: "21:9",
};

/**
 * Card placeholder per foto mancanti. Mostra cosa dovrebbe esserci al posto della foto:
 * pattern brand di sfondo + caption + description + ratio. Sostituire con <Image> quando
 * la foto reale è disponibile.
 */
export function PhotoPlaceholder({
  aspect = "video",
  tone = "light",
  caption,
  description,
  className,
}: PhotoPlaceholderProps) {
  const isDark = tone === "dark";
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center text-center px-6",
            aspectClass[aspect],
            isDark ? "pattern-navy bg-navy-900" : "pattern-light bg-bg-soft",
          )}
        >
          <div className="relative z-10 max-w-[480px]">
            <div
              className={cn(
                "font-mono text-[11px] tracking-[0.2em] uppercase mb-3",
                isDark ? "text-white/55" : "text-navy-700/60",
              )}
            >
              Foto da inserire · {aspectLabel[aspect]}
            </div>
            <div
              className={cn(
                "font-bold text-lg leading-tight",
                isDark ? "text-white" : "text-navy-900",
              )}
            >
              {caption}
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-relaxed",
                isDark ? "text-white/70" : "text-ink-muted",
              )}
            >
              {description}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
