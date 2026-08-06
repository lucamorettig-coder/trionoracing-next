import * as React from "react";
import { Switch } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Switch è controllato: `checked` arriva da fuori e `onCheckedChange` risale.
// Nelle preview lo stato è fisso, quindi l'handler è un no-op.
const noop = () => {};

const Superficie = ({
  children,
  tema,
  height = 300,
}: {
  children: React.ReactNode;
  tema: "dark" | "light";
  height?: number;
}) => (
  <div
    style={{
      // Sul tema light la pagina è la superficie soft del portale: se fosse
      // bianca si confonderebbe col foglio dello sheet e la card sparirebbe.
      background: tema === "dark" ? "var(--stage-bg)" : "#eef1f7",
      color: tema === "dark" ? "var(--stage-ink)" : "#0b1533",
      minHeight: height,
      padding: 48,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const Nota = ({ children, tema }: { children: React.ReactNode; tema: "dark" | "light" }) => (
  <div
    style={{
      fontFamily: "var(--font-data)",
      fontSize: 11,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: tema === "dark" ? "var(--stage-muted)" : "#5b6786",
      marginBottom: 22,
    }}
  >
    {children}
  </div>
);

const Riga = ({
  label,
  children,
  tema,
}: {
  label: string;
  children: React.ReactNode;
  tema: "dark" | "light";
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    {children}
    <span
      style={{
        fontSize: 14,
        color: tema === "dark" ? "var(--stage-ink-dim)" : "#39456b",
      }}
    >
      {label}
    </span>
  </div>
);

/** I tre stati sul palco APEX scuro (tema "dark"): acceso, spento, bloccato. */
export const StatiSulPalco = () => (
  <Superficie tema="dark">
    <div>
      <Nota tema="dark">Palco APEX · theme=&quot;dark&quot;</Nota>
      <div style={{ display: "grid", gap: 22 }}>
        <Riga tema="dark" label="Attivo — consenso concesso">
          <Switch checked theme="dark" onCheckedChange={noop} aria-label="Statistici attivi" />
        </Riga>
        <Riga tema="dark" label="Spento — consenso negato">
          <Switch checked={false} theme="dark" onCheckedChange={noop} aria-label="Mappe disattivate" />
        </Riga>
        <Riga tema="dark" label="Bloccato — categoria necessaria, sempre attiva">
          <Switch checked disabled theme="dark" onCheckedChange={noop} aria-label="Cookie necessari" />
        </Riga>
      </div>
    </div>
  </Superficie>
);

/** Gli stessi stati sulla superficie chiara del portale (tema "light", default). */
export const StatiSuChiaro = () => (
  <Superficie tema="light">
    <div style={{ background: "#ffffff", border: "1px solid #dfe4ee", padding: 32 }}>
      <Nota tema="light">Portale DS v0.1 · theme=&quot;light&quot; (default)</Nota>
      <div style={{ display: "grid", gap: 22 }}>
        <Riga tema="light" label="Attivo — consenso concesso">
          <Switch checked onCheckedChange={noop} aria-label="Statistici attivi" />
        </Riga>
        <Riga tema="light" label="Spento — consenso negato">
          <Switch checked={false} onCheckedChange={noop} aria-label="Mappe disattivate" />
        </Riga>
        <Riga tema="light" label="Bloccato — categoria necessaria, sempre attiva">
          <Switch checked disabled onCheckedChange={noop} aria-label="Cookie necessari" />
        </Riga>
      </div>
    </div>
  </Superficie>
);

/**
 * L'uso reale: le righe del modale preferenze cookie. Titolo + descrizione a
 * sinistra, toggle a destra; la riga necessaria resta bloccata su ON.
 */
export const RighePreferenzeCookie = () => (
  <Superficie tema="dark" height={380}>
    <div style={{ width: "100%", maxWidth: 640, display: "grid", gap: 4 }}>
      {[
        {
          title: "Necessari",
          desc: "Sessione di login, sicurezza e funzionamento del sito. Non richiedono consenso.",
          checked: true,
          disabled: true,
        },
        {
          title: "Statistici",
          desc: "Misurazione anonima delle visite (IP anonimizzato) per migliorare il sito.",
          checked: true,
          disabled: false,
        },
        {
          title: "Mappe",
          desc: "Mostra la mappa «Come raggiungerci» sulla home. Google riceve il tuo IP.",
          checked: false,
          disabled: false,
        },
      ].map((r) => (
        <div
          key={r.title}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            padding: "18px 20px",
            border: "1px solid var(--stage-line)",
            background: "var(--stage-surface)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--stage-ink)" }}>{r.title}</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5, color: "var(--stage-muted)" }}>
              {r.desc}
            </div>
          </div>
          <Switch
            checked={r.checked}
            disabled={r.disabled}
            theme="dark"
            onCheckedChange={noop}
            aria-label={r.title}
          />
        </div>
      ))}
    </div>
  </Superficie>
);
