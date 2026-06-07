// Tipi condivisi delle Server Action lezioni. File SENZA direttiva "use server":
// un file "use server" può esportare solo async function (pattern EVO-019).

/** Lezione esistente che collide con quella che il maestro sta caricando. */
export interface LezioneConflittoDTO {
  id: string;
  tipoLabel: string;
  nBambini: number;
  compilatoriNomi: string[];
  /** Il maestro corrente è già fra i presenti di questa lezione. */
  giaPresente: boolean;
}
