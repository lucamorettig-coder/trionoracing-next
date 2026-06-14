"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/** Link attivo: match esatto per la home, prefisso (con slash) per le altre. */
function isActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

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
  const pathname = usePathname();
  // EVO-027: navbar auth-aware. isSignedIn è undefined finché Clerk non carica → default "Accedi".
  const { isSignedIn } = useAuth();

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
    <>
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-out",
        scrolled
          ? "bg-white/65 backdrop-blur-xl border-b border-line/70 shadow-[0_6px_24px_rgba(5,14,63,0.07)]"
          : "bg-white border-b border-transparent",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-20"
        )}
      >
        {/* Logo — si rimpicciolisce leggermente allo scroll */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo-triono-racing.png"
            alt="Triono Racing"
            width={140}
            height={36}
            className={cn("w-auto transition-all duration-300 ease-out", scrolled ? "h-8" : "h-9")}
            priority
          />
        </Link>

        {/* Desktop links — stato attivo + underline animato */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {links?.map((l) => {
            const active = isActiveHref(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative py-1 font-medium transition-colors flex items-center gap-2",
                  active ? "text-navy-900" : "text-ink-muted hover:text-navy-700"
                )}
              >
                {l.label}
                {l.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sun-500 text-navy-900">
                    {l.badge}
                  </span>
                )}
                {/* underline: piena se attivo, anima da 0 in hover */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-navy-700 transition-all duration-300 ease-out",
                    active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs — auth-aware (EVO-027): "Vai al portale" se loggato */}
        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            {isSignedIn ? (
              <Link href="/portale">Vai al portale</Link>
            ) : (
              <Link href="/portale/login">Accedi</Link>
            )}
          </Button>
          <Button asChild size="sm">
            <Link href="/portale/iscrizioni">Iscrivi tuo figlio</Link>
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
    </header>

    {/* Mobile drawer — fuori dall'<header sticky> per evitare quirks
        di stacking context su iOS Safari (fixed dentro sticky). */}
    {open && (
      <div className="lg:hidden fixed inset-0 z-[100] bg-navy-900 text-white flex flex-col animate-in fade-in duration-200 overflow-hidden">
          <div className="absolute inset-0 pattern-navy" aria-hidden />
          <div className="relative z-10 px-4 h-20 flex items-center justify-between border-b border-white/10">
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
          <nav className="relative z-10 flex-1 overflow-y-auto p-4 space-y-1">
            {links?.map((l) => {
              const active = isActiveHref(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] transition-colors",
                    active
                      ? "bg-white/10 text-white font-semibold border-l-2 border-sun-500"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {l.label}
                  {l.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sun-500 text-navy-900">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="relative z-10 p-4 space-y-2 border-t border-white/10">
            <Button
              asChild
              size="lg"
              className="w-full bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600"
            >
              <Link href="/portale/iscrizioni" onClick={() => setOpen(false)}>
                Iscrivi tuo figlio
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full text-white border-white/30 hover:bg-white/10"
            >
              {isSignedIn ? (
                <Link href="/portale" onClick={() => setOpen(false)}>Vai al portale</Link>
              ) : (
                <Link href="/portale/login" onClick={() => setOpen(false)}>Accedi</Link>
              )}
            </Button>
          </div>
      </div>
    )}
    </>
  );
}
