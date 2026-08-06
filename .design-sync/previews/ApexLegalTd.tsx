import * as React from "react";
import { ApexLegalTableWrapper, ApexLegalTh, ApexLegalTd } from "trionoracing-next";

// `ApexLegalTd` è una singola <td> (bordo superiore + align-top): fuori da una
// tabella non rende nulla, quindi ogni cella la mostra nella tabella completa.
// Scaffolding SOLO inline, mai utility Tailwind.
const Colonna = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 820, padding: 32, display: "grid", gap: 24 }}>{children}</div>
);

const COOKIE = [
  { name: "__session", origin: "Clerk (autenticazione)", purpose: "Mantiene la sessione di login dell'area riservata", duration: "Sessione / fino a 7 giorni" },
  { name: "__vercel_* / deployment", origin: "Vercel (hosting)", purpose: "Routing, sicurezza, prevenzione abusi", duration: "Sessione / minuti" },
  { name: "_ga, _ga_<ID>, _gid", origin: "Google Analytics 4", purpose: "Statistiche aggregate e anonime sulle visite (IP anonimizzato)", duration: "fino a 13 mesi / 24 h" },
  { name: "NID, SOCS, AEC", origin: "Google Maps", purpose: 'Funzionamento della mappa "Come raggiungerci" sulla Home', duration: "Variabile (Google)" },
];

/** Il corpo tabella reale della Cookie policy: righe separate dal bordo `border-stage-line`. */
export const Base = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Nome</ApexLegalTh>
          <ApexLegalTh>Origine</ApexLegalTh>
          <ApexLegalTh>Finalità</ApexLegalTh>
          <ApexLegalTh>Durata</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        {COOKIE.map((c) => (
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
    </ApexLegalTableWrapper>
  </Colonna>
);

/**
 * L'unica prop: `className`. Nelle pagine legali serve a promuovere la prima
 * colonna a `font-semibold text-stage-ink` (le altre restano `text-stage-ink-dim`).
 */
export const PrimaColonnaEnfatizzata = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Fornitore</ApexLegalTh>
          <ApexLegalTh>Funzione</ApexLegalTh>
          <ApexLegalTh>Sede</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Vercel Inc.</ApexLegalTd>
          <ApexLegalTd>Hosting del sito</ApexLegalTd>
          <ApexLegalTd>USA</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Cloudflare Inc. (R2)</ApexLegalTd>
          <ApexLegalTd>Storage documenti e foto</ApexLegalTd>
          <ApexLegalTd>USA / UE</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Make (Celonis)</ApexLegalTd>
          <ApexLegalTd>Automazioni amministrative</ApexLegalTd>
          <ApexLegalTd>UE</ApexLegalTd>
        </tr>
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);

/** `align-top`: con celle di lunghezza molto diversa il testo resta ancorato in alto. */
export const ContenutoDisomogeneo = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Contesto</ApexLegalTh>
          <ApexLegalTh>Conservazione</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Cookie</ApexLegalTd>
          <ApexLegalTd>Vedi Cookie policy</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">
            Iscrizione / dati associativi e fiscali
          </ApexLegalTd>
          <ApexLegalTd>
            Per la durata dell&apos;iscrizione e, successivamente, per il tempo richiesto dagli
            obblighi fiscali e federali (di norma 10 anni); i certificati medici per il periodo di
            validità e comunque non oltre quanto necessario.
          </ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Modulo contatti</ApexLegalTd>
          <ApexLegalTd>24 mesi dall&apos;ultimo contatto</ApexLegalTd>
        </tr>
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);
