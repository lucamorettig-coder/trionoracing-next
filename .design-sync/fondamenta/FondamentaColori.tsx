// Scheda di riferimento — superfici del palco e livree APEX.
//
// I campioni usano le `var()` reali: nessun hex ricopiato. Le quattro livree sono
// mostrate ognuna dentro il proprio `[data-livery]`, quindi i due accenti sono
// letteralmente quelli che il DS risolve a runtime.
import * as React from "react";

const SUPERFICI = [
  { token: "--stage-bg", nome: "Fondo del palco", uso: "Sfondo globale della pagina pubblica" },
  { token: "--stage-navy", nome: "Navy deep", uso: "Continuità col brand, superfici alte" },
  { token: "--stage-surface", nome: "Superficie", uso: "Card e pannelli rialzati" },
  { token: "--stage-surface-2", nome: "Superficie 2", uso: "Secondo livello di superficie" },
];

const INCHIOSTRI = [
  { token: "--stage-ink", nome: "Ink", uso: "Testo principale" },
  { token: "--stage-ink-dim", nome: "Ink dim", uso: "Testo secondario" },
  { token: "--stage-muted", nome: "Muted", uso: "Testo di servizio — il minimo che passa AA su testo piccolo" },
  { token: "--stage-faint", nome: "Faint", uso: "SOLO decorativo: non passa AA su testo piccolo" },
];

const LIVREE: { id: string; nome: string; dove: string }[] = [
  { id: "racing", nome: "Racing", dove: "Home, Chi siamo, Amatori, Contatti — la livrea di default" },
  { id: "scuola", nome: "Scuola", dove: "La Scuola, Diventa Maestro" },
  { id: "marathon", nome: "Marathon", dove: "Marathon MTB 209" },
  { id: "ciclocross", nome: "Ciclocross", dove: "Predisposta, non ancora usata da una pagina" },
];

const Swatch = ({ token, nome, uso, testo }: { token: string; nome: string; uso: string; testo?: boolean }) => (
  <div style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr", gap: "var(--space-4)", alignItems: "center" }}>
    <div
      aria-hidden
      style={{
        height: "3.5rem",
        background: testo ? "var(--stage-surface)" : `var(${token})`,
        border: "1px solid var(--stage-line)",
        display: "grid",
        placeItems: "center",
        color: testo ? `var(${token})` : undefined,
        fontFamily: "var(--font-display)",
        fontSize: "var(--fs-h4)",
        fontWeight: 800,
      }}
    >
      {testo ? "Aa" : null}
    </div>
    <div>
      <div style={{ fontSize: "var(--fs-h6)", color: "var(--stage-ink)" }}>{nome}</div>
      <code className="apex-data" style={{ color: "var(--accent)" }}>{token}</code>
      <div style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{uso}</div>
    </div>
  </div>
);

export function FondamentaColori() {
  return (
    <div style={{ padding: "var(--space-7)", display: "grid", gap: "var(--space-8)" }}>
      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Superfici del palco</p>
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {SUPERFICI.map((s) => <Swatch key={s.token} {...s} />)}
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Inchiostri</p>
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {INCHIOSTRI.map((s) => <Swatch key={s.token} {...s} testo />)}
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <p className="apex-eyebrow">Livree</p>
        <p style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)", maxWidth: "var(--maxw-prose)" }}>
          Una livrea rimappa <strong style={{ color: "var(--stage-ink)" }}>solo</strong> i due accenti. Il telaio —
          superfici, inchiostri, tipografia, spaziature — non cambia mai.
        </p>
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {LIVREE.map((l) => (
            <div
              key={l.id}
              data-livery={l.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "var(--space-4)",
                alignItems: "center",
                border: "1px solid var(--stage-line)",
                padding: "var(--space-4)",
              }}
            >
              <div>
                <div style={{ fontSize: "var(--fs-h6)", color: "var(--stage-ink)" }}>{l.nome}</div>
                <code className="apex-data" style={{ color: "var(--stage-muted)" }}>data-livery=&quot;{l.id}&quot;</code>
                <div style={{ fontSize: "var(--fs-small)", color: "var(--stage-muted)" }}>{l.dove}</div>
              </div>
              <div aria-hidden style={{ width: "4rem", height: "2.5rem", background: "var(--accent)" }} />
              <div aria-hidden style={{ width: "4rem", height: "2.5rem", background: "var(--accent-2)" }} />
            </div>
          ))}
        </div>
        <p className="apex-data" style={{ color: "var(--stage-muted)" }}>
          a sinistra --accent · a destra --accent-2
        </p>
      </section>
    </div>
  );
}
