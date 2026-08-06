// Scheda di riferimento — gli "atomi" di APEX.
//
// Nota importante sul perché questa scheda esiste: in APEX quasi tutti gli atomi non
// sono componenti React ma CLASSI CSS (`apex-badge-mono`, `apex-eyebrow`, `accent-word`,
// …). L'unico atomo che è davvero un componente è la CTA — e infatti qui viene importata
// quella VERA, non una copia: se cambia il componente, cambia questa scheda.
import * as React from "react";
import { ApexCta } from "../../src/components/apex/ApexCta";

const Blocco = ({ titolo, nota, children }: { titolo: string; nota?: string; children: React.ReactNode }) => (
  <section style={{ display: "grid", gap: "var(--space-4)" }}>
    <div>
      <p className="apex-eyebrow">{titolo}</p>
      {nota && (
        <p style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)", maxWidth: "var(--maxw-prose)", marginTop: "var(--space-2)" }}>
          {nota}
        </p>
      )}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center" }}>{children}</div>
  </section>
);

export function FondamentaAtomi() {
  return (
    <div style={{ padding: "var(--space-7)", display: "grid", gap: "var(--space-8)" }}>
      <Blocco
        titolo="Call to action"
        nota="L'unico atomo che è un componente: <ApexCta>. Tre varianti, freccia automatica su primary. Regola del DS: la label non si tronca mai."
      >
        <ApexCta variant="primary" href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
        <ApexCta variant="support" href="/marathon-209">Scopri l&apos;evento</ApexCta>
        <ApexCta variant="ghost" href="/contatti">Contattaci</ApexCta>
        <ApexCta variant="primary" disabled>Iscrizioni chiuse</ApexCta>
      </Blocco>

      <Blocco
        titolo="Etichette mono"
        nota="Classi, non componenti: si applicano direttamente all'elemento. Font dati, uppercase, tracking largo."
      >
        <span className="apex-eyebrow">.apex-eyebrow</span>
        <span className="apex-data">.apex-data</span>
        <span className="apex-badge-mono">.apex-badge-mono</span>
      </Blocco>

      <Blocco
        titolo="Enfasi nei titoli"
        nota="Due modi di far risaltare una parola dentro un titolo, entrambi legati all'accento di livrea."
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            fontWeight: 800,
            fontStretch: "125%",
            color: "var(--stage-ink)",
          }}
        >
          Pieno: <span className="accent-word">accent-word</span>
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            fontWeight: 800,
            fontStretch: "125%",
            color: "var(--stage-ink)",
          }}
        >
          Outline: <span className="stroke-word">stroke-word</span>
        </span>
      </Blocco>

      <Blocco
        titolo="Superfici"
        nota="La card scura è il default del palco; la variante avorio (--warm) è il linguaggio distintivo della livrea Scuola."
      >
        <div className="apex-card" style={{ maxWidth: "18rem" }}>
          <h3>.apex-card</h3>
          <p>Superficie rialzata sul palco, bordo hairline, barretta d&apos;accento in alto.</p>
        </div>
        <div className="apex-card apex-card--warm" style={{ maxWidth: "18rem" }}>
          <h3>.apex-card--warm</h3>
          <p>Card calda che galleggia sul palco scuro — usata nella livrea Scuola.</p>
        </div>
      </Blocco>
    </div>
  );
}
