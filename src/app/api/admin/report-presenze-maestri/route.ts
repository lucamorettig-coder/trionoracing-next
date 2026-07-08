import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";
import { getReportPresenzeMaestri } from "@/lib/airtable-admin";
import {
  ReportPresenzeTemplate,
  REPORT_HEADER_HEIGHT,
  REPORT_ROW_HEIGHT,
  REPORT_FOOTER_HEIGHT,
} from "@/components/admin/presenze-maestri/report/ReportPresenzeTemplate";

/** Nomi mese IT capitalizzati, indicizzati 0-11. Locale a questo file (vedi AGENTS.md). */
const MESI_IT = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

async function checkAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/** Cache in memoria del logo a livello di modulo — letto una sola volta al cold start. */
let logoDataUriCache: string | null = null;

async function getLogoDataUri(): Promise<string> {
  if (logoDataUriCache) return logoDataUriCache;
  const buffer = await readFile(join(process.cwd(), "public/assets/logo-scuola.png"));
  logoDataUriCache = `data:image/png;base64,${buffer.toString("base64")}`;
  return logoDataUriCache;
}

export async function GET(request: Request): Promise<Response> {
  const authError = await checkAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const meseRaw = searchParams.get("mese");
  const annoRaw = searchParams.get("anno");
  const variante = searchParams.get("variante");

  const mese = meseRaw ? Number(meseRaw) : NaN;
  const anno = annoRaw ? Number(annoRaw) : NaN;

  if (!meseRaw || !annoRaw || !Number.isInteger(mese) || mese < 1 || mese > 12) {
    return NextResponse.json(
      { error: "Parametro 'mese' mancante o non valido (atteso un intero 1-12)." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(anno) || anno < 2000 || anno > 2100) {
    return NextResponse.json(
      { error: "Parametro 'anno' mancante o non valido." },
      { status: 400 },
    );
  }
  if (variante !== "amministrazione" && variante !== "maestri") {
    return NextResponse.json(
      { error: "Parametro 'variante' mancante o non valido (atteso 'amministrazione' o 'maestri')." },
      { status: 400 },
    );
  }

  const includeImporto = variante === "amministrazione";

  try {
    const righe = await getReportPresenzeMaestri({ mese, anno });

    if (righe.length === 0) {
      return NextResponse.json(
        { error: "Nessuna presenza trovata per il periodo selezionato." },
        { status: 404 },
      );
    }

    const periodo = `${MESI_IT[mese - 1]} ${anno}`;
    const generatedAt = new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());

    const logoSrc = await getLogoDataUri();

    const width = includeImporto ? 820 : 720;
    const height =
      REPORT_HEADER_HEIGHT + (righe.length + 2) * REPORT_ROW_HEIGHT + REPORT_FOOTER_HEIGHT;

    return new ImageResponse(
      ReportPresenzeTemplate({
        periodo,
        generatedAt,
        righe,
        includeImporto,
        logoSrc,
      }),
      { width, height },
    );
  } catch (error) {
    console.error("[report-presenze-maestri] Errore generazione report:", error);
    return NextResponse.json(
      { error: "Errore imprevisto nella generazione del report." },
      { status: 500 },
    );
  }
}
