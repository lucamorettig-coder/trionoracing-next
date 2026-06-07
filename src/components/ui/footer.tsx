"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "./button";
import { LEGAL } from "@/lib/seo";
import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";

/**
 * Footer — Triono Racing
 *
 * Pattern brand di sfondo (uso discreto), 4 colonne: brand+social, link squadra,
 * link eventi, newsletter. Claim e privacy in fondo.
 */
export interface FooterProps {
  onNewsletterSubmit?: (email: string) => void | Promise<void>;
}

export function Footer({ onNewsletterSubmit }: FooterProps) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <footer className="photo-bg-navy text-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-16 lg:pt-20 pb-8">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Image
              src="/assets/logo-triono-racing.png"
              alt="Triono Racing"
              width={180}
              height={48}
              className="h-12 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="mt-5 text-white/70 text-sm max-w-[320px]">
              ASD CIEMME · Triono Racing. Scuola di ciclismo, squadra amatori e Marathon MTB
              dal 2015.
            </p>
            <div className="mt-6 flex gap-2">
              <SocialLink href="https://instagram.com/" label="Instagram"><Instagram className="w-5 h-5" /></SocialLink>
              <SocialLink href="https://facebook.com/" label="Facebook"><Facebook className="w-5 h-5" /></SocialLink>
              <SocialLink href="https://youtube.com/" label="YouTube"><Youtube className="w-5 h-5" /></SocialLink>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <FooterColumn title="L'associazione">
              <FooterLink href="/la-scuola">Scuola di Ciclismo</FooterLink>
              <FooterLink href="/gli-amatori-triono">Amatori &amp; Agonisti</FooterLink>
              <FooterLink href="/chi-siamo">Chi siamo</FooterLink>
            </FooterColumn>
            <FooterColumn title="Eventi">
              <FooterLink href="/marathon-209">Marathon MTB 209</FooterLink>
              <FooterLink href="/contatti">Contatti</FooterLink>
            </FooterColumn>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <div className="font-bold text-sm mb-4">Newsletter</div>
            <p className="text-sm text-white/70 mb-4">
              Iscrizioni, eventi e novità della scuola.
            </p>
            {submitted ? (
              <div className="text-sm text-sun-500">Iscritto, grazie!</div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onNewsletterSubmit?.(email);
                  setSubmitted(true);
                }}
                className="space-y-2"
                suppressHydrationWarning
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.it"
                  className="w-full h-11 px-4 rounded-[var(--radius-md)] bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-sun-500 focus:ring-4 focus:ring-sun-500/20"
                  aria-label="Email per newsletter"
                  suppressHydrationWarning
                />
                <Button
                  type="submit"
                  size="md"
                  className="w-full bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600"
                >
                  Iscrivimi
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/55">
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} ASD CIEMME · Triono Racing · P.IVA {LEGAL.vat} · C.F.{" "}
            {LEGAL.taxCode}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/cookie" className="hover:text-white">Cookie</Link>
            <Link href="/condizioni" className="hover:text-white">Condizioni</Link>
            <CookiePreferencesButton />
            <Link href="/contatti" className="hover:text-white">Contatti</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-bold text-sm mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm text-white/70">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white transition-colors">{children}</Link>
    </li>
  );
}

function SocialLink({
  href, label, children,
}: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
    >
      {children}
    </a>
  );
}
