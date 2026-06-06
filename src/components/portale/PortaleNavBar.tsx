import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";
import NavLinks, { type NavLink } from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

function getLinksForRole(role: string, hasFigli: boolean): NavLink[] {
  switch (role) {
    case "ADMIN":
      return [
        { label: "Dashboard", href: "/portale/admin" },
        { label: "Iscrizioni", href: "/portale/admin/iscrizioni" },
        { label: "Bambini", href: "/portale/admin/bambini" },
        { label: "Pagamenti", href: "/portale/admin/pagamenti" },
        { label: "Gare", href: "/portale/admin/gare" },
        { label: "Lezioni", href: "/portale/admin/lezioni" },
        { label: "Presenze maestri", href: "/portale/admin/presenze-maestri" },
        { label: "Genitori", href: "/portale/admin/genitori" },
        { label: "Tariffe", href: "/portale/admin/tariffe" },
        { label: "Migrazione", href: "/portale/admin/migrazione" },
      ];
    case "ISTRUTTORE": {
      const maestroLinks: NavLink[] = [
        { label: "Home", href: "/portale" },
        { label: "Le mie lezioni", href: "/portale/lezioni" },
        { label: "Gare assegnate", href: "/portale/gare-assegnate" },
      ];
      if (hasFigli) {
        // Dual ruolo: anteporre le voci genitore (Home già presente)
        return [
          { label: "Home", href: "/portale" },
          { label: "I miei figli", href: "/portale/figli" },
          { label: "Iscrizioni", href: "/portale/iscrizioni" },
          { label: "Pagamenti", href: "/portale/pagamenti" },
          { label: "Le mie lezioni", href: "/portale/lezioni" },
          { label: "Gare assegnate", href: "/portale/gare-assegnate" },
          { label: "Profilo", href: "/portale/profilo" },
        ];
      }
      return [...maestroLinks, { label: "Profilo", href: "/portale/profilo" }];
    }
    default:
      return [
        { label: "Home", href: "/portale" },
        { label: "I miei figli", href: "/portale/figli" },
        { label: "Iscrizioni", href: "/portale/iscrizioni" },
        { label: "Pagamenti", href: "/portale/pagamenti" },
        { label: "Gare", href: "/portale/gare" },
        { label: "Profilo", href: "/portale/profilo" },
      ];
  }
}

export default async function PortaleNavBar() {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.role as string) ?? "GENITORE";

  // Dual ruolo: per ISTRUTTORE controlla se ha figli linkati al record genitore.
  let hasFigli = false;
  if (role === "ISTRUTTORE" && userId) {
    try {
      const genitore = await getGenitoreByClerkId(userId);
      hasFigli = (genitore?.fields.TABELLA_BAMBINI?.length ?? 0) > 0;
    } catch {
      hasFigli = false;
    }
  }

  const links = getLinksForRole(role, hasFigli);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line shadow-[var(--shadow-xs)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
        {/* Logo mark */}
        <Link href="/portale" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-sun-500 text-navy-900 rounded-[var(--radius-sm)] flex items-center justify-center font-bold text-sm select-none">
            T
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold text-ink leading-tight">
              Triono Racing
            </p>
            <p className="text-xs text-ink-muted leading-tight">Portale</p>
          </div>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <NavLinks links={links} className="hidden lg:flex flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifiche"
            className="p-2 rounded-[var(--radius-sm)] text-ink-muted hover:text-navy-700 hover:bg-bg-muted transition-colors"
          >
            <Bell size={18} />
          </button>
          <UserButton appearance={trionoClerkAppearance} />
          {/* Hamburger — shown only on mobile */}
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
