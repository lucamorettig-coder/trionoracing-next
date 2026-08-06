import { getSiteSettings, formatPhoneIT, phoneHref } from "@/lib/site-settings";
import { whatsappHref, MESSAGGIO_PROVA } from "@/lib/whatsapp";
import { ApexCta } from "@/components/apex/ApexCta";

/**
 * Il momento di uscita dal sito. Non è un bottone e basta: dice chi
 * risponde, cosa succede dopo, e offre le alternative allo stesso livello
 * per chi non usa WhatsApp.
 */
export async function ConsegnaWhatsApp() {
  const settings = await getSiteSettings();
  const telefono = settings["scuola-telefono"];
  const referente = settings["scuola-referente"];
  const wa = whatsappHref(telefono, MESSAGGIO_PROVA);

  return (
    <div className="apex-card apex-card--warm p-6 lg:p-8">
      <p className="text-[15px] leading-relaxed">
        Ci scrivi, concordiamo insieme il giorno, e vieni. Risponde
        {referente ? ` ${referente}` : " una persona della scuola"}, non un centralino.
      </p>

      {wa ? (
        <ApexCta href={wa} className="mt-6">
          Scrivi su WhatsApp
        </ApexCta>
      ) : null}

      {/* Dentro .apex-card--warm il colore dei <p> lo decide la card
         (regola unlayered .apex-card--warm p, EVO-039): niente utility
         Tailwind di colore qui, verrebbe neutralizzata in silenzio. */}
      <p className="mt-6 text-[13px]">
        Preferisci un altro modo?{" "}
        {telefono ? (
          <>
            Chiama il{" "}
            <a href={phoneHref(telefono)} className="underline underline-offset-2">
              {formatPhoneIT(telefono)}
            </a>{" "}
            oppure{" "}
          </>
        ) : null}
        <a href="/contatti?motivo=prova" className="underline underline-offset-2">
          scrivici dal modulo contatti
        </a>
        .
      </p>
    </div>
  );
}
