/**
 * I tre servizi che il sito non nominava da nessuna parte e che i genitori
 * non possono immaginare da soli (EVO-046).
 *
 * PERIMETRO DEL COMODATO, VINCOLANTE: vale DOPO l'iscrizione, e solo per
 * chi sceglie il corso che comprende la strada. Alla prova il bambino
 * viene sempre con la propria bici. Non modificare questo copy senza
 * riverificare il perimetro: è un impegno che la scuola deve mantenere.
 */
const SERVIZI = [
  {
    titolo: "La bici da corsa",
    testo:
      "Chi si iscrive al corso che comprende la strada riceve la bici da corsa in comodato d'uso gratuito. Non serve comprarla per capire se piace.",
  },
  {
    titolo: "L'area riservata",
    testo:
      "Iscrizione, rinnovo del certificato medico, quote e rate mensili: tutto online, in un'unica area riservata.",
  },
  {
    titolo: "I maestri",
    testo: "Maestri federali e gruppi piccoli, divisi per età.",
  },
] as const;

export function CosaMettiamoNoi() {
  return (
    <div className="mt-16">
      <h3 className="apex-eyebrow text-stage-muted">Cosa mettiamo noi</h3>
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {SERVIZI.map((s) => (
          <div key={s.titolo}>
            <p className="text-[15px] font-semibold">{s.titolo}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-stage-muted">{s.testo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
