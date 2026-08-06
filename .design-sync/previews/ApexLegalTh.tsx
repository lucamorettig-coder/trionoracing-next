import * as React from "react";
import { ApexLegalTableWrapper, ApexLegalTh, ApexLegalTd } from "trionoracing-next";

// `ApexLegalTh` è una singola <th>: da sola non rende nulla di leggibile, quindi
// ogni cella la mostra nella riga di intestazione della tabella completa.
// Scaffolding SOLO inline, mai utility Tailwind.
const Colonna = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 820, padding: 32, display: "grid", gap: 24 }}>{children}</div>
);

const NECESSARI = [
  { name: "__session", origin: "Clerk (autenticazione)", purpose: "Mantiene la sessione di login dell'area riservata", duration: "Sessione / fino a 7 giorni" },
  { name: "__client_uat", origin: "Clerk", purpose: "Rinnovo automatico della sessione", duration: "1 anno" },
  { name: "tr_consent", origin: "Triono Racing", purpose: "Memorizza le tue preferenze sui cookie", duration: "6 mesi" },
];

/** Quattro intestazioni: mono uppercase accent su `bg-stage-surface` (Cookie policy §2). */
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
        {NECESSARI.map((c) => (
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

/** Due sole colonne: l'header regge la larghezza doppia senza perdere il tracking. */
export const DueColonne = () => (
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
          <ApexLegalTd className="font-semibold text-stage-ink">Modulo contatti</ApexLegalTd>
          <ApexLegalTd>24 mesi dall&apos;ultimo contatto</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">
            Iscrizione / dati associativi e fiscali
          </ApexLegalTd>
          <ApexLegalTd>Durata dell&apos;iscrizione + 10 anni (obblighi fiscali/federali)</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Certificato medico</ApexLegalTd>
          <ApexLegalTd>Periodo di validità, poi cancellazione</ApexLegalTd>
        </tr>
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);

/** Etichetta lunga accanto a etichette corte: la riga di intestazione resta su una sola linea. */
export const EtichettaLunga = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Fornitore</ApexLegalTh>
          <ApexLegalTh>Sede</ApexLegalTh>
          <ApexLegalTh>Base trasferimento extra-UE</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">SumUp Limited</ApexLegalTd>
          <ApexLegalTd>UE (Irlanda)</ApexLegalTd>
          <ApexLegalTd>Trattamento nell&apos;UE</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">Google LLC</ApexLegalTd>
          <ApexLegalTd>USA</ApexLegalTd>
          <ApexLegalTd>EU-US Data Privacy Framework (DPF)</ApexLegalTd>
        </tr>
        <tr>
          <ApexLegalTd className="font-semibold text-stage-ink">
            F.C.I. — Federazione Ciclistica Italiana
          </ApexLegalTd>
          <ApexLegalTd>Italia</ApexLegalTd>
          <ApexLegalTd>—</ApexLegalTd>
        </tr>
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);
