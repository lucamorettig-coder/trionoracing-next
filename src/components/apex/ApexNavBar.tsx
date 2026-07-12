"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

/** Link attivo: match esatto per la home, prefisso (con slash) per le altre. */
function isActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export interface ApexNavBarProps {
  links: Array<{ label: string; href: string; badge?: string }>;
}

/**
 * APEX DS v2 — NavBar della regia (L+2). SEMPRE in livrea Racing:
 * il brand padre firma tutto (DS-APEX §1.7).
 * - Desktop: logo invertito sx, link mono uppercase con underline accent, CTA dx.
 * - Mobile: hamburger → drawer full-screen sul palco (fuori dall'header
 *   sticky — lezione EVO-003 su stacking context iOS).
 * - Auth-aware (EVO-027): "Vai al portale" se loggato, altrimenti "Accedi".
 */
export function ApexNavBar({ links }: ApexNavBarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const portalHref = isSignedIn ? "/portale" : "/portale/login";
  const portalLabel = isSignedIn ? "Vai al portale" : "Accedi";

  return (
    <>
      <header className="sticky top-0 z-40" data-livery="racing">
        <nav className="apex-nav" aria-label="Navigazione principale">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/logo-triono-racing-white.png"
              alt="Triono Racing"
              width={140}
              height={36}
              className="apex-nav__logo"
              priority
            />
          </Link>

          <div className="apex-nav__links">
            {links.map((l) => {
              const active = isActiveHref(pathname, l.href);
              return (
                <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
                  {l.label}
                  {l.badge && (
                    <span className="ml-1.5 align-middle text-[9px] font-bold tracking-[0.1em] px-1 py-px bg-accent-2 text-[#04091c]">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA desktop — auth-aware */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href={portalHref} className="apex-cta apex-cta--ghost apex-cta--sm">
              {portalLabel}
            </Link>
            <Link href="/portale/iscrizioni" className="apex-cta apex-cta--primary apex-cta--sm">
              Iscrivi tuo figlio
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden ml-auto w-11 h-11 flex items-center justify-center text-stage-ink bg-white/5 border border-stage-line"
            aria-label="Apri menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {/* Mobile drawer — fuori dall'<header sticky> (stacking context iOS) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[100] flex flex-col overflow-hidden bg-stage-bg text-stage-ink"
          data-livery="racing"
        >
          <div className="px-4 h-[60px] flex items-center justify-between border-b border-stage-line-soft shrink-0">
            <Image
              src="/assets/logo-triono-racing-white.png"
              alt="Triono Racing"
              width={140}
              height={36}
              className="apex-nav__logo"
            />
            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center bg-white/5 border border-stage-line"
              aria-label="Chiudi menu"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {links.map((l) => {
              const active = isActiveHref(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between px-4 py-3.5 apex-data transition-colors ${
                    active
                      ? "text-stage-ink border-l-2 border-accent bg-white/5"
                      : "text-stage-ink-dim hover:text-stage-ink hover:bg-white/5"
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="text-[9px] font-bold tracking-[0.1em] px-1 py-px bg-accent-2 text-[#04091c]">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 space-y-2 border-t border-stage-line-soft shrink-0">
            <Link
              href="/portale/iscrizioni"
              onClick={() => setOpen(false)}
              className="apex-cta apex-cta--primary w-full justify-center"
            >
              Iscrivi tuo figlio <span className="apex-cta__arrow" aria-hidden>→</span>
            </Link>
            <Link
              href={portalHref}
              onClick={() => setOpen(false)}
              className="apex-cta apex-cta--ghost w-full justify-center"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
