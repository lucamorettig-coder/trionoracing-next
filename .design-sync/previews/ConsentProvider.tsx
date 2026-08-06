import * as React from "react";
import { ConsentProvider, ApexLegalSection, ApexCta, SectionHead } from "trionoracing-next";

// Il bundle delle preview non definisce `process`: `ConsentProvider` monta
// `GoogleAnalytics`, che legge `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` →
// "ReferenceError: process is not defined" e la cella rende bianca.
// Shim locale (env vuota = nessuno script GA, esattamente come sul sito senza
// la variabile). Vedi .design-sync/learnings/legal-consent.md: la sede giusta
// per questo è il bundle/shim, non la singola preview.
const G = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
if (typeof G.process === "undefined") G.process = { env: {} };

/**
 * `ConsentProvider` non ha una resa propria: monta il context e, sotto ai figli,
 * il banner cookie + la modale preferenze. Quindi ogni cella è una finta pagina
 * avvolta dal provider — quel che si giudica è il banner sopra il contenuto.
 *
 * Il banner compare solo se NON esiste già una scelta valida nel cookie
 * `tr_consent`: in cattura il browser è pulito, quindi si vede. Non scriviamo
 * mai il cookie da una preview — resterebbe nel contesto e farebbe sparire il
 * banner dalle celle successive.
 *
 * Scaffolding SOLO con stili inline, mai utility Tailwind.
 */
const Pagina = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 820, padding: "32px 32px 140px", display: "grid", gap: 24 }}>
    {children}
  </div>
);

/** Primo accesso su una pagina legale: barra in basso, Accetta/Rifiuta di pari peso. */
export const BannerPrimoAccesso = () => (
  <ConsentProvider>
    <Pagina>
      <SectionHead
        reveal={false}
        kicker="Cookie policy"
        title="Che cookie usiamo, e perché."
        intro="Informativa sull'uso dei cookie ai sensi del Provv. Garante 10 giugno 2021 (Linee guida cookie) e degli artt. 13-14 GDPR."
        variant="h2"
      />
      <ApexLegalSection title="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file salvati sul tuo dispositivo dai siti che visiti. Servono a far
          funzionare il sito, a ricordare le preferenze e — solo con il tuo consenso — a produrre
          statistiche o a mostrare contenuti di terze parti.
        </p>
      </ApexLegalSection>
    </Pagina>
  </ConsentProvider>
);

/** Su una pagina di conversione: il banner non è bloccante, il contenuto resta usabile. */
export const SuPaginaPubblica = () => (
  <ConsentProvider>
    <Pagina>
      <SectionHead
        reveal={false}
        kicker="Scuola di ciclismo"
        title="Imparare il ciclismo, in sicurezza."
        intro="Maestri federali, gruppi piccoli e lezioni al Ciclodromo Renato Perona di Terni. Iscrizioni aperte tutto l'anno."
        variant="h2"
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <ApexCta variant="primary" href="/portale/iscrizioni">
          Iscrivi tuo figlio
        </ApexCta>
        <ApexCta variant="ghost" href="/contatti">
          Prenota una prova
        </ApexCta>
      </div>
    </Pagina>
  </ConsentProvider>
);
