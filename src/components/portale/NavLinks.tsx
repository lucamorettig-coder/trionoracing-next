"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };

interface NavLinksProps {
  links: NavLink[];
  className?: string;
}

export default function NavLinks({ links, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("h-14 flex items-center", className)}>
      {links.map((link) => {
        const isActive =
          link.href === "/portale"
            ? pathname === "/portale"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "h-14 inline-flex items-center px-3 text-sm border-b-2 transition-colors",
              isActive
                ? "font-semibold text-navy-700 border-navy-700"
                : "text-ink-muted hover:text-navy-700 border-transparent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
