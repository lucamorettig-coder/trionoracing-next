import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  createBambino,
  type BambinoCreateInput,
} from "@/lib/airtable-portale";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });

  const body = await req.json();

  const { NOME_BAMBINO, COGNOME_BAMBINO, DATA_NASCITA_BAMBINO, ...rest } = body as Partial<BambinoCreateInput>;

  if (!NOME_BAMBINO?.trim() || !COGNOME_BAMBINO?.trim() || !DATA_NASCITA_BAMBINO) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const data: BambinoCreateInput = {
    NOME_BAMBINO: NOME_BAMBINO.trim(),
    COGNOME_BAMBINO: COGNOME_BAMBINO.trim(),
    DATA_NASCITA_BAMBINO,
    TABELLA_GENITORI: [genitore.id],
    ...rest,
  };

  const bambino = await createBambino(data);
  return NextResponse.json({ bambino }, { status: 201 });
}
