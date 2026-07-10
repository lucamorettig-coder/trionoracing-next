"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, User, FileText, Calendar, MapPin, Hash, Mail, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { certBadgeVariant, formatDateIT, formatEUR } from "@/lib/portale-utils";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import type { Bambino, Iscrizione } from "@/lib/airtable-portale";
import { EliminaBambinoButton } from "./EliminaBambinoButton";

interface Props {
  bambino: Bambino;
  iscrizioni: Iscrizione[];
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-line last:border-0">
      <span className="mt-0.5 text-ink-muted shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] text-ink mt-0.5">{value ?? <span className="text-ink-muted">—</span>}</p>
      </div>
    </div>
  );
}

export function DettaglioBambinoAdmin({ bambino, iscrizioni }: Props) {
  const f = bambino.fields;
  const nomeCognome = `${f.NOME_BAMBINO} ${f.COGNOME_BAMBINO}`;
  const { variant: certVariant, label: certLabel } = certBadgeVariant(
    f.CERTIFICATO_MEDICO_STATO,
    f.CERTIFICATO_MEDICO_SCADENZA,
  );
  const hasIscrizioni = iscrizioni.length > 0;

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      {/* Back */}
      <Link
        href="/portale/admin/bambini"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft size={14} />
        Torna alla lista bambini
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-1">
            Bambino · {f.ID_BAMBINO ?? bambino.id.slice(-6).toUpperCase()}
          </p>
          <h1 className="text-2xl font-bold text-ink">{nomeCognome}</h1>
          {f.DATA_NASCITA_BAMBINO && (
            <p className="text-[13px] text-ink-muted mt-1">
              Nato/a il {new Date(f.DATA_NASCITA_BAMBINO).toLocaleDateString("it-IT")}
              {f.LUOGO_NASCITA_BAMBINO ? ` a ${f.LUOGO_NASCITA_BAMBINO}` : ""}
              {f.DATA_NASCITA_BAMBINO && ` · ${calcCategoriaFCI(f.DATA_NASCITA_BAMBINO) ?? ""}` }
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={certVariant} size="sm">{certLabel}</Badge>
          <EliminaBambinoButton
            bambinoId={bambino.id}
            nomeBambino={nomeCognome}
            hasIscrizioni={hasIscrizioni}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anagrafica */}
        <div className="lg:col-span-1">
          <div className="rounded-[var(--radius-lg)] border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
              <User size={14} className="text-ink-muted" />
              Anagrafica
            </h2>
            <InfoRow icon={<Hash size={14} />} label="Codice Fiscale" value={f.CODICE_FISCALE_BAMBINO} />
            <InfoRow icon={<MapPin size={14} />} label="Residenza" value={
              [f.VIA_RESIDENZA_BAMBINO, f.CITTA_RESIDENZA_BAMBINO].filter(Boolean).join(", ") || undefined
            } />
            <InfoRow
              icon={<Mail size={14} />}
              label="Email genitore"
              value={(f.EMAIL_GENITORE as string[] | undefined)?.[0]}
            />
          </div>

          {/* Certificato medico */}
          <div className="rounded-[var(--radius-lg)] border border-line bg-white p-4 mt-4">
            <h2 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
              <FileText size={14} className="text-ink-muted" />
              Certificato medico
            </h2>
            <InfoRow icon={<Calendar size={14} />} label="Scadenza" value={
              f.CERTIFICATO_MEDICO_SCADENZA ? formatDateIT(f.CERTIFICATO_MEDICO_SCADENZA) : undefined
            } />
            {f.CERTIFICATO_MEDICO_FILE && f.CERTIFICATO_MEDICO_FILE.length > 0 && (
              <div className="pt-2">
                {f.CERTIFICATO_MEDICO_FILE.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] text-navy-700 hover:underline"
                  >
                    <ExternalLink size={12} />
                    {att.filename}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Iscrizioni */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-ink-muted" />
              Iscrizioni ({iscrizioni.length})
            </h2>
            {iscrizioni.length === 0 ? (
              <p className="text-[13px] text-ink-muted py-4 text-center">
                Nessuna iscrizione collegata.
              </p>
            ) : (
              <div className="divide-y divide-line">
                {iscrizioni.map((isc) => {
                  const anno = isc.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
                  const stato = isc.fields.ANNULLATA
                    ? { label: "Annullata", variant: "error" as const }
                    : isc.fields.STATO_ISCRIZIONE === "SOSPESA"
                    ? { label: "Sospesa", variant: "error" as const }
                    : isc.fields.STATO_ISCRIZIONE === "COMPLETA"
                    ? { label: "Completa", variant: "success" as const }
                    : { label: "Incompleta", variant: "warning" as const };
                  return (
                    <div key={isc.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">
                          {isc.fields.CORSO ?? "Iscrizione"} {anno ? `· ${anno}` : ""}
                        </p>
                        {isc.fields.DATA_ISCRIZIONE && (
                          <p className="text-[12px] text-ink-muted mt-0.5">
                            Iscritta il {new Date(isc.fields.DATA_ISCRIZIONE).toLocaleDateString("it-IT")}
                            {isc.fields.IMPORTO_FINALE_ANNUO != null && ` · ${formatEUR(isc.fields.IMPORTO_FINALE_ANNUO)}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={stato.variant} size="sm">{stato.label}</Badge>
                        <Link
                          href={`/portale/admin/iscrizioni/${isc.id}`}
                          className="text-[12px] text-navy-700 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Dettaglio
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
