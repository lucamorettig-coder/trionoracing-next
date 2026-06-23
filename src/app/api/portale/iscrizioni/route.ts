import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getBambinoById,
  getIscrizioniBambino,
  calcTariffa,
  createIscrizione,
  parseTipoCorso,
} from "@/lib/airtable-portale";
import { isProfiloGenitoreCompleto } from "@/lib/portale-utils";

/**
 * POST /api/portale/iscrizioni
 * Body: { bambinoId, anno, corso }
 * Crea iscrizione + prima rata. 409 se esiste già per quel bambino/anno.
 * `corso` (default MTB-BDC) seleziona la tariffa del tipo corso scelto (EVO-026).
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const bambinoId = body.bambinoId as string | undefined;
  const anno = Number(body.anno);
  const corso = parseTipoCorso(body.corso);

  if (!bambinoId || !Number.isFinite(anno)) {
    return NextResponse.json({ error: "bambinoId e anno obbligatori" }, { status: 400 });
  }

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });

  // Guard EVO-029: profilo genitore completo è obbligatorio per iscrivere un minore
  // (dati necessari al tesseramento FCI). Anti-bypass: non ci fidiamo del solo client.
  if (!isProfiloGenitoreCompleto(genitore)) {
    return NextResponse.json(
      {
        error:
          "Completa prima i tuoi dati anagrafici (cellulare, data e luogo di nascita, codice fiscale, residenza) dal profilo.",
        code: "PROFILO_INCOMPLETO",
      },
      { status: 422 },
    );
  }

  const bambino = await getBambinoById(bambinoId);
  if (!bambino) return NextResponse.json({ error: "Bambino non trovato" }, { status: 404 });
  if (!bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verifica unicità (un'iscrizione per figlio per anno)
  const iscrizioniBambino = await getIscrizioniBambino(bambinoId);
  const duplicato = iscrizioniBambino.find((i) => {
    const a = i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
    return a === `${anno}`;
  });
  if (duplicato) {
    return NextResponse.json(
      { error: `${bambino.fields.NOME_BAMBINO} è già iscritto per l'anno ${anno}.`, iscrizioneId: duplicato.id },
      { status: 409 },
    );
  }

  const calcResult = await calcTariffa(genitore.id, anno, undefined, bambinoId, corso);
  if (!calcResult) {
    return NextResponse.json(
      { error: "Nessuna tariffa attiva per l'anno richiesto. Contatta la segreteria." },
      { status: 400 },
    );
  }

  try {
    // CORSO viene scritto da createIscrizione dal TIPO_CORSO della tariffa selezionata.
    const iscrizione = await createIscrizione(
      {
        TABELLA_BAMBINI: [bambinoId],
        TABELLA_GENITORI: [genitore.id],
        TABELLA_TARIFFE: [calcResult.tariffa.id],
        DATA_ISCRIZIONE: new Date().toISOString().slice(0, 10),
        ORDINE_ISCRIZIONE_GENITORE: calcResult.ordineIscrizioneGenitore,
      },
      calcResult.tariffa,
      calcResult.scontoFamiglia,
    );
    return NextResponse.json({ id: iscrizione.id }, { status: 201 });
  } catch (err) {
    console.error("[api/portale/iscrizioni] create error:", err);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'iscrizione. Riprova." },
      { status: 500 },
    );
  }
}
