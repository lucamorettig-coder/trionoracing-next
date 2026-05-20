import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/contatti
 *
 * Riceve submission del form contatti pubblico, valida con zod,
 * crea record nella tabella CONTATTI di Airtable.
 *
 * Anti-spam (lightweight): honeypot field "website" — i bot di solito riempiono
 * tutti gli input HTML, gli umani non lo vedono (display:none lato client).
 * Se popolato, fingiamo successo silente (no error → bot non capisce).
 *
 * Rate limiting: NON implementato. Per ora ci affidiamo alla Vercel Firewall
 * base + bot detection Clerk middleware. Se vediamo spam in CONTATTI, aggiungere
 * upstash/rate-limit o Vercel Rate Limit (D-25 follow-up).
 */

const contattoSchema = z.object({
  nome: z.string().trim().min(2, "Nome troppo corto").max(80),
  cognome: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Email non valida").max(120),
  telefono: z.string().trim().max(40).optional().or(z.literal("")),
  motivo: z.enum([
    "Scuola di Ciclismo",
    "Tesseramento Amatori",
    "Marathon 209",
    "Altro",
  ]),
  messaggio: z.string().trim().min(10, "Messaggio troppo corto").max(4000),
  privacy_ok: z
    .boolean()
    .refine((v) => v === true, { message: "Devi accettare l'informativa privacy" }),
  // honeypot — accetta qualsiasi valore in schema, il controllo "è popolato?"
  // sta nel handler così possiamo restituire silent-success al bot invece di 422
  website: z.string().optional(),
});

type ContattoInput = z.infer<typeof contattoSchema>;

interface AirtableRecordPayload {
  fields: {
    NOME: string;
    COGNOME?: string;
    EMAIL: string;
    TELEFONO?: string;
    MOTIVO: ContattoInput["motivo"];
    MESSAGGIO: string;
    PRIVACY_OK: boolean;
    STATO: "Nuovo";
    RICEVUTO_IL: string;
    USER_AGENT?: string;
    REFERER?: string;
  };
}

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_CONTATTI_TABLE = "CONTATTI";

export async function POST(req: Request) {
  // Validazione env (fail-fast se mancano in deployment)
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
    console.error("[contatti] Missing Airtable env vars");
    return NextResponse.json(
      { error: "Servizio non configurato. Scrivici a info@trionoracing.it" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  const parsed = contattoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validazione fallita",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot triggered → finto successo silente (no error → bot resta confuso)
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const userAgent = req.headers.get("user-agent") || undefined;
  const referer = req.headers.get("referer") || undefined;

  const payload: AirtableRecordPayload = {
    fields: {
      NOME: data.nome,
      EMAIL: data.email,
      MOTIVO: data.motivo,
      MESSAGGIO: data.messaggio,
      PRIVACY_OK: data.privacy_ok,
      STATO: "Nuovo",
      RICEVUTO_IL: new Date().toISOString(),
      ...(data.cognome ? { COGNOME: data.cognome } : {}),
      ...(data.telefono ? { TELEFONO: data.telefono } : {}),
      ...(userAgent ? { USER_AGENT: userAgent } : {}),
      ...(referer ? { REFERER: referer } : {}),
    },
  };

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTATTI_TABLE}`;

  const airtableRes = await fetch(airtableUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!airtableRes.ok) {
    const text = await airtableRes.text();
    console.error("[contatti] Airtable write failed", airtableRes.status, text);
    return NextResponse.json(
      { error: "Salvataggio fallito. Riprova tra qualche minuto." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
