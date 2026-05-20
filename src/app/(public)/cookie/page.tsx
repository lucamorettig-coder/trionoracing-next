import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "@/components/ui/icons";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Elenco dei cookie utilizzati dal sito Triono Racing e finalità (cookie tecnici e di sessione, nessun cookie di profilazione).",
  alternates: { canonical: "/cookie" },
  robots: { index: false }, // bozza, attendere revisione legale
};

const LAST_REVISION = "20 maggio 2026";

interface Cookie {
  name: string;
  origin: string;
  purpose: string;
  duration: string;
  category: "necessario" | "funzionale" | "terza-parte";
}

const cookies: Cookie[] = [
  {
    name: "__session",
    origin: "Clerk (autenticazione area riservata)",
    purpose: "Mantiene la sessione utente loggato. Senza questo cookie l'area genitori non funziona.",
    duration: "Sessione (cancellato chiudendo il browser) o fino a 7 giorni se 'ricordami'",
    category: "necessario",
  },
  {
    name: "__client_uat",
    origin: "Clerk",
    purpose: "Token di rinnovo automatico della sessione, evita logout improvvisi.",
    duration: "1 anno",
    category: "necessario",
  },
  {
    name: "vercel-deployment / __vercel_*",
    origin: "Vercel (hosting)",
    purpose: "Routing tra deployment, edge cache, prevenzione abuse.",
    duration: "Sessione o pochi minuti",
    category: "necessario",
  },
  {
    name: "NID, SOCS, AEC (opzionali)",
    origin: "Google (mappa embed sulla Home)",
    purpose: "Solo se carichi la sezione 'Come raggiungerci' della Home. Google usa questi cookie per il funzionamento del proprio servizio Maps.",
    duration: "Variabile (gestita da Google)",
    category: "terza-parte",
  },
];

const labelByCategory: Record<Cookie["category"], { label: string; variant: "info" | "warning" | "default" }> = {
  necessario: { label: "Necessario", variant: "info" },
  funzionale: { label: "Funzionale", variant: "default" },
  "terza-parte": { label: "Terza parte", variant: "warning" },
};

export default function CookiePage() {
  return (
    <main className="max-w-[820px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
      <BreadcrumbJsonLd items={[{ name: "Cookie", url: "/cookie" }]} />

      <div className="reveal">
        <SectionHeader
          eyebrow="Cookie policy"
          title="Che cookie usiamo, e perché."
          subtitle="Il sito Triono Racing usa solo cookie tecnici e di sessione strettamente necessari. Nessun cookie di profilazione o tracker pubblicitario."
        />
      </div>

      {/* Banner stato documento */}
      <div className="mt-8 bg-sun-50 border-l-4 border-sun-500 px-5 py-4 rounded-r-[var(--radius-md)] reveal">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-sun-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-ink leading-relaxed">
            <strong>Bozza tecnica in attesa di revisione legale.</strong>{" "}
            Questo elenco descrive accuratamente quali cookie il sito attualmente usa, ma la
            policy definitiva conforme alle linee guida Garante 2021 deve essere prodotta da
            uno strumento legale (es. <a href="https://www.iubenda.com" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">iubenda</a>) o redatta da un avvocato.
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-10 reveal reveal-delay-1">
        <Section title="1. Cosa sono i cookie">
          <p>
            I cookie sono piccoli file di testo che i siti web visitati salvano sul tuo
            dispositivo. Servono a far funzionare correttamente il sito, ricordare le tue
            preferenze, e in alcuni casi a tracciare comportamenti per profilazione
            pubblicitaria. <strong>Triono Racing non usa cookie di profilazione né
            pubblicitari.</strong>
          </p>
        </Section>

        <Section title="2. Elenco cookie usati dal sito">
          <p className="mb-5">
            Tabella aggiornata al {LAST_REVISION}. Tutti i cookie necessari sono esenti dal
            consenso preventivo (Provv. Garante 8 maggio 2014). I cookie di terza parte vengono
            attivati solo se interagisci con la sezione che li richiede.
          </p>
          <div className="space-y-3">
            {cookies.map((c) => (
              <div
                key={c.name}
                className="bg-bg-soft border border-navy-100 rounded-[var(--radius-lg)] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <code className="text-sm font-bold text-navy-900">{c.name}</code>
                  <Badge variant={labelByCategory[c.category].variant}>
                    {labelByCategory[c.category].label}
                  </Badge>
                </div>
                <Row label="Origine" value={c.origin} />
                <Row label="Finalità" value={c.purpose} />
                <Row label="Durata" value={c.duration} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. Come gestire i cookie">
          <p>
            Puoi accettare, rifiutare o cancellare i cookie tramite le impostazioni del tuo
            browser. Considera che disattivando i cookie necessari l&apos;area riservata genitori
            non potrà più mantenere la sessione di login.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">
                Chrome
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">
                Safari
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">
                Firefox
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/it-it/topic/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-navy-700 underline underline-offset-2">
                Edge
              </a>
            </li>
          </ul>
        </Section>

        <Section title="4. Cookie di terza parte: Google Maps">
          <p>
            La sezione &quot;Come raggiungerci&quot; nella Home incorpora una mappa di Google Maps.
            Quando carichi la home, il tuo browser fa una richiesta a Google che può
            impostare cookie tecnici. Se vuoi evitarlo del tutto, blocca i cookie di terza
            parte nel browser o non visitare la home. Le altre pagine non includono Google
            Maps.
          </p>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-navy-100 flex flex-wrap items-center justify-between gap-4 reveal">
        <Badge variant="warning">Bozza · ultima revisione {LAST_REVISION}</Badge>
        <div className="text-sm text-ink-muted">
          Vedi anche:{" "}
          <Link href="/privacy" className="text-navy-700 underline underline-offset-2">
            Informativa privacy
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-navy-900 leading-tight mb-3">{title}</h2>
      <div className="text-ink leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2">
      <span className="text-xs font-bold uppercase tracking-wider text-sky-600 block">{label}</span>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
