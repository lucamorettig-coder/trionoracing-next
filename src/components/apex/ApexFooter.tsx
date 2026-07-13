"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { LEGAL, CONTACT_EMAIL } from "@/lib/seo";
import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";

/** mailto onesto verso l'associazione: nessun provider newsletter è configurato,
 *  quindi "Iscrivimi" apre una mail già pronta invece di fingere un'iscrizione. */
function newsletterMailto(email?: string): string {
  const subject = encodeURIComponent("Iscrizione newsletter Triono Racing");
  const body = encodeURIComponent(
    email
      ? `Vorrei iscrivermi alla newsletter di Triono Racing.\n\nEmail da iscrivere: ${email}`
      : "Vorrei iscrivermi alla newsletter di Triono Racing.",
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * APEX DS v2 — Footer della regia. SEMPRE in livrea Racing (il brand padre
 * firma tutto). Contenuti identici al footer DS v0.1: brand+social, link
 * associazione/eventi, newsletter, riga legale con preferenze cookie.
 * Superficie stage-navy + bordo hairline (showcase .apex-footer).
 */
export interface ApexFooterProps {
  onNewsletterSubmit?: (email: string) => void | Promise<void>;
}

type NewsletterStatus = "idle" | "pending" | "done" | "opened" | "error";

export function ApexFooter({ onNewsletterSubmit }: ApexFooterProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<NewsletterStatus>("idle");

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    // Provider reale (se un domani verrà cablato via prop): ha la precedenza.
    if (onNewsletterSubmit) {
      if (status === "pending") return;
      setStatus("pending");
      try {
        await onNewsletterSubmit(value);
        setStatus("done");
      } catch {
        setStatus("error"); // input preservato, l'utente può ritentare
      }
      return;
    }

    // Default onesto senza backend: apre una mail già pronta all'associazione.
    window.location.href = newsletterMailto(value);
    setStatus("opened");
  }

  return (
    <footer
      className="bg-stage-navy text-stage-ink border-t border-stage-line relative"
      style={{ zIndex: "var(--z-pista)" }}
      data-livery="racing"
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-16 lg:pt-20 pb-8">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Image
              src="/assets/logo-triono-racing-white.png"
              alt="Triono Racing"
              width={180}
              height={48}
              className="h-12 w-auto"
            />
            <p className="mt-5 text-stage-muted text-sm max-w-[320px]">
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
              <FooterLink href="/diventa-maestro">Diventa Maestro</FooterLink>
            </FooterColumn>
            <FooterColumn title="Eventi">
              <FooterLink href="/marathon-209">Marathon MTB 209</FooterLink>
              <FooterLink href="/contatti">Contatti</FooterLink>
            </FooterColumn>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <div className="apex-eyebrow mb-4" style={{ color: "var(--stage-ink)" }}>Newsletter</div>
            <p className="text-sm text-stage-muted mb-4">
              Iscrizioni, eventi e novità della scuola.
            </p>
            {status === "done" ? (
              <p className="text-sm text-accent-2" role="status">
                Iscritto, grazie!
              </p>
            ) : status === "opened" ? (
              <div className="space-y-2 text-sm text-stage-ink-dim" role="status">
                <p>
                  Ti abbiamo aperto una mail già pronta:{" "}
                  <strong className="text-stage-ink">inviala</strong> per completare
                  l&apos;iscrizione.
                </p>
                <p className="text-stage-muted">
                  Non si è aperto nulla?{" "}
                  <a
                    href={newsletterMailto(email.trim() || undefined)}
                    className="text-accent underline underline-offset-2 hover:opacity-80"
                  >
                    Scrivici a mano
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2" suppressHydrationWarning>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="tua@email.it"
                  className="w-full h-11 px-4 bg-white/5 border border-stage-line text-stage-ink placeholder:text-stage-muted focus:outline-none focus:border-accent"
                  aria-label="Email per newsletter"
                  aria-invalid={status === "error" || undefined}
                  suppressHydrationWarning
                />
                {status === "error" && (
                  <p className="text-sm text-accent-2" role="alert">
                    Invio non riuscito. Riprova o scrivici a{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="underline underline-offset-2"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="apex-cta apex-cta--support w-full justify-center"
                >
                  {status === "pending" ? "Invio…" : "Iscrivimi"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stage-line-soft flex flex-wrap items-center justify-between gap-3 text-xs text-stage-muted">
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} ASD CIEMME · Triono Racing · P.IVA {LEGAL.vat} · C.F.{" "}
            {LEGAL.taxCode}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-stage-ink">Privacy</Link>
            <Link href="/cookie" className="hover:text-stage-ink">Cookie</Link>
            <Link href="/condizioni" className="hover:text-stage-ink">Condizioni</Link>
            <CookiePreferencesButton />
            <Link href="/contatti" className="hover:text-stage-ink">Contatti</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="apex-eyebrow mb-4" style={{ color: "var(--stage-ink)" }}>{title}</div>
      <ul className="space-y-2.5 text-sm text-stage-muted">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-stage-ink transition-colors">{children}</Link>
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
      className="w-10 h-10 flex items-center justify-center bg-white/5 border border-stage-line text-stage-ink-dim hover:text-stage-ink hover:border-accent transition-colors"
    >
      {children}
    </a>
  );
}
