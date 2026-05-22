import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  updateGenitore,
  type GenitoreCreateInput,
} from "@/lib/airtable-portale";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 404 });

  const data = (await req.json()) as Partial<GenitoreCreateInput>;
  // Non permettere cambio email via questa route (gestita da Clerk)
  delete (data as Record<string, unknown>).EMAIL_GENITORE;
  delete (data as Record<string, unknown>).AUTH_USER_ID;
  delete (data as Record<string, unknown>).RUOLO;

  const updated = await updateGenitore(genitore.id, data);
  return NextResponse.json({ genitore: updated });
}
