// Il "palco" APEX: wrapper che attiva i token del design system.
// Nel sito reale è `src/app/(public)/layout.tsx` (`<div data-stage>`) più il
// `data-livery` che ogni pagina applica al proprio contenitore.
// Senza questo wrapper i token sono indefiniti e tutto rende senza stile.
import * as React from "react";

export type ApexLivery = "racing" | "scuola" | "marathon" | "ciclocross";

export function ApexStage({
  livery = "racing",
  children,
  className = "",
}: { livery?: ApexLivery; children?: React.ReactNode; className?: string }) {
  // NOTA: qui NON si forza un'altezza da viewport. Il provider avvolge OGNI singola
  // storia separatamente, quindi un `minHeight: 100vh` renderebbe ogni cella di una
  // griglia alta uno schermo intero. Il fondo palco copre esattamente l'area del
  // componente; se una storia è un elemento minuscolo (un adesivo, una linea) e la card
  // esce come una striscia, il rimedio sta NELLA STORIA — darle un box con dimensioni
  // reali — non qui.
  return (
    <div data-stage className={className}>
      <div data-livery={livery} className="bg-stage-bg text-stage-ink">
        {children}
      </div>
    </div>
  );
}
