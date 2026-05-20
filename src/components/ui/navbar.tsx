"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * NavBar — Triono Racing
 *
 * - Desktop: logo sx, link al centro, CTA dx.
 * - Mobile : hamburger → drawer full-height navy-900 con CTA in fondo.
 * - Sticky, fondo bianco semi-trasparente con backdrop blur al primo scroll.
 */
export interface NavBarProps {
  links?: Array<{ label: string; href: string; badge?: string }>;
  className?: string;
}

const defaultLinks: NavBarProps["links"] = [
  { label: "Scuola", href: "/scuola" },
  { label: "Squadra", href: "/squadra" },
  { label: "Calendario", href: "/calendario" },
  { label: "Marathon 209", href: "/209", badge: "2026" },
  { label: "News", href: "/news" },
  { label: "Contatti", href: "/contatti" },
];

export function NavBar({ links = defaultLinks, className }: NavBarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background,backdrop-filter,box-shadow] duration-200",
        scrolled
          ? "bg-white/90 backdrop-blur border-b border-line shadow-[var(--shadow-xs)]"
          : "bg-white border-b border-transparent",
        className
      )}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo-triono-racing.png"
            alt="Triono Racing"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {links?.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink-muted hover:text-navy-700 transition-colors font-medium flex items-center gap-2"
            >
              {l.label}
              {l.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sun-500 text-navy-900">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/accedi">Accedi</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/iscrizioni">Iscrivi tuo figlio</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center bg-bg-muted hover:bg-line"
          aria-label="Apri menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-navy-900 text-white flex flex-col animate-in fade-in duration-200">
          <div className="px-4 h-20 flex items-center justify-between border-b border-white/10">
            <Image
              src="/assets/logo-triono-racing.png"
              alt="Triono Racing"
              width={140}
              height={36}
              className="h-9 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <button
              type="button"
              className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center bg-white/10"
              aria-label="Chiudi menu"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {links?.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] text-white/80 hover:bg-white/5 hover:text-white"
              >
                {l.label}
                {l.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sun-500 text-navy-900">
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 space-y-2 border-t border-white/10">
            <Button
              asChild
              size="lg"
              className="w-full bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600"
            >
              <Link href="/iscrizioni" onClick={() => setOpen(false)}>
                Iscrivi tuo figlio
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full text-white border-white/30 hover:bg-white/10"
            >
              <Link href="/accedi" onClick={() => setOpen(false)}>Accedi</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
