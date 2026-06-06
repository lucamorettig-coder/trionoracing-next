import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { UserPlus, Baby, CircleCheckBig } from "lucide-react";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";
import { AuthSplitLayout } from "@/components/portale/auth/AuthSplitLayout";
import { AuthBrandPanel, type AuthBrandFeature } from "@/components/portale/auth/AuthBrandPanel";
import { AuthHeading } from "@/components/portale/auth/AuthHeading";

export const metadata: Metadata = {
  title: "Registrati",
  description:
    "Crea il tuo account sul portale famiglie Triono Racing per iscrivere i tuoi figli ai corsi, gestire i certificati e prenotare le gare.",
  robots: { index: false, follow: false },
};

const features: AuthBrandFeature[] = [
  {
    icon: <UserPlus size={18} aria-hidden />,
    title: "1. Crea l'account",
    desc: "Bastano email, password e il tuo nome.",
  },
  {
    icon: <Baby size={18} aria-hidden />,
    title: "2. Aggiungi tuo figlio",
    desc: "Anagrafica, certificato medico e foto.",
  },
  {
    icon: <CircleCheckBig size={18} aria-hidden />,
    title: "3. Iscrivilo al corso",
    desc: "Paga la prima rata e siete in pista.",
  },
];

export default function RegistratiPage() {
  return (
    <AuthSplitLayout
      brand={
        <AuthBrandPanel
          headline={
            <>
              Unisciti
              <br />
              alla squadra<span className="text-sun-500">.</span>
            </>
          }
          tag="Crea un account per iscrivere i tuoi figli ai corsi, gestire i certificati e prenotare le gare."
          features={features}
        />
      }
    >
      <AuthHeading eyebrow="Crea il tuo account" title="Ciao! Cominciamo.">
        Bastano pochi minuti. Aggiungerai i dati di tuo figlio nello step successivo.
      </AuthHeading>

      <SignUp
        appearance={trionoClerkAppearance}
        fallbackRedirectUrl="/portale"
        signInUrl="/portale/login"
      />

      <p className="mt-6 border-t border-line-soft pt-4 text-center text-[11.5px] leading-[1.55] text-ink-muted">
        Registrandoti accetti la nostra{" "}
        <Link href="/privacy" className="underline decoration-line hover:text-navy-700">
          informativa privacy
        </Link>
        .
        <br />
        <span className="opacity-60">
          Triono Racing è gestita da <strong>ASD CIEMME</strong> · C.F. 91065830550 · Terni
        </span>
      </p>
    </AuthSplitLayout>
  );
}
