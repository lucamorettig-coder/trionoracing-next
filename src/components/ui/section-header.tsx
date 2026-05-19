"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SectionHeader — Triono Racing
 *
 * Eyebrow + h2 + subtitle (opzionale) + CTA inline (opzionale).
 * Allineamento left (default) o center.
 */
export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
  /** size del titolo. "lg" è default per opener di sezione, "md" per intra-sezione */
  size?: "md" | "lg";
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  cta,
  align = "left",
  className,
  size = "lg",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  return (
    <header
      className={cn(
        "w-full",
        isCenter ? "text-center" : "flex items-end justify-between flex-wrap gap-6",
        className
      )}
    >
      <div className={cn(isCenter ? "mx-auto max-w-[640px]" : "max-w-[640px]")}>
        {eyebrow && (
          <div
            className={cn(
              "inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-sky-600",
              "before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block"
            )}
          >
            {eyebrow}
          </div>
        )}
        <h2
          className={cn(
            "mt-4 font-bold tracking-tight text-ink",
            size === "lg"
              ? "text-[32px] lg:text-[48px] leading-[1.05]"
              : "text-[24px] lg:text-[32px] leading-[1.15]"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-5 text-ink-muted",
              size === "lg" ? "text-[17px]" : "text-[15px]",
              "leading-relaxed"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {cta && !isCenter && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 font-semibold text-sky-600 hover:text-navy-700 transition-colors"
        >
          {cta.label} <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {cta && isCenter && (
        <div className="mt-6 flex justify-center">
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 font-semibold text-sky-600 hover:text-navy-700 transition-colors"
          >
            {cta.label} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}

/* Esempio
<SectionHeader
  eyebrow="Scuola di Ciclismo"
  title="Imparare in sella, in tutta sicurezza."
  subtitle="Lezioni guidate da maestri federali, gruppi piccoli per età."
  cta={{ label: "Vedi tutti i gruppi", href: "/scuola" }}
  align="left"
/>
*/
