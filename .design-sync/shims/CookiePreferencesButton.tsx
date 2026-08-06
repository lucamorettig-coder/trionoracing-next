// Shim di `@/components/consent/CookiePreferencesButton`.
//
// Perché serve: l'originale chiama `useConsent()`, che LANCIA fuori da
// <ConsentProvider> ("useConsent deve essere usato dentro <ConsentProvider>").
// Sul sito il provider sta nel root layout, ma nelle preview no — e il risultato è che
// `ApexFooter`, che monta questo pulsante, rende una card completamente bianca.
//
// Le alternative erano peggiori: mettere il ConsentProvider vero dentro ApexStage
// significherebbe un cookie banner `fixed` sopra OGNI card di OGNI componente.
//
// Il markup è identico all'originale — cambia solo che `onClick` è inerte, il che in una
// preview statica non toglie nulla (la modale non si aprirebbe comunque).
// Mappato in .design-sync/tsconfig.ds.json PRIMA della regola `@/*`, che altrimenti
// vincerebbe (il plugin usa la prima regola che matcha).

export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className ?? "hover:text-white transition-colors"}
    >
      Preferenze cookie
    </button>
  );
}
