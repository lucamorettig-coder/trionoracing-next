import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/apex/SectionHead";
import { Grain } from "@/components/apex/Grain";
import {
  ApexLegalTableWrapper,
  ApexLegalTh,
  ApexLegalTd,
} from "@/components/apex/legal/ApexLegalTable";
import { ApexLegalSection } from "@/components/apex/legal/ApexLegalSection";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Cookie utilizzati dal sito Triono Racing: tecnici necessari e — solo previo consenso — statistici (Google Analytics) e di terze parti (Google Maps).",
  alternates: { canonical: "/cookie" },
};

const LAST_REVISION = "7 giugno 2026";

interface Cookie {
  name: string;
  origin: string;
  purpose: string;
  duration: string;
}

const NECESSARI: Cookie[] = [
  { name: "__session", origin: "Clerk (autenticazione)", purpose: "Mantiene la sessione di login dell'area riservata", duration: "Sessione / fino a 7 giorni" },
  { name: "__client_uat", origin: "Clerk", purpose: "Rinnovo automatico della sessione", duration: "1 anno" },
  { name: "__vercel_* / deployment", origin: "Vercel (hosting)", purpose: "Routing, sicurezza, prevenzione abusi", duration: "Sessione / minuti" },
  { name: "tr_consent", origin: "Triono Racing", purpose: "Memorizza le tue preferenze sui cookie", duration: "6 mesi" },
];

const STATISTICI: Cookie[] = [
  { name: "_ga, _ga_<ID>, _gid", origin: "Google Analytics 4", purpose: "Statistiche aggregate e anonime sulle visite (IP anonimizzato)", duration: "fino a 13 mesi / 24 h" },
];

const TERZE_PARTI: Cookie[] = [
  { name: "NID, SOCS, AEC", origin: "Google Maps", purpose: 'Funzionamento della mappa "Come raggiungerci" sulla Home', duration: "Variabile (Google)" },
];

export default function CookiePage() {
  return (
    <div data-livery="racing" className="bg-stage-bg text-stage-ink">
      <Grain />
      <div className="max-w-[820px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <BreadcrumbJsonLd items={[{ name: "Cookie", url: "/cookie" }]} />

        <SectionHead
          kicker="Cookie policy"
          title="Che cookie usiamo, e perché."
          intro="Informativa sull'uso dei cookie ai sensi del Provv. Garante 10 giugno 2021 (Linee guida cookie) e degli artt. 13-14 GDPR."
        />

        <div className="mt-12 space-y-10 reveal reveal-delay-1">
          <ApexLegalSection title="1. Cosa sono i cookie">
            <p>
              I cookie sono piccoli file salvati sul tuo dispositivo dai siti che visiti. Servono a
              far funzionare il sito, a ricordare le preferenze e — solo con il tuo consenso — a
              produrre statistiche o a mostrare contenuti di terze parti. Usiamo anche tecnologie
              analoghe (es. <code>localStorage</code>). Distinguiamo tre categorie.
            </p>
          </ApexLegalSection>

          <ApexLegalSection title="2. Cookie utilizzati">
            <CookieGroup
              heading="Necessari"
              badge={<Badge variant="info">Sempre attivi — esenti da consenso</Badge>}
              cookies={NECESSARI}
            />
            <CookieGroup
              heading="Statistici"
              badge={<Badge variant="warning">Richiedono consenso</Badge>}
              cookies={STATISTICI}
            />
            <p className="text-sm">
              Google Analytics è attivato <strong>solo dopo il tuo consenso</strong> (Google Consent
              Mode v2): prima del consenso non viene impostato alcun cookie statistico. Google LLC
              tratta i dati negli USA sulla base dell&apos;EU-US Data Privacy Framework.
            </p>
            <CookieGroup
              heading="Terze parti — Mappe"
              badge={<Badge variant="warning">Richiedono consenso</Badge>}
              cookies={TERZE_PARTI}
            />
            <p className="text-sm">
              La mappa di Google Maps <strong>non viene caricata</strong> finché non presti il
              consenso: al suo posto trovi un segnaposto con il pulsante &quot;Carica la mappa&quot;.
            </p>
          </ApexLegalSection>

          <ApexLegalSection title="3. Come gestire il consenso e le preferenze">
            <p>
              Al primo accesso compare un banner con cui puoi <strong>Accettare tutti</strong>,{" "}
              <strong>Rifiutare</strong> o <strong>Personalizzare</strong> le scelte per categoria.
              Puoi modificare le tue preferenze in qualsiasi momento:
            </p>
            <div className="mt-1">
              <CookiePreferencesButton className="inline-flex items-center justify-center h-9 px-3.5 text-[13px] font-semibold rounded-[var(--radius-md)] bg-accent-2 text-[#04091c] border-[1.5px] border-accent-2 hover:bg-accent-2/90 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20" />
            </div>
            <p className="mt-3">
              Puoi inoltre gestire o eliminare i cookie dalle impostazioni del browser:
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Chrome</a>
              </li>
              <li>
                <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Safari</a>
              </li>
              <li>
                <a href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Firefox</a>
              </li>
              <li>
                <a href="https://support.microsoft.com/it-it/topic/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">Edge</a>
              </li>
            </ul>
            <p className="mt-3">
              Disattivando i cookie necessari l&apos;area riservata non potrà mantenere il login.
            </p>
          </ApexLegalSection>

          <ApexLegalSection title="4. Durata del consenso">
            <p>
              La tua scelta viene ricordata per <strong>6 mesi</strong>; allo scadere, o in caso di
              modifiche rilevanti a questa policy, ti chiederemo nuovamente il consenso. Revocare o
              modificare il consenso non pregiudica la liceità dei trattamenti effettuati prima della
              revoca.
            </p>
          </ApexLegalSection>

          <ApexLegalSection title="5. Riferimenti">
            <p>
              Per il trattamento dei dati personali vedi l&apos;
              <Link href="/privacy" className="text-accent underline underline-offset-2">
                Informativa privacy
              </Link>
              . Ultima revisione: <strong>{LAST_REVISION}</strong>.
            </p>
          </ApexLegalSection>
        </div>

        <div className="mt-16 pt-8 border-t border-stage-line flex flex-wrap items-center justify-between gap-4 reveal">
          <Badge variant="info">Ultima revisione: {LAST_REVISION}</Badge>
          <div className="text-sm text-stage-muted flex gap-4">
            <Link href="/privacy" className="text-accent underline underline-offset-2">
              Informativa privacy
            </Link>
            <Link href="/condizioni" className="text-accent underline underline-offset-2">
              Condizioni di Servizio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieGroup({
  heading,
  badge,
  cookies,
}: {
  heading: string;
  badge: React.ReactNode;
  cookies: Cookie[];
}) {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2.5 mb-2">
        <h3 className="text-base font-bold text-stage-ink">{heading}</h3>
        {badge}
      </div>
      <ApexLegalTableWrapper>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <ApexLegalTh>Nome</ApexLegalTh>
              <ApexLegalTh>Origine</ApexLegalTh>
              <ApexLegalTh>Finalità</ApexLegalTh>
              <ApexLegalTh>Durata</ApexLegalTh>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name}>
                <ApexLegalTd>
                  <code className="text-[13px] font-bold text-stage-ink">{c.name}</code>
                </ApexLegalTd>
                <ApexLegalTd>{c.origin}</ApexLegalTd>
                <ApexLegalTd>{c.purpose}</ApexLegalTd>
                <ApexLegalTd>{c.duration}</ApexLegalTd>
              </tr>
            ))}
          </tbody>
        </table>
      </ApexLegalTableWrapper>
    </div>
  );
}
