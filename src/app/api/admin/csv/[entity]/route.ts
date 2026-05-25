import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";
import {
  getAllIscrizioni,
  getAllBambini,
  getAllTitoli,
  getAllTariffe,
  csvWriter,
} from "@/lib/airtable-admin";

const KNOWN_ENTITIES = new Set([
  "iscrizioni",
  "bambini",
  "pagamenti",
  "lezioni",
  "presenze-maestri",
  "genitori",
  "tariffe",
  "gare",
]);

const ENTITY_TO_EVO: Record<string, string> = {
  gare: "EVO-019",
  lezioni: "EVO-020",
  "presenze-maestri": "EVO-020",
  genitori: "EVO-020",
};

async function checkAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ entity: string }> },
): Promise<NextResponse> {
  const { entity } = await context.params;

  const authError = await checkAdmin();
  if (authError) return authError;

  if (!KNOWN_ENTITIES.has(entity)) {
    return NextResponse.json({ error: `Unknown entity '${entity}'` }, { status: 404 });
  }

  if (entity === "iscrizioni") {
    const iscrizioni = await getAllIscrizioni();
    const csv = csvWriter(iscrizioni, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "bambino", label: "Bambino", accessor: (r) => `${r.fields.NOME_BAMBINO ?? ""} ${r.fields.COGNOME_BAMBINO ?? ""}`.trim() },
      { key: "genitore", label: "Genitore", accessor: (r) => `${r.fields.NOME_GENITORE ?? ""} ${r.fields.COGNOME_GENITORE ?? ""}`.trim() },
      { key: "corso", label: "Corso", accessor: (r) => r.fields.CORSO ?? "" },
      { key: "anno", label: "Anno", accessor: (r) => r.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "" },
      { key: "stato", label: "Stato", accessor: (r) => r.fields.STATO_ISCRIZIONE ?? "" },
      { key: "annullata", label: "Annullata", accessor: (r) => r.fields.ANNULLATA ? "SI" : "NO" },
      { key: "importo", label: "Importo finale (€)", accessor: (r) => r.fields.IMPORTO_FINALE_ANNUO ?? "" },
      { key: "prima_rata", label: "Prima rata pagata", accessor: (r) => r.fields.PRIMA_RATA_PAGATA ? "SI" : "NO" },
      { key: "data_iscrizione", label: "Data iscrizione", accessor: (r) => r.fields.DATA_ISCRIZIONE ?? "" },
      { key: "privacy", label: "Privacy", accessor: (r) => r.fields.PRIVACY_MINORE ? "SI" : "NO" },
      { key: "regolamento", label: "Regolamento", accessor: (r) => r.fields.FLAG_REGOLAMENTO ? "SI" : "NO" },
      { key: "modulo_triono", label: "Modulo Triono", accessor: (r) => r.fields.MODULO_TRIONO_STATO ?? "" },
      { key: "modulo_fci", label: "Modulo FCI", accessor: (r) => r.fields.MODULO_FCI_STATO ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="iscrizioni-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "bambini") {
    const bambini = await getAllBambini();
    const csv = csvWriter(bambini, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "nome", label: "Nome", accessor: (r) => r.fields.NOME_BAMBINO ?? "" },
      { key: "cognome", label: "Cognome", accessor: (r) => r.fields.COGNOME_BAMBINO ?? "" },
      { key: "data_nascita", label: "Data di nascita", accessor: (r) => r.fields.DATA_NASCITA_BAMBINO ?? "" },
      { key: "luogo_nascita", label: "Luogo di nascita", accessor: (r) => r.fields.LUOGO_NASCITA_BAMBINO ?? "" },
      { key: "cf", label: "Codice Fiscale", accessor: (r) => r.fields.CODICE_FISCALE_BAMBINO ?? "" },
      { key: "via", label: "Via residenza", accessor: (r) => r.fields.VIA_RESIDENZA_BAMBINO ?? "" },
      { key: "citta", label: "Città residenza", accessor: (r) => r.fields.CITTA_RESIDENZA_BAMBINO ?? "" },
      { key: "cert_stato", label: "Certificato stato", accessor: (r) => r.fields.CERTIFICATO_MEDICO_STATO ?? "" },
      { key: "cert_scadenza", label: "Certificato scadenza", accessor: (r) => r.fields.CERTIFICATO_MEDICO_SCADENZA ?? "" },
      { key: "n_iscrizioni", label: "N. iscrizioni", accessor: (r) => r.fields.TABELLA_ISCRIZIONI?.length ?? 0 },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bambini-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "pagamenti") {
    const titoli = await getAllTitoli();
    const csv = csvWriter(titoli, [
      { key: "codice", label: "ID titolo", accessor: (r) => r.fields.CODICE_TITOLO ?? r.id },
      { key: "data_pag", label: "Data pagamento", accessor: (r) => r.fields.DATA_PAGAMENTO ?? "" },
      { key: "data_scad", label: "Data scadenza", accessor: (r) => r.fields.DATA_SCADENZA_PAGAMENTO ?? "" },
      { key: "importo", label: "Importo (€)", accessor: (r) => r.fields.IMPORTO ?? 0 },
      { key: "metodo", label: "Metodo", accessor: (r) => r.fields.METODO_PAGAMENTO ?? "" },
      { key: "provider", label: "Provider", accessor: (r) => r.fields.PROVIDER_PAGAMENTO ?? "" },
      { key: "stato", label: "Stato", accessor: (r) => r.fields.STATO_TITOLO ?? "" },
      { key: "pagato", label: "Pagato", accessor: (r) => r.fields.PAGATO ? "SI" : "NO" },
      { key: "tipo", label: "Tipo titolo", accessor: (r) => r.fields.TIPO_TITOLO ?? "" },
      { key: "numero_rata", label: "N. rata", accessor: (r) => r.fields.NUMERO_RATA ?? "" },
      {
        key: "bambino",
        label: "Bambino",
        accessor: (r) =>
          `${r.iscrizione?.fields.NOME_BAMBINO ?? ""} ${r.iscrizione?.fields.COGNOME_BAMBINO ?? ""}`.trim(),
      },
      {
        key: "genitore",
        label: "Genitore",
        accessor: (r) =>
          `${r.iscrizione?.fields.NOME_GENITORE ?? ""} ${r.iscrizione?.fields.COGNOME_GENITORE ?? ""}`.trim(),
      },
      { key: "iscrizione", label: "ID Iscrizione", accessor: (r) => r.iscrizione?.fields.ID_ISCRIZIONE ?? r.fields.ISCRIZIONE?.[0] ?? "" },
      { key: "anno", label: "Anno", accessor: (r) => r.fields.ANNO_ISCRIZIONE?.[0] ?? "" },
      { key: "descrizione", label: "Descrizione", accessor: (r) => r.fields.DESCRIZIONE ?? "" },
      { key: "note", label: "Note interne", accessor: (r) => r.fields.NOTE_INTERNE ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pagamenti-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "tariffe") {
    const tariffe = await getAllTariffe();
    const csv = csvWriter(tariffe, [
      { key: "anno", label: "Anno", accessor: (r) => r.fields.ANNO_ISCRIZIONE ?? "" },
      { key: "quarter", label: "Quarter", accessor: (r) => r.fields.NOME_TARIFFA ?? "" },
      { key: "descrizione", label: "Descrizione", accessor: (r) => r.fields.DESCRIZIONE_TARIFFA ?? "" },
      { key: "quota_tot", label: "Quota totale (€)", accessor: (r) => r.fields.QUOTA_TOTALE_ANNO ?? "" },
      { key: "n_rate", label: "N. rate", accessor: (r) => r.fields.NUMERO_RATE ?? "" },
      { key: "imp_rata", label: "Importo rata (€)", accessor: (r) => r.fields.IMPORTO_RATA ?? "" },
      { key: "scadenze", label: "Scadenze", accessor: (r) => r.fields.SCADENZA_RATE ?? "" },
      { key: "kit", label: "Kit (€)", accessor: (r) => r.fields.IMPORTO_KIT_SCUOLA ?? "" },
      { key: "iscrizione_imp", label: "Iscrizione (€)", accessor: (r) => r.fields.IMPORTO_ISCRIZIONE ?? "" },
      { key: "sconto", label: "Sconto famiglia (€)", accessor: (r) => r.fields.SCONTO_FAMIGLIA_NUMEROSA ?? "" },
      { key: "attiva", label: "Attiva", accessor: (r) => r.fields.ATTIVA ? "SI" : "NO" },
      { key: "n_iscr", label: "N. iscrizioni collegate", accessor: (r) => r.fields.TABELLA_ISCRIZIONI?.length ?? 0 },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tariffe-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const evo = ENTITY_TO_EVO[entity] ?? "una futura evolutiva";
  return NextResponse.json(
    {
      error: `Entity '${entity}' not implemented yet. Will be added in ${evo}.`,
    },
    { status: 501 },
  );
}
