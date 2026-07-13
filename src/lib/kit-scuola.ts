/**
 * Kit Scuola Triono — sorgente di verità dei 4 capi del kit.
 *
 * Riutilizzato da:
 * - `src/components/scuola/SezioneKitScuola.tsx` (vetrina pubblica `/la-scuola`)
 * - (futuro EVO-011) `src/components/portale/iscrizioni/tabs/TabTaglie.tsx`
 *
 * Mapping con schema Airtable TABELLA_ISCRIZIONI:
 * - maglia → TAGLIA_MAGLIA
 * - salopette → TAGLIA_PANTALONCINO
 * - felpa + pantalone-felpa → TAGLIA_TUTA (unica misura per i due capi insieme)
 */

export type CampoTagliaAirtable =
  | "TAGLIA_MAGLIA"
  | "TAGLIA_PANTALONCINO"
  | "TAGLIA_TUTA";

export interface CapoKit {
  /** Slug stabile per riferimenti interni (no hashing su array index) */
  slug: "maglia" | "salopette" | "felpa" | "pantalone-felpa";
  /** Numero d'ordine 1-4 mostrato nelle pill del visual */
  numero: 1 | 2 | 3 | 4;
  /** Nome capo (UI pubblica) */
  nome: string;
  /** Micro-descrizione emozionale (1 riga, tono lifestyle) */
  descrizione: string;
  /** URL Cloudinary originale del capo */
  imageUrl: string;
  /** Alt text SEO-friendly (italiano, keyword Triono/scuola/Terni non spammose) */
  alt: string;
  /** Campo Airtable a cui questo capo è mappato per la scelta taglia */
  campoTaglia: CampoTagliaAirtable;
}

export const KIT_SCUOLA: readonly CapoKit[] = [
  {
    slug: "maglia",
    numero: 1,
    nome: "Maglia tecnica",
    descrizione: "I colori che si vedono da lontano in gruppo",
    imageUrl:
      "https://res.cloudinary.com/u5hvesvu/image/upload/hf_20260523_133738_d20ccfa0-2c67-4a5a-9d9c-2d4cafe42f4c_mgp0kb.png",
    alt: "Maglia tecnica del kit Scuola di Ciclismo Triono — colori team, fit racing per bambini",
    campoTaglia: "TAGLIA_MAGLIA",
  },
  {
    slug: "salopette",
    numero: 2,
    nome: "Salopette tecnica",
    descrizione: "Bretelle, fondello, ore di pedalata serena",
    imageUrl:
      "https://res.cloudinary.com/u5hvesvu/image/upload/hf_20260523_141906_8c7b9eed-6fa7-4eea-ba78-381defaa1aba_f1ipuw.png",
    alt: "Salopette tecnica con bretelle del kit Scuola Triono — pedalata comoda per bambini",
    campoTaglia: "TAGLIA_PANTALONCINO",
  },
  {
    slug: "felpa",
    numero: 3,
    nome: "Felpa del team",
    descrizione: "Pre-lezione, post-lezione, sempre con la squadra",
    imageUrl:
      "https://res.cloudinary.com/u5hvesvu/image/upload/hf_20260523_140605_d1c8de51-23de-483c-ab98-acf5c1770209_u30p52.jpg",
    alt: "Felpa del team Triono — capo lifestyle pre/post allenamento Scuola di Ciclismo Terni",
    campoTaglia: "TAGLIA_TUTA",
  },
  {
    slug: "pantalone-felpa",
    numero: 4,
    nome: "Pantalone in felpa",
    descrizione: "Caldo e comodo, pronto per ogni stagione",
    imageUrl:
      "https://res.cloudinary.com/u5hvesvu/image/upload/hf_20260523_134406_43e4a5fc-5deb-4e9b-b1d6-d153c7d870c2_iclqzg.png",
    alt: "Pantalone in felpa abbinato al kit Triono — comfort post-lezione Scuola Ciclismo",
    campoTaglia: "TAGLIA_TUTA",
  },
] as const;

/**
 * Opzioni singleSelect Airtable per ciascun campo taglia — mirror dello schema
 * TABELLA_ISCRIZIONI (base PROD `appszpkU1aXb3xrFM`, verificato 2026-06-06).
 *
 * Maglia e pantaloncino condividono il set taglie tecniche bambino (5XS→XS);
 * la tuta (felpa + pantalone, misura unica) usa le altezze 110/120 e 130/140.
 *
 * ⚠️ Mantenere allineato se l'admin modifica le choices su Airtable: un valore
 * non presente fra le choices produce 422 `INVALID_MULTIPLE_CHOICE_OPTIONS` al
 * salvataggio (PATCH `/api/portale/iscrizioni/[id]`).
 */
export const TAGLIE_PER_CAMPO: Record<CampoTagliaAirtable, readonly string[]> = {
  TAGLIA_MAGLIA: ["5XS", "4XS", "3XS", "2XS", "XS"],
  TAGLIA_PANTALONCINO: ["5XS", "4XS", "3XS", "2XS", "XS"],
  TAGLIA_TUTA: ["110/120", "130/140"],
} as const;

/**
 * Helper opzionale: applica trasformazioni Cloudinary inline a una URL per
 * ridurre payload (q_auto, f_auto, w_*). Usato dai componenti che renderizzano
 * thumbnail invece dell'immagine full-res.
 *
 * Esempio: cloudinaryOptimized(url, 800) → URL con /upload/q_auto,f_auto,w_800/...
 */
export function cloudinaryOptimized(url: string, width: number): string {
  return url.replace(
    "/upload/",
    `/upload/q_auto,f_auto,w_${width},c_limit/`,
  );
}
