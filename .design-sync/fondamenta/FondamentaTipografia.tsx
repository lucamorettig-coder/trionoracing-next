// Scheda di riferimento — scala tipografica APEX.
//
// I campioni sono resi con le `var()` reali: nessun valore è ricopiato, quindi la
// scheda non può divergere da `src/app/apex-tokens.css`. Le note accanto a ogni grado
// sono l'intento d'uso dichiarato nel CSS.
import * as React from "react";

const GRADI: { token: string; nota: string; testo: string; famiglia?: string }[] = [
  { token: "--fs-hero", nota: "Numeroni / hero broadcast", testo: "209", famiglia: "--font-display" },
  { token: "--fs-display", nota: "Titolo di sezione monumentale", testo: "Imparare in sella.", famiglia: "--font-display" },
  { token: "--fs-h1", nota: "Titolo di pagina", testo: "Gli amatori Triono", famiglia: "--font-display" },
  { token: "--fs-h2", nota: "Apertura quieta (utility, logistica)", testo: "Ciclodromo Perona, Terni.", famiglia: "--font-display" },
  { token: "--fs-h3", nota: "Titolo di card", testo: "Mountain bike" },
  { token: "--fs-h4", nota: "Sottotitolo", testo: "Due lezioni a settimana" },
  { token: "--fs-h5", nota: "Titolo minore", testo: "Sicurezza prima di tutto" },
  { token: "--fs-h6", nota: "Etichetta di blocco", testo: "Quota di iscrizione" },
  { token: "--fs-body-lg", nota: "Paragrafo introduttivo", testo: "Una scuola per bambini a partire da 4 anni." },
  { token: "--fs-body", nota: "Testo corrente", testo: "Guidata da maestri federali, al Ciclodromo Renato Perona di Terni." },
  { token: "--fs-small", nota: "Testo di servizio", testo: "Parcheggio disponibile, ingresso libero." },
  { token: "--fs-data", nota: "Eyebrow / label / badge mono", testo: "SCUOLA DI CICLISMO", famiglia: "--font-data" },
  { token: "--fs-data-sm", nota: "Micro-label HUD (peso ≥ 500)", testo: "ISCRITTI", famiglia: "--font-data" },
];

const FAMIGLIE = [
  { token: "--font-display", nome: "Archivo", uso: "Display expanded (wdth 125, weight 800–900) — titoli broadcast" },
  { token: "--font-body", nome: "Inter", uso: "Testo corrente e interfaccia" },
  { token: "--font-data", nome: "JetBrains Mono", uso: "Dati, eyebrow, targhe: uppercase con tracking largo" },
];

export function FondamentaTipografia() {
  return (
    <div style={{ padding: "var(--space-7)", display: "grid", gap: "var(--space-8)" }}>
      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Famiglie</p>
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {FAMIGLIE.map((f) => (
            <div
              key={f.token}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,10rem) 1fr",
                gap: "var(--space-5)",
                alignItems: "baseline",
                borderTop: "1px solid var(--stage-line)",
                paddingTop: "var(--space-3)",
              }}
            >
              <span style={{ fontFamily: `var(${f.token})`, fontSize: "var(--fs-h4)", color: "var(--stage-ink)" }}>
                {f.nome}
              </span>
              <span>
                <code className="apex-data" style={{ color: "var(--accent)" }}>{f.token}</code>
                <span style={{ display: "block", fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{f.uso}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Scala</p>
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          {GRADI.map((g) => (
            <div key={g.token} style={{ borderTop: "1px solid var(--stage-line)", paddingTop: "var(--space-3)" }}>
              <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "baseline", flexWrap: "wrap" }}>
                <code className="apex-data" style={{ color: "var(--accent)" }}>{g.token}</code>
                <span style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{g.nota}</span>
              </div>
              <div
                style={{
                  marginTop: "var(--space-2)",
                  fontSize: `var(${g.token})`,
                  fontFamily: g.famiglia ? `var(${g.famiglia})` : "var(--font-body)",
                  fontWeight: g.famiglia === "--font-display" ? "var(--weight-display)" : undefined,
                  fontStretch: g.famiglia === "--font-display" ? "125%" : undefined,
                  letterSpacing: g.famiglia === "--font-data" ? "var(--tracking-data)" : undefined,
                  textTransform: g.famiglia === "--font-data" ? "uppercase" : undefined,
                  lineHeight: "var(--lh-heading)",
                  color: "var(--stage-ink)",
                }}
              >
                {g.testo}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
