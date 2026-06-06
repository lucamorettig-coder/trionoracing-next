import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { UsersRound, ShieldCheck, CalendarCheck } from "lucide-react";
import { trionoClerkAppearance } from "@/lib/clerk-appearance";
import { AuthSplitLayout } from "@/components/portale/auth/AuthSplitLayout";
import { AuthBrandPanel, type AuthBrandFeature } from "@/components/portale/auth/AuthBrandPanel";
import { AuthHeading } from "@/components/portale/auth/AuthHeading";

export const metadata: Metadata = {
  title: "Accedi",
  description:
    "Accedi al portale famiglie Triono Racing per gestire iscrizioni, certificati, pagamenti e gare di tuo figlio.",
  robots: { index: false, follow: false },
};

const features: AuthBrandFeature[] = [
  {
    icon: <UsersRound size={18} aria-hidden />,
    title: "Una squadra, un portale",
    desc: "Genitori, maestri e segreteria nello stesso spazio.",
  },
  {
    icon: <ShieldCheck size={18} aria-hidden />,
    title: "Pagamenti sicuri",
    desc: "SumUp Card Widget + ricevuta automatica.",
  },
  {
    icon: <CalendarCheck size={18} aria-hidden />,
    title: "Tutto in un colpo d'occhio",
    desc: "Certificati, rate e gare con stato sempre visibile.",
  },
];

export default function LoginPage() {
  return (
    <AuthSplitLayout
      brand={
        <AuthBrandPanel
          headline={
            <>
              Bentornato
              <br />
              nella squadra<span className="text-sun-500">.</span>
            </>
          }
          tag="Accedi al portale per gestire iscrizioni, certificati, pagamenti e gare di tuo figlio."
          features={features}
        />
      }
    >
      <AuthHeading eyebrow="Accedi al portale" title="Ciao, ben tornato.">
        Inserisci email e password per entrare nel portale famiglie.
      </AuthHeading>

      <SignIn
        appearance={trionoClerkAppearance}
        fallbackRedirectUrl="/portale"
        signUpUrl="/portale/registrati"
      />

      <p className="mt-5 text-center text-[13px] text-ink-muted">
        Password dimenticata?{" "}
        <Link
          href="/portale/recupero-password"
          className="font-semibold text-sky-600 hover:text-navy-700"
        >
          Recuperala qui
        </Link>
      </p>

      <p className="mt-6 border-t border-line-soft pt-4 text-center text-[11.5px] leading-[1.55] text-ink-muted">
        Accedendo accetti la nostra{" "}
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
