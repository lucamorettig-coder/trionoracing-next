"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  garaId: string;
  numIscrizioni: number;
}

/**
 * EVO-025: tab della scheda gara admin. Due tab: "Gara" (dettaglio + maestri) e
 * "Iscrizioni" (gestione iscrizioni). Link-based con active state da pathname.
 */
export default function GaraTabs({ garaId, numIscrizioni }: Props) {
  const pathname = usePathname();
  const base = `/portale/admin/gare/${garaId}`;
  const iscrizioniHref = `${base}/iscrizioni`;
  const isIscrizioni = pathname.startsWith(iscrizioniHref);

  const tabs = [
    { href: base, label: "Gara", icon: FileText, active: !isIscrizioni },
    {
      href: iscrizioniHref,
      label: `Iscrizioni (${numIscrizioni})`,
      icon: Users,
      active: isIscrizioni,
    },
  ];

  return (
    <div role="tablist" aria-label="Sezioni gara" className="flex items-center gap-1 border-b border-line">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={t.active}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 h-10 text-[13.5px] font-semibold border-b-2 -mb-px transition-colors",
              t.active
                ? "border-navy-700 text-navy-700"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={15} aria-hidden />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
