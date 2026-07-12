import { Ticker } from "@/components/apex/Ticker";

/**
 * Ticker della regia sotto la hero della home (APEX, EVO-038).
 * Contenuti statici reali del mondo Triono — aggiornare qui a ogni stagione.
 */
export function HomeTicker() {
  return (
    <Ticker
      items={[
        { label: "Marathon MTB 209", value: "28 GIU 2026 · ARRONE" },
        { label: "Scuola · dai 4 anni", value: "ISCRIZIONI APERTE" },
        { label: "Amatori & Agonisti", value: "TESSERAMENTO 2026" },
        { label: "Ciclodromo Renato Perona", value: "TERNI" },
        { label: "Triono Racing", value: "DAL 2015" },
      ]}
    />
  );
}
