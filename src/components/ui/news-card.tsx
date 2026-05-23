"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, type BadgeVariant } from "./badge";

/**
 * NewsCard — Triono Racing
 *
 * Verticale, per griglia 3 colonne. Cover, categoria (badge), titolo, data, estratto.
 * Hover: shadow + leggero lift dell'immagine.
 */
export interface NewsCardProps {
  cover: string;
  coverAlt?: string;
  category: string;
  categoryVariant?: BadgeVariant;
  title: string;
  date: string; // ISO date string
  excerpt: string;
  href: string;
  className?: string;
}

export function NewsCard({
  cover,
  coverAlt = "",
  category,
  categoryVariant = "default",
  title,
  date,
  excerpt,
  href,
  className,
}: NewsCardProps) {
  const formatted = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));

  return (
    <article
      className={cn(
        "group bg-white border border-line rounded-[var(--radius-xl)] overflow-hidden",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="photo-house aspect-[4/3] bg-bg-muted">
          <Image
            src={cover}
            alt={coverAlt}
            width={640}
            height={480}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between text-xs">
            <Badge variant={categoryVariant} size="sm">{category}</Badge>
            <time className="font-mono text-ink-muted" dateTime={date}>
              {formatted}
            </time>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-tight text-ink">
            {title}
          </h3>
          <p className="mt-2 text-sm text-ink-muted line-clamp-2">{excerpt}</p>
          <span className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-sky-600 group-hover:text-navy-700 transition-colors">
            Leggi <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

/* Esempio
<NewsCard
  cover="/news/scuola-2026.jpg"
  category="Scuola"
  categoryVariant="info"
  title="Aperte le iscrizioni alla Scuola 2026/27"
  date="2026-09-12"
  excerpt="Posti limitati per garantire qualità delle lezioni…"
  href="/news/iscrizioni-2026"
/>
*/
