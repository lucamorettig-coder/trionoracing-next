import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  label: string;
  className?: string;
}

/**
 * BackLink — freccia "torna indietro" condivisa per le sotto-pagine del portale.
 * Estrae il pattern già usato nel dettaglio gara admin. Primitiva chiave per
 * l'orientamento su mobile (dove la NavBar è a drawer).
 */
export default function BackLink({ href, label, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4",
        className,
      )}
    >
      <ChevronLeft size={14} aria-hidden />
      {label}
    </Link>
  );
}
