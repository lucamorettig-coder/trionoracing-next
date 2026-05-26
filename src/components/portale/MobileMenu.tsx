"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "./NavLinks";

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="lg:hidden p-2 rounded-[var(--radius-sm)] text-ink-muted hover:text-navy-700 hover:bg-bg-muted transition-colors"
        aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="lg:hidden fixed top-14 inset-x-0 bg-white border-b border-line shadow-[var(--shadow-md)] z-50">
          <nav className="max-w-[1280px] mx-auto px-6 py-3 flex flex-col gap-0.5">
            {links.map((link) => {
              const isIndex = link.href === "/portale" || link.href === "/portale/admin";
              const isActive = isIndex
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors",
                    isActive
                      ? "font-semibold text-navy-700 bg-navy-50"
                      : "text-ink-muted hover:text-navy-700 hover:bg-bg-muted",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
