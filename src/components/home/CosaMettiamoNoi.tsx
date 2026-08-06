/**
 * I tre servizi che il sito non nominava da nessuna parte e che i genitori
 * non possono immaginare da soli (EVO-046).
 *
 * PERIMETRO DEL COMODATO, VINCOLANTE: vale DOPO l'iscrizione, e solo per
 * chi sceglie il corso che comprende la strada. Alla prova il bambino
 * viene sempre con la propria bici. Non modificare questo copy senza
 * riverificare il perimetro: è un impegno che la scuola deve mantenere.
 */
/* Etichette, non paragrafi: il fatto che la bici da strada la fornisca la
   scuola è l'argomento più forte che abbiamo verso un genitore, e dentro un
   testo lungo si perde. Sta in evidenza, e la spiegazione di cosa comporta
   sta piccola sotto. */
const SERVIZI = [
  // La prima è piena: fra le tre è l'unica che un genitore non può
  // immaginare da solo, ed è quella che gli toglie una spesa.
  { testo: "La bici da strada la diamo noi", forte: true },
  { testo: "Iscrizione e pagamenti online", forte: false },
  { testo: "Maestri federali, gruppi piccoli", forte: false },
] as const;

export function CosaMettiamoNoi() {
  return (
    <div className="mt-16">
      <h3 className="apex-eyebrow">Cosa mettiamo noi</h3>

      <ul className="mt-5 flex flex-wrap gap-3">
        {SERVIZI.map((s) => (
          <li
            key={s.testo}
            className={
              s.forte
                ? "bg-accent px-5 py-3 text-[16px] font-bold text-stage-bg"
                : "border border-accent/50 px-5 py-3 text-[16px] font-semibold text-stage-ink"
            }
          >
            {s.testo}
          </li>
        ))}
      </ul>

      <p className="mt-5 max-w-[72ch] text-[13px] leading-relaxed text-stage-muted">
        La bici da corsa è data in{" "}
        <strong className="font-semibold text-stage-ink">comodato d&apos;uso gratuito</strong> a chi
        si iscrive al corso che comprende la strada: resta di proprietà della scuola, si usa senza
        pagare nulla e si restituisce quando non serve più. Alla lezione di prova, invece, il bambino
        viene sempre con la propria bici.
      </p>
    </div>
  );
}
