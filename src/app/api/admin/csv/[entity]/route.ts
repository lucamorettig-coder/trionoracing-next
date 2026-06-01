import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";
import {
  getAllIscrizioni,
  getAllBambini,
  getAllTitoli,
  getAllTariffe,
  getAllGare,
  getIscrizioniByGara,
  getAllLezioni,
  getAllGenitori,
  getPresenzeAggregato,
  fetchAllPages,
  parseLezioniFilters,
  parseGenitoriFilters,
  parsePresenzeFilters,
  csvWriter,
} from "@/lib/airtable-admin";
import type { PresenzaMaestro, Maestro } from "@/lib/airtable-portale";

const KNOWN_ENTITIES = new Set([
  "iscrizioni",
  "bambini",
  "pagamenti",
  "lezioni",
  "presenze-maestri",
  "presenze-riepilogo",
  "genitori",
  "tariffe",
  "gare",
  "iscrizioni-gara",
]);

const ENTITY_TO_EVO: Record<string, string> = {};

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

  if (entity === "gare") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const filters = (body?.filters ?? {}) as {
      toggle?: "future" | "passate";
      search?: string;
    };
    const toggle: "future" | "passate" = filters.toggle === "passate" ? "passate" : "future";
    const gare = await getAllGare({ toggle, search: filters.search });
    const enriched = gare.map((g) => ({
      ...g,
      numIscrizioni: g.iscrizioniGareIds.length,
    }));
    const csv = csvWriter(enriched, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "data", label: "Data", accessor: (r) => r.data },
      { key: "nome", label: "Nome gara", accessor: (r) => r.nomeGara },
      { key: "luogo", label: "Luogo", accessor: (r) => r.luogo },
      { key: "tipo", label: "Tipo Gara", accessor: (r) => r.tipoGara ?? "" },
      { key: "classe", label: "Classe", accessor: (r) => r.classe ?? "" },
      { key: "comitato", label: "Comitato", accessor: (r) => r.comitatoRegionale ?? "" },
      { key: "descrizione", label: "Descrizione", accessor: (r) => r.descrizione ?? "" },
      { key: "note", label: "Note interne", accessor: (r) => r.note ?? "" },
      { key: "fci_id", label: "ID Gara FCI", accessor: (r) => r.idGaraFci ?? "" },
      { key: "fci_link", label: "Link FCI", accessor: (r) => r.linkFci ?? "" },
      { key: "in_evidenza", label: "In evidenza", accessor: (r) => (r.inEvidenza ? "SI" : "NO") },
      { key: "num_maestri", label: "N. maestri assegnati", accessor: (r) => r.maestroAccompagnatoreIds.length },
      { key: "num_iscrizioni", label: "N. iscrizioni", accessor: (r) => r.numIscrizioni },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gare-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "iscrizioni-gara") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const filters = (body?.filters ?? {}) as { garaId?: string };
    if (!filters.garaId) {
      return NextResponse.json({ error: "garaId richiesto" }, { status: 400 });
    }
    const iscrizioni = await getIscrizioniByGara(filters.garaId);
    const csv = csvWriter(iscrizioni, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "bambino_cognome", label: "Cognome bambino", accessor: (r) => r.bambinoCognome },
      { key: "bambino_nome", label: "Nome bambino", accessor: (r) => r.bambinoNome },
      { key: "bambino_data_nascita", label: "Data nascita bambino", accessor: (r) => r.bambinoDataNascita ?? "" },
      { key: "categoria_fci", label: "Categoria FCI", accessor: (r) => r.categoriaFCI ?? "" },
      { key: "genitore_cognome", label: "Cognome genitore", accessor: (r) => r.genitoreCognome },
      { key: "genitore_nome", label: "Nome genitore", accessor: (r) => r.genitoreNome },
      { key: "genitore_email", label: "Email genitore", accessor: (r) => r.genitoreEmail ?? "" },
      { key: "stato", label: "Stato", accessor: (r) => r.stato },
      { key: "data_richiesta", label: "Data richiesta", accessor: (r) => r.dataRichiesta ?? "" },
      { key: "data_conferma", label: "Data conferma", accessor: (r) => r.dataConferma ?? "" },
      { key: "note_genitore", label: "Note genitore", accessor: (r) => r.noteGenitore ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="iscrizioni-gara-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "lezioni") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const f = (body?.filters ?? {}) as Record<string, unknown>;
    const params = new URLSearchParams();
    if (f.anno) params.set("anno", String(f.anno));
    if (f.mese) params.set("mese", String(f.mese));
    if (f.maestroId) params.set("maestro", String(f.maestroId));
    if (f.bambinoSearch) params.set("search", String(f.bambinoSearch));
    const filters = parseLezioniFilters(params);
    const lezioni = await getAllLezioni(filters);
    const csv = csvWriter(lezioni, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "data", label: "Data", accessor: (r) => r.fields.DATA ?? "" },
      { key: "tipo_sessione", label: "Tipo sessione", accessor: (r) => r.fields.TIPO_SESSIONE ?? "" },
      { key: "argomento", label: "Argomento (NOTE_ATTIVITA)", accessor: (r) => r.fields.NOTE_ATTIVITA ?? "" },
      { key: "attivita", label: "Attività svolte", accessor: (r) => (r.fields.ATTIVITA_SVOLTE ?? []).join("; ") },
      { key: "n_maestri", label: "N. maestri", accessor: (r) => (r.fields.MAESTRI_PRESENTI?.length ?? 0) },
      { key: "n_bambini", label: "N. bambini", accessor: (r) => (r.fields.BAMBINI_PRESENTI?.length ?? 0) },
      { key: "compilatore", label: "ID compilatore", accessor: (r) => r.fields.MAESTRO_COMPILATORE?.[0] ?? "" },
      { key: "note_interne", label: "Note interne", accessor: (r) => r.fields.NOTE_INTERNE ?? "" },
      { key: "data_compilazione", label: "Data compilazione", accessor: (r) => r.fields.DATA_COMPILAZIONE ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lezioni-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "presenze-maestri") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const f = (body?.filters ?? {}) as Record<string, unknown>;
    const params = new URLSearchParams();
    if (f.mese) params.set("mese", String(f.mese));
    if (f.anno) params.set("anno", String(f.anno));
    const filters = parsePresenzeFilters(params);
    const formula = `AND(YEAR({DATA})=${filters.anno},MONTH({DATA})=${filters.mese})`;
    const presenze = await fetchAllPages<PresenzaMaestro>("PRESENZE_MAESTRI", {
      filterByFormula: formula,
      sort: [{ field: "DATA", direction: "desc" }],
    });
    const maestriIds = Array.from(
      new Set(presenze.flatMap((p) => p.fields.MAESTRO ?? [])),
    );
    const maestriById = new Map<string, Maestro>();
    if (maestriIds.length > 0) {
      const cond = maestriIds.map((id) => `RECORD_ID()="${id}"`).join(",");
      const ms = await fetchAllPages<Maestro>("TABELLA_MAESTRI", {
        filterByFormula: `OR(${cond})`,
        fields: ["NOME_MAESTRO", "COGNOME_MAESTRO"],
      });
      for (const m of ms) maestriById.set(m.id, m);
    }
    const csv = csvWriter(presenze, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "data", label: "Data", accessor: (r) => r.fields.DATA ?? "" },
      { key: "tipo", label: "Tipo", accessor: (r) => r.fields.TIPO ?? "" },
      {
        key: "maestro",
        label: "Maestro",
        accessor: (r) => {
          const m = maestriById.get(r.fields.MAESTRO?.[0] ?? "");
          return m ? `${m.fields.COGNOME_MAESTRO} ${m.fields.NOME_MAESTRO}` : "";
        },
      },
      { key: "importo", label: "Importo dovuto (€)", accessor: (r) => r.fields.IMPORTO_DOVUTO ?? 0 },
      { key: "pagato", label: "Pagato", accessor: (r) => (r.fields.PAGATO ? "SI" : "NO") },
      { key: "data_pagamento", label: "Data pagamento", accessor: (r) => r.fields.DATA_PAGAMENTO ?? "" },
      { key: "lezione_id", label: "ID lezione", accessor: (r) => r.fields.LEZIONE?.[0] ?? "" },
      { key: "gara_id", label: "ID gara", accessor: (r) => r.fields.GARA?.[0] ?? "" },
      { key: "note", label: "Note", accessor: (r) => r.fields.NOTE ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="presenze-maestri-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (entity === "presenze-riepilogo") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const f = (body?.filters ?? {}) as Record<string, unknown>;
    const params = new URLSearchParams();
    if (f.mese) params.set("mese", String(f.mese));
    if (f.anno) params.set("anno", String(f.anno));
    const filters = parsePresenzeFilters(params);
    const aggregato = await getPresenzeAggregato(filters);
    const csv = csvWriter(aggregato, [
      { key: "cognome", label: "Cognome", accessor: (r) => r.maestroCognome },
      { key: "nome", label: "Nome", accessor: (r) => r.maestroNome },
      { key: "qualifica", label: "Qualifica", accessor: (r) => r.maestroQualifica ?? "" },
      { key: "mese", label: "Mese", accessor: () => filters.mese },
      { key: "anno", label: "Anno", accessor: () => filters.anno },
      { key: "n_lezioni", label: "N. lezioni", accessor: (r) => r.nLezioni },
      { key: "n_gare", label: "N. gare", accessor: (r) => r.nGare },
      { key: "n_totali", label: "N. presenze totali", accessor: (r) => r.presenzeTotali },
      { key: "dovuto", label: "Dovuto (€)", accessor: (r) => r.dovuto },
      { key: "pagato", label: "Pagato (€)", accessor: (r) => r.pagato },
      { key: "residuo", label: "Residuo (€)", accessor: (r) => r.residuo },
      { key: "n_pagate", label: "N. pagate", accessor: (r) => r.presenzePagate },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="presenze-riepilogo-${filters.anno}-${String(filters.mese).padStart(2, "0")}.csv"`,
      },
    });
  }

  if (entity === "genitori") {
    const body = await _req.clone().json().catch(() => ({} as Record<string, unknown>));
    const f = (body?.filters ?? {}) as Record<string, unknown>;
    const params = new URLSearchParams();
    if (Array.isArray(f.ruolo)) (f.ruolo as string[]).forEach((r) => params.append("ruolo", r));
    if (f.search) params.set("search", String(f.search));
    if (f.soloConFigli) params.set("conFigli", "1");
    const filters = parseGenitoriFilters(params);
    const genitori = await getAllGenitori(filters);
    const csv = csvWriter(genitori, [
      { key: "id", label: "ID", accessor: (r) => r.id },
      { key: "nome", label: "Nome", accessor: (r) => r.fields.NOME_GENITORE ?? "" },
      { key: "cognome", label: "Cognome", accessor: (r) => r.fields.COGNOME_GENITORE ?? "" },
      { key: "email", label: "Email", accessor: (r) => r.fields.EMAIL_GENITORE ?? "" },
      { key: "cellulare", label: "Cellulare", accessor: (r) => r.fields.CELLULARE_GENITORE ?? "" },
      { key: "ruolo", label: "Ruolo", accessor: (r) => r.fields.RUOLO ?? "GENITORE" },
      { key: "cf", label: "Codice fiscale", accessor: (r) => r.fields.CODICE_FISCALE_GENITORE ?? "" },
      { key: "data_nascita", label: "Data nascita", accessor: (r) => r.fields.DATA_NASCITA_GENITORE ?? "" },
      { key: "luogo_nascita", label: "Luogo nascita", accessor: (r) => r.fields.LUOGO_NASCITA_GENITORE ?? "" },
      { key: "via", label: "Via residenza", accessor: (r) => r.fields.VIA_RESIDENZA_GENITORE ?? "" },
      { key: "citta", label: "Città residenza", accessor: (r) => r.fields.CITTA_RESIDENZA_GENITORE ?? "" },
      { key: "n_figli", label: "N. figli", accessor: (r) => r.fields.TABELLA_BAMBINI?.length ?? 0 },
      { key: "registrato_il", label: "Registrato il", accessor: (r) => r.fields.CREATED_AT ?? r.createdTime ?? "" },
      { key: "clerk_id", label: "Clerk user ID", accessor: (r) => r.fields.AUTH_USER_ID ?? "" },
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="genitori-${new Date().toISOString().slice(0, 10)}.csv"`,
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
