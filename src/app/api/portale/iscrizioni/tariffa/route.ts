import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getBambinoById,
  calcTariffa,
} from "@/lib/airtable-portale";

/**
 * GET /api/portale/iscrizioni/tariffa?bambinoId=...&anno=2026
 * Ritorna la tariffa applicabile + sconto famiglia per il genitore.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const bambinoId = url.searchParams.get("bambinoId");
  const anno = parseInt(url.searchParams.get("anno") ?? "", 10);
  if (!bambinoId || !Number.isFinite(anno)) {
    return NextResponse.json({ error: "bambinoId e anno obbligatori" }, { status: 400 });
  }

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });

  const bambino = await getBambinoById(bambinoId);
  if (!bambino) return NextResponse.json({ error: "Bambino non trovato" }, { status: 404 });
  if (!bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await calcTariffa(genitore.id, anno);
  if (!result) {
    return NextResponse.json(
      { error: "Nessuna tariffa attiva per l'anno richiesto" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    tariffaId: result.tariffa.id,
    quarter: result.quarter,
    anno: result.anno,
    importoIscrizione: result.tariffa.fields.IMPORTO_ISCRIZIONE,
    importoRata: result.tariffa.fields.IMPORTO_RATA,
    importoKit: result.tariffa.fields.IMPORTO_KIT_SCUOLA,
    numeroRate: result.tariffa.fields.NUMERO_RATE,
    quotaTotaleAnno: result.tariffa.fields.QUOTA_TOTALE_ANNO,
    scontoFamiglia: result.scontoFamiglia,
    scontoImporto: result.scontoImporto,
    importoTotale: result.importoTotale,
    ordineIscrizioneGenitore: result.ordineIscrizioneGenitore,
    descrizione: result.tariffa.fields.DESCRIZIONE_TARIFFA,
    scadenzaRate: result.tariffa.fields.SCADENZA_RATE,
    regolamentoUrl: result.tariffa.fields.REGOLAMENTO?.[0]?.url ?? null,
    regolamentoFilename: result.tariffa.fields.REGOLAMENTO?.[0]?.filename ?? null,
  });
}
