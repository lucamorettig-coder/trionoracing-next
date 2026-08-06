import * as React from "react";
import { ApexLegalTableWrapper, ApexLegalTh, ApexLegalTd } from "trionoracing-next";

// Il wrapper non significa nulla da solo (rende un <table> vuoto): qui è sempre
// composto con la tabella completa, come nelle pagine legali reali.
// Scaffolding SOLO inline, mai utility Tailwind.
const Colonna = ({ children, width = 820 }: { children: React.ReactNode; width?: number }) => (
  <div style={{ maxWidth: width, padding: 32, display: "grid", gap: 24 }}>{children}</div>
);

const RETENTION = [
  { context: "Modulo contatti", period: "24 mesi dall'ultimo contatto" },
  {
    context: "Iscrizione / dati associativi e fiscali",
    period: "Durata dell'iscrizione + 10 anni (obblighi fiscali/federali)",
  },
  { context: "Certificato medico", period: "Periodo di validità, poi cancellazione" },
  { context: "Cookie", period: "Vedi Cookie policy" },
];

const PROCESSORS = [
  { name: "Vercel Inc.", role: "Hosting del sito", place: "USA", transfer: "EU-US Data Privacy Framework (DPF) e/o SCC" },
  { name: "Airtable Inc.", role: "Database contatti e iscrizioni", place: "USA", transfer: "DPF e/o Clausole Contrattuali Standard (SCC)" },
  { name: "Clerk Inc.", role: "Autenticazione area riservata", place: "USA", transfer: "DPF e/o SCC" },
  { name: "SumUp Limited", role: "Gestione dei pagamenti", place: "UE (Irlanda)", transfer: "Trattamento nell'UE" },
  { name: "Cloudinary Ltd", role: "Hosting e ottimizzazione immagini", place: "Israele / USA", transfer: "Decisione di adeguatezza (Israele) e/o SCC" },
  { name: "Google LLC", role: "Google Maps e Google Analytics", place: "USA", transfer: "EU-US Data Privacy Framework (DPF)" },
];

/** La cornice: bordo + radius attorno alla tabella dei responsabili esterni (Privacy §6). */
export const Base = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Fornitore</ApexLegalTh>
          <ApexLegalTh>Funzione</ApexLegalTh>
          <ApexLegalTh>Sede</ApexLegalTh>
          <ApexLegalTh>Base trasferimento extra-UE</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        {PROCESSORS.map((p) => (
          <tr key={p.name}>
            <ApexLegalTd className="font-semibold text-stage-ink">{p.name}</ApexLegalTd>
            <ApexLegalTd>{p.role}</ApexLegalTd>
            <ApexLegalTd>{p.place}</ApexLegalTd>
            <ApexLegalTd>{p.transfer}</ApexLegalTd>
          </tr>
        ))}
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);

/** Poche righe e due colonne: il bordo del wrapper regge anche la tabella minima (Privacy §8). */
export const TabellaCompatta = () => (
  <Colonna>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Contesto</ApexLegalTh>
          <ApexLegalTh>Conservazione</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        {RETENTION.map((r) => (
          <tr key={r.context}>
            <ApexLegalTd className="font-semibold text-stage-ink">{r.context}</ApexLegalTd>
            <ApexLegalTd>{r.period}</ApexLegalTd>
          </tr>
        ))}
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);

/**
 * `overflow-x-auto`: in una colonna stretta (mobile) la tabella scorre dentro
 * la cornice invece di sfondare la pagina — il motivo per cui il wrapper esiste.
 */
export const ScrollOrizzontale = () => (
  <Colonna width={420}>
    <ApexLegalTableWrapper>
      <thead>
        <tr>
          <ApexLegalTh>Fornitore</ApexLegalTh>
          <ApexLegalTh>Funzione</ApexLegalTh>
          <ApexLegalTh>Sede</ApexLegalTh>
          <ApexLegalTh>Base trasferimento extra-UE</ApexLegalTh>
        </tr>
      </thead>
      <tbody>
        {PROCESSORS.slice(0, 4).map((p) => (
          <tr key={p.name}>
            <ApexLegalTd className="font-semibold text-stage-ink">{p.name}</ApexLegalTd>
            <ApexLegalTd>{p.role}</ApexLegalTd>
            <ApexLegalTd>{p.place}</ApexLegalTd>
            <ApexLegalTd>{p.transfer}</ApexLegalTd>
          </tr>
        ))}
      </tbody>
    </ApexLegalTableWrapper>
  </Colonna>
);
