"use client";

import * as React from "react";
import Link from "next/link";
import { UserCheck, Phone, Mail, Calendar, MapPin, IdCard, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CambiaRuoloModal } from "./CambiaRuoloModal";
import { DisabilitaAccountButton } from "./DisabilitaAccountButton";
import { RiabilitaAccountButton } from "./RiabilitaAccountButton";
import { ruoloBadge } from "./GenitoriDataTable";
import { formatEUR, formatDateIT } from "@/lib/portale-utils";
import type {
  Bambino,
  Genitore,
  Iscrizione,
  TitoloPagamento,
} from "@/lib/airtable-portale";

interface Props {
  genitore: Genitore;
  figli: Bambino[];
  iscrizioni: Iscrizione[];
  titoli: TitoloPagamento[];
}

function statoIscrizioneBadge(stato: string | undefined) {
  if (stato === "COMPLETA") return <Badge variant="success" size="sm">Completa</Badge>;
  if (stato === "SOSPESA") return <Badge variant="error" size="sm">Sospesa</Badge>;
  if (stato === "ANNULLATA") return <Badge variant="neutral" size="sm">Annullata</Badge>;
  return <Badge variant="warning" size="sm">Incompleta</Badge>;
}

function statoTitoloBadge(t: TitoloPagamento) {
  const stato = t.fields.STATO_TITOLO;
  if (stato === "pagato") return <Badge variant="success" size="sm">Pagato</Badge>;
  if (stato === "scaduto") return <Badge variant="error" size="sm">Scaduto</Badge>;
  return <Badge variant="warning" size="sm">Da pagare</Badge>;
}

export function DettaglioGenitoreCard({ genitore, figli, iscrizioni, titoli }: Props) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const f = genitore.fields;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner account disabilitato (EVO-008) */}
      {f.ACCOUNT_DISABILITATO && (
        <div className="bg-flag-50 border-l-4 border-flag-500 rounded-[var(--radius-md)] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <UserX size={18} className="text-flag-500 shrink-0 mt-0.5" />
            <div className="text-sm text-ink">
              <span className="font-semibold">Account disabilitato</span>
              {f.DATA_DISABILITAZIONE && (
                <span className="text-ink-muted">
                  {" "}
                  il {formatDateIT(f.DATA_DISABILITAZIONE)}
                </span>
              )}
              <span className="text-ink-muted">
                {" "}
                — l&apos;utente non può accedere al portale.
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <RiabilitaAccountButton genitore={genitore} />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border border-line rounded-[var(--radius-lg)] p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 shadow-[var(--shadow-xs)]">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted">
            <Link href="/portale/admin/genitori" className="hover:text-navy-700">
              Genitori
            </Link>
            <span className="mx-1">/</span>
            <span>Dettaglio</span>
          </div>
          <h1 className="text-2xl font-bold text-ink leading-tight">
            {f.COGNOME_GENITORE} {f.NOME_GENITORE}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            {f.EMAIL_GENITORE && (
              <a
                href={`mailto:${f.EMAIL_GENITORE}`}
                className="inline-flex items-center gap-1.5 hover:text-navy-700"
              >
                <Mail size={14} />
                {f.EMAIL_GENITORE}
              </a>
            )}
            {f.CELLULARE_GENITORE && (
              <a
                href={`tel:${f.CELLULARE_GENITORE}`}
                className="inline-flex items-center gap-1.5 hover:text-navy-700"
              >
                <Phone size={14} />
                {f.CELLULARE_GENITORE}
              </a>
            )}
            {ruoloBadge(f.RUOLO)}
          </div>
        </div>
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
          >
            <UserCheck size={16} />
            Cambia ruolo
          </Button>
          {!f.ACCOUNT_DISABILITATO && <DisabilitaAccountButton genitore={genitore} />}
        </div>
      </header>

      {/* Anagrafica */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
        <h2 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mb-4 flex items-center gap-1.5">
          <IdCard size={14} /> Anagrafica
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {f.CODICE_FISCALE_GENITORE && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted">
                Codice fiscale
              </dt>
              <dd className="font-mono text-ink">{f.CODICE_FISCALE_GENITORE}</dd>
            </div>
          )}
          {f.DATA_NASCITA_GENITORE && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted">
                Data nascita
              </dt>
              <dd className="text-ink tabular-nums">
                {formatDateIT(f.DATA_NASCITA_GENITORE)}
              </dd>
            </div>
          )}
          {f.LUOGO_NASCITA_GENITORE && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted">
                Luogo nascita
              </dt>
              <dd className="text-ink">{f.LUOGO_NASCITA_GENITORE}</dd>
            </div>
          )}
          {(f.VIA_RESIDENZA_GENITORE || f.CITTA_RESIDENZA_GENITORE) && (
            <div className="md:col-span-2">
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted flex items-center gap-1">
                <MapPin size={11} /> Residenza
              </dt>
              <dd className="text-ink">
                {[f.VIA_RESIDENZA_GENITORE, f.CITTA_RESIDENZA_GENITORE]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
          )}
          {(f.CREATED_AT || genitore.createdTime) && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted flex items-center gap-1">
                <Calendar size={11} /> Registrato il
              </dt>
              <dd className="text-ink tabular-nums">
                {formatDateIT(f.CREATED_AT ?? genitore.createdTime!)}
              </dd>
            </div>
          )}
          {f.AUTH_USER_ID && (
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-muted">
                Clerk user ID
              </dt>
              <dd className="font-mono text-[12px] text-ink-muted truncate">
                {f.AUTH_USER_ID}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Figli */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
        <h2 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mb-4">
          Figli collegati ({figli.length})
        </h2>
        {figli.length === 0 ? (
          <p className="text-sm text-ink-muted">Questo utente non ha bambini collegati.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {figli.map((b) => (
              <Link
                key={b.id}
                href={`/portale/admin/bambini/${b.id}`}
                className="block p-3 rounded-[var(--radius-md)] border border-line hover:border-navy-700 hover:bg-bg-soft transition-colors"
              >
                <div className="text-sm font-semibold text-ink">
                  {b.fields.COGNOME_BAMBINO} {b.fields.NOME_BAMBINO}
                </div>
                {b.fields.DATA_NASCITA_BAMBINO && (
                  <div className="text-[12px] text-ink-muted tabular-nums">
                    Nato il {formatDateIT(b.fields.DATA_NASCITA_BAMBINO)}
                  </div>
                )}
                {b.fields.CERTIFICATO_MEDICO_STATO && (
                  <div className="mt-1.5">
                    {b.fields.CERTIFICATO_MEDICO_STATO === "VALIDO" ? (
                      <Badge variant="success" size="sm">Cert. OK</Badge>
                    ) : b.fields.CERTIFICATO_MEDICO_STATO === "SCADUTO" ? (
                      <Badge variant="error" size="sm">Cert. scaduto</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        {b.fields.CERTIFICATO_MEDICO_STATO}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Iscrizioni */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
        <h2 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mb-4">
          Iscrizioni ({iscrizioni.length})
        </h2>
        {iscrizioni.length === 0 ? (
          <p className="text-sm text-ink-muted">Nessuna iscrizione registrata.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-line">
                  <th className="py-2">Anno</th>
                  <th className="py-2">Bambino</th>
                  <th className="py-2">Stato</th>
                  <th className="py-2 text-right">Quota</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {iscrizioni.map((i) => (
                  <tr key={i.id} className="border-b border-line/50">
                    <td className="py-2 tabular-nums">
                      {i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "—"}
                    </td>
                    <td className="py-2">
                      {i.fields.COGNOME_BAMBINO} {i.fields.NOME_BAMBINO}
                    </td>
                    <td className="py-2">
                      {statoIscrizioneBadge(i.fields.STATO_ISCRIZIONE)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {i.fields.IMPORTO_FINALE_ANNUO
                        ? formatEUR(i.fields.IMPORTO_FINALE_ANNUO)
                        : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/portale/admin/iscrizioni/${i.id}`}
                        className="text-[12px] text-navy-700 hover:underline"
                      >
                        Apri →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Titoli pagamento */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
        <h2 className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mb-4">
          Titoli pagamento ({titoli.length})
        </h2>
        {titoli.length === 0 ? (
          <p className="text-sm text-ink-muted">Nessun titolo pagamento registrato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-line">
                  <th className="py-2">Descrizione</th>
                  <th className="py-2">Scadenza</th>
                  <th className="py-2 text-right">Importo</th>
                  <th className="py-2">Stato</th>
                </tr>
              </thead>
              <tbody>
                {titoli.map((t) => (
                  <tr key={t.id} className="border-b border-line/50">
                    <td className="py-2">
                      {t.fields.DESCRIZIONE ?? t.fields.CODICE_TITOLO ?? "—"}
                    </td>
                    <td className="py-2 tabular-nums">
                      {t.fields.DATA_SCADENZA_PAGAMENTO
                        ? formatDateIT(t.fields.DATA_SCADENZA_PAGAMENTO)
                        : "—"}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {t.fields.IMPORTO ? formatEUR(t.fields.IMPORTO) : "—"}
                    </td>
                    <td className="py-2">{statoTitoloBadge(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CambiaRuoloModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        genitore={genitore}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
