import * as React from "react";

/**
 * APEX DS v2 — ApexLegalTable: "mattoncini" stilizzati per le tabelle delle pagine
 * legali (Privacy, Condizioni, Cookie), riscalati sui token del palco scuro APEX.
 * La struttura `<table>`/`<thead>`/`<tbody>` resta locale a ogni pagina (colonne e
 * dati variano), qui si esporta solo lo styling condiviso.
 *
 * Scelta di API rispetto all'originale: nell'originale `bg-bg-soft` stava sulla
 * `<tr>` dell'header e `border-t border-navy-100 align-top` sulla `<tr>` del body
 * (non sulle celle). Qui quelle classi sono spostate direttamente su `ApexLegalTh`/
 * `ApexLegalTd`: il chiamante può wrappare `<tr>{cells}</tr>` senza ripetere le
 * classi riga per riga a ogni tabella — meno superficie da sbagliare, stesso
 * risultato visivo (i bordi tra celle adiacenti coincidono comunque).
 */
export function ApexLegalTableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-stage-line">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function ApexLegalTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent bg-stage-surface text-left">
      {children}
    </th>
  );
}

export function ApexLegalTd({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 border-t border-stage-line align-top text-stage-ink-dim ${className}`}>
      {children}
    </td>
  );
}
