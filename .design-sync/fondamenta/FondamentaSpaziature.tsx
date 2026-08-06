// Scheda di riferimento — scala di spaziature, gutter e ritmo verticale APEX.
//
// Le barre sono larghe `var(--space-N)`: il campione È il token, non una sua copia.
import * as React from "react";

const SCALA = [
  { token: "--space-1", uso: "Distacchi minimi (icona ↔ label)" },
  { token: "--space-2", uso: "Interno di pill e badge" },
  { token: "--space-3", uso: "Titolo ↔ testo" },
  { token: "--space-4", uso: "Padding di card compatte, gap di griglia stretta" },
  { token: "--space-5", uso: "Gap standard fra elementi di un blocco" },
  { token: "--space-6", uso: "Padding di card, gap fra card" },
  { token: "--space-7", uso: "Distacco fra blocchi dentro una sezione" },
  { token: "--space-8", uso: "Header di sezione ↔ contenuto" },
  { token: "--space-9", uso: "Stacco massimo dentro una sezione" },
];

const FLUIDI = [
  { token: "--gutter", uso: "Padding orizzontale di pagina", nota: "clamp: cresce col viewport" },
  { token: "--section-y", uso: "Respiro verticale di una sezione", nota: "clamp su altezza viewport" },
  { token: "--section-y-lg", uso: "Sezione dominante (il beat principale della pagina)", nota: "clamp, ~1,5×" },
  { token: "--maxw", uso: "Larghezza massima del contenuto (.apex-wrap)", nota: "1320px, fisso" },
  { token: "--maxw-prose", uso: "Colonna di lettura", nota: "64ch — misura, non pixel" },
];

export function FondamentaSpaziature() {
  return (
    <div style={{ padding: "var(--space-7)", display: "grid", gap: "var(--space-8)" }}>
      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Scala</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {SCALA.map((s) => (
            <div
              key={s.token}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,7rem) 6rem 1fr",
                gap: "var(--space-4)",
                alignItems: "center",
                borderTop: "1px solid var(--stage-line)",
                paddingTop: "var(--space-2)",
              }}
            >
              <code className="apex-data" style={{ color: "var(--accent)" }}>{s.token}</code>
              <div
                aria-hidden
                style={{ width: `var(${s.token})`, height: "0.75rem", background: "var(--accent)", minWidth: 2 }}
              />
              <span style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{s.uso}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Misure fluide</p>
        <p style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)", maxWidth: "var(--maxw-prose)" }}>
          Non sono valori fissi ma <code className="apex-data">clamp()</code>: crescono col viewport. Per questo il
          ritmo della pagina non va ricostruito a mano con margini in pixel — si usano questi token.
        </p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {FLUIDI.map((f) => (
            <div
              key={f.token}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,10rem) 1fr auto",
                gap: "var(--space-4)",
                alignItems: "baseline",
                borderTop: "1px solid var(--stage-line)",
                paddingTop: "var(--space-2)",
              }}
            >
              <code className="apex-data" style={{ color: "var(--accent)" }}>{f.token}</code>
              <span style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{f.uso}</span>
              <span className="apex-data" style={{ color: "var(--stage-muted)" }}>{f.nota}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
