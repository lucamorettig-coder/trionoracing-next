/**
 * Codici sconto (EVO-028).
 *
 * Logica pura di validazione + tipi condivisi. NESSUN fetch/env qui: i fetch
 * stanno in `airtable-portale.ts` (lettura lato genitore) e `airtable-admin.ts`
 * (CRUD lato admin). Tabella Airtable: "Codici Sconto".
 *
 * Lo stesso `validaCodiceSconto` è usato sia dalla preview (server action del
 * checkout) sia dalla rivalidazione nella route di creazione checkout: single
 * source of truth, niente di cui fidarsi lato client.
 */

export interface CodiceSconto {
  id: string;
  createdTime?: string;
  fields: {
    CODICE?: string;
    IMPORTO?: number;
    /** YYYY-MM-DD, incluso. */
    VALIDO_DA?: string;
    /** YYYY-MM-DD, incluso. */
    VALIDO_A?: string;
    ATTIVO?: boolean;
    DESCRIZIONE?: string;
  };
}

/**
 * Normalizza un codice: trim + maiuscolo + solo caratteri sicuri `[A-Z0-9_-]`.
 * Usata sia in scrittura (admin) sia in lettura (lookup) così il match è
 * sempre coerente, e l'interpolazione in `filterByFormula` è injection-safe.
 */
export function normalizzaCodice(input: string): string {
  return (input ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

export type MotivoRifiuto =
  | "non_trovato"
  | "inattivo"
  | "non_iniziato"
  | "scaduto"
  | "sconto_troppo_alto"
  | "importo_non_valido";

export type RisultatoValidazione =
  | { valido: true; codice: string; sconto: number; nuovoImporto: number }
  | { valido: false; motivo: MotivoRifiuto };

/**
 * Valida un codice sconto rispetto a un importo e a una data (`oggi`, YYYY-MM-DD).
 * Pura: il record va recuperato a monte (`getCodiceByCodice`). `oggi` è iniettata
 * per testabilità.
 *
 * Regole (EVO-028): il record deve esistere, essere ATTIVO, `oggi` deve cadere in
 * `[VALIDO_DA, VALIDO_A]` (estremi inclusi), e lo sconto deve lasciare un importo
 * finale strettamente positivo — uno sconto ≥ importo NON è applicabile.
 */
export function validaCodiceSconto(
  record: CodiceSconto | null,
  importo: number,
  oggi: string,
): RisultatoValidazione {
  if (!record) return { valido: false, motivo: "non_trovato" };
  const f = record.fields;
  if (!f.ATTIVO) return { valido: false, motivo: "inattivo" };
  if (!importo || importo <= 0) return { valido: false, motivo: "importo_non_valido" };

  // Confronto lessicografico su date ISO YYYY-MM-DD (estremi inclusi).
  if (f.VALIDO_DA && oggi < f.VALIDO_DA) return { valido: false, motivo: "non_iniziato" };
  if (f.VALIDO_A && oggi > f.VALIDO_A) return { valido: false, motivo: "scaduto" };

  const sconto = f.IMPORTO ?? 0;
  if (sconto <= 0) return { valido: false, motivo: "non_trovato" };
  // Sconto ≥ importo → non applicabile (l'importo finale deve restare > 0).
  if (sconto >= importo) return { valido: false, motivo: "sconto_troppo_alto" };

  return {
    valido: true,
    codice: normalizzaCodice(f.CODICE ?? ""),
    sconto,
    nuovoImporto: importo - sconto,
  };
}

/** Messaggio IT da mostrare all'utente per un motivo di rifiuto. */
export function messaggioRifiuto(motivo: MotivoRifiuto): string {
  switch (motivo) {
    case "non_trovato":
      return "Codice non valido.";
    case "inattivo":
      return "Questo codice non è più attivo.";
    case "non_iniziato":
      return "Questo codice non è ancora valido.";
    case "scaduto":
      return "Questo codice è scaduto.";
    case "sconto_troppo_alto":
      return "Lo sconto supera l'importo da pagare: questo codice non è applicabile.";
    case "importo_non_valido":
      return "Importo non valido per applicare un codice.";
  }
}
