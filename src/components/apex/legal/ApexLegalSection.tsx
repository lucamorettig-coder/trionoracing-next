import * as React from "react";

type ApexLegalSectionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  /** Id opzionale per deep-link (ancora non usato, preservato per compatibilità con l'originale). */
  id?: string;
};

/**
 * APEX DS v2 — ApexLegalSection: intestazione + corpo di una sezione di pagina legale
 * (Privacy, Condizioni, Cookie). Consolida il pattern `Section` duplicato 3 volte
 * (uno per pagina), riscalato sui token del palco scuro APEX:
 *   • `text-navy-900` → `text-stage-ink`
 *   • `text-ink`      → `text-stage-ink-dim`
 * Mai `text-stage-faint` sul corpo: fallisce il contrasto WCAG AA su testo piccolo/paragrafi
 * (vedi lezione APEX "trap contrasto palco scuro").
 */
export function ApexLegalSection({ title, children, id }: ApexLegalSectionProps) {
  return (
    <section id={id}>
      <h2 className="text-2xl font-bold text-stage-ink leading-tight mb-3">{title}</h2>
      <div className="text-stage-ink-dim leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
