import type { CSSProperties } from "react";
import type { ReportPresenzeMaestroRow } from "@/lib/airtable-admin";

export type { ReportPresenzeMaestroRow };

export interface ReportPresenzeTemplateProps {
  /** Es. "Maggio 2026" */
  periodo: string;
  /** Es. "01/06/2026" */
  generatedAt: string;
  righe: ReportPresenzeMaestroRow[];
  /** true = variante "Amministrazione" (mostra colonna Importo), false = variante "Maestri" */
  includeImporto: boolean;
  /** Data URI o URL assoluto del logo, pronto per <img src=...> */
  logoSrc: string;
}

/** Stime di altezza (px) usate dall'endpoint per calcolare l'altezza totale del PNG. */
export const REPORT_HEADER_HEIGHT = 110; // padding radice (36+32) + blocco header (~24 riga logo/titolo) + paddingBottom 24 + marginBottom 28
export const REPORT_ROW_HEIGHT = 42; // altezza di ogni riga tabella (header colonne, righe dati, riga totale)
export const REPORT_FOOTER_HEIGHT = 50; // marginTop 18 + riga testo + margine di stampa

function fmtEuro(value: number): string {
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `€ ${withThousands},${decPart}`;
}

const numCellStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  textAlign: "center",
};

const headerCellStyle: CSSProperties = {
  textTransform: "uppercase",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.09em",
  color: "rgba(255,255,255,0.40)",
};

export function ReportPresenzeTemplate(props: ReportPresenzeTemplateProps) {
  const { periodo, generatedAt, righe, includeImporto, logoSrc } = props;

  const totali = righe.reduce(
    (acc, r) => ({
      lezMTB: acc.lezMTB + r.lezMTB,
      lezStrada: acc.lezStrada + r.lezStrada,
      gare: acc.gare + r.gare,
      totale: acc.totale + r.totale,
      importo: acc.importo + r.importo,
    }),
    { lezMTB: 0, lezStrada: 0, gare: 0, totale: 0, importo: 0 },
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#050E3F",
        display: "flex",
        flexDirection: "column",
        padding: "36px 40px 32px",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          paddingBottom: 24,
          marginBottom: 28,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={64}
          height={64}
          style={{ borderRadius: 10, objectFit: "contain" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              textTransform: "uppercase",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.13em",
              color: "rgba(255,255,255,0.38)",
            }}
          >
            TRIONO SCUOLA CICLISMO
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            Presenze Maestri
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 7,
            }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(127,184,236,0.13)",
                border: "1px solid rgba(127,184,236,0.28)",
                color: "#7FB8EC",
                borderRadius: 999,
                padding: "2px 11px",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {periodo}
            </div>
            <div style={{ display: "flex", fontSize: 10, color: "rgba(255,255,255,0.30)" }}>
              {`Generato il ${generatedAt}`}
            </div>
          </div>
        </div>
      </div>

      {/* "Tabella" */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Riga header colonne */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.055)",
            padding: "9px 12px",
          }}
        >
          <div style={{ flex: 2.2, display: "flex", textAlign: "left", ...headerCellStyle }}>
            MAESTRO
          </div>
          <div style={{ ...numCellStyle, ...headerCellStyle }}>LEZ. MTB</div>
          <div style={{ ...numCellStyle, ...headerCellStyle }}>LEZ. STRADA</div>
          <div style={{ ...numCellStyle, ...headerCellStyle }}>GARE</div>
          <div style={{ ...numCellStyle, ...headerCellStyle }}>TOTALE</div>
          {includeImporto && (
            <div style={{ ...numCellStyle, flex: 1.2, ...headerCellStyle }}>IMPORTO</div>
          )}
        </div>

        {/* Righe dati */}
        {righe.map((r, i) => (
          <div
            key={`${r.maestroCognome}-${r.maestroNome}-${i}`}
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "10px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.045)",
              backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.022)" : "transparent",
            }}
          >
            <div
              style={{
                flex: 2.2,
                display: "flex",
                textAlign: "left",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {`${r.maestroCognome} ${r.maestroNome}`}
            </div>
            <div style={{ ...numCellStyle, color: "rgba(255,255,255,0.80)" }}>{r.lezMTB}</div>
            <div style={{ ...numCellStyle, color: "rgba(255,255,255,0.80)" }}>{r.lezStrada}</div>
            <div style={{ ...numCellStyle, color: "rgba(255,255,255,0.80)" }}>{r.gare}</div>
            <div style={{ ...numCellStyle, fontWeight: 700, color: "#fff" }}>{r.totale}</div>
            {includeImporto && (
              <div style={{ ...numCellStyle, flex: 1.2, fontWeight: 600, color: "#7FB8EC" }}>
                {fmtEuro(r.importo)}
              </div>
            )}
          </div>
        ))}

        {/* Riga Totale finale */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "rgba(127,184,236,0.07)",
            borderTop: "1.5px solid rgba(127,184,236,0.22)",
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          <div
            style={{
              flex: 2.2,
              display: "flex",
              textAlign: "left",
              textTransform: "uppercase",
              fontSize: 10,
              letterSpacing: "0.07em",
              color: "rgba(255,255,255,0.50)",
            }}
          >
            Totale
          </div>
          <div style={{ ...numCellStyle, fontWeight: 700, color: "#fff" }}>{totali.lezMTB}</div>
          <div style={{ ...numCellStyle, fontWeight: 700, color: "#fff" }}>{totali.lezStrada}</div>
          <div style={{ ...numCellStyle, fontWeight: 700, color: "#fff" }}>{totali.gare}</div>
          <div style={{ ...numCellStyle, fontWeight: 700, color: "#fff" }}>{totali.totale}</div>
          {includeImporto && (
            <div
              style={{
                ...numCellStyle,
                flex: 1.2,
                fontWeight: 700,
                color: "#7FB8EC",
                fontSize: 14.5,
              }}
            >
              {fmtEuro(totali.importo)}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 18,
          fontSize: 10,
        }}
      >
        <div style={{ display: "flex", color: "rgba(255,255,255,0.38)" }}>
          Triono Racing S.C. Centro Bici · trionoracing.it
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.38)" }}>Stagione 2025/2026</div>
      </div>
    </div>
  );
}
