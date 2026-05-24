"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Bambino, Iscrizione } from "@/lib/airtable-portale";
import { formatEUR, statoIscrizioneBadge } from "@/lib/portale-utils";

interface Props {
  iscrizioni: Iscrizione[];
  bambini: Bambino[];
  annoFilter: string;
  figlioFilter: string;
}

export default function IscrizioniLista({ iscrizioni, bambini, annoFilter, figlioFilter }: Props) {
  const [anno, setAnno] = useState(annoFilter);
  const [figlio, setFiglio] = useState(figlioFilter);
  const annoCorrente = new Date().getFullYear();

  const filtered = useMemo(() => {
    return iscrizioni.filter((isc) => {
      if (anno === "anno-corrente") {
        const a = isc.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
        if (a !== `${annoCorrente}`) return false;
      }
      if (figlio !== "tutti") {
        if (!isc.fields.TABELLA_BAMBINI?.includes(figlio)) return false;
      }
      return true;
    });
  }, [iscrizioni, anno, figlio, annoCorrente]);

  return (
    <>
      {/* Filtri */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex items-center bg-white border border-line rounded-[var(--radius-md)] p-1 text-sm">
          <button
            type="button"
            onClick={() => setAnno("anno-corrente")}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-semibold transition-colors ${
              anno === "anno-corrente" ? "bg-navy-700 text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            Anno {annoCorrente}
          </button>
          <button
            type="button"
            onClick={() => setAnno("tutti")}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-semibold transition-colors ${
              anno === "tutti" ? "bg-navy-700 text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            Tutti
          </button>
        </div>

        {bambini.length > 1 && (
          <select
            value={figlio}
            onChange={(e) => setFiglio(e.target.value)}
            className="h-9 px-3 text-sm bg-white border border-line rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            <option value="tutti">Tutti i figli</option>
            {bambini.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fields.NOME_BAMBINO} {b.fields.COGNOME_BAMBINO}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-line rounded-[var(--radius-xl)]">
          <p className="text-ink-muted">Nessuna iscrizione corrisponde ai filtri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((isc) => {
            const bambinoId = isc.fields.TABELLA_BAMBINI?.[0];
            const bambino = bambini.find((b) => b.id === bambinoId);
            const fotoUrl = isc.fields["FOTO_BAMBINO (from TABELLA_BAMBINI)"]?.[0]?.thumbnails?.small?.url
              ?? bambino?.fields.FOTO_BAMBINO?.[0]?.thumbnails?.small?.url;
            const nome = isc.fields["NOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? bambino?.fields.NOME_BAMBINO ?? "—";
            const cognome = isc.fields["COGNOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? bambino?.fields.COGNOME_BAMBINO ?? "";
            const annoIsc = isc.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "—";
            const quarter = isc.fields["NOME_TARIFFA (from TABELLA_TARIFFE)"]?.[0];
            const importo = isc.fields.IMPORTO_FINALE_ANNUO;
            const badge = statoIscrizioneBadge(isc.fields.STATO_ISCRIZIONE);
            const isDraft = isc.fields.STATO_ISCRIZIONE === "INCOMPLETA";
            const targetHref = isDraft
              ? `/portale/iscrizioni/nuova?iscrizione=${isc.id}`
              : `/portale/iscrizioni/${isc.id}`;
            const ctaLabel = isDraft ? "Riprendi iscrizione →" : "Vedi dettaglio →";

            return (
              <Link
                key={isc.id}
                href={targetHref}
                className={`group bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 hover:shadow-[var(--shadow-md)] hover:border-navy-200 transition-all overflow-hidden relative ${
                  isDraft ? "border-l-4 border-l-ember-500" : "border-l-4 border-l-grass-500"
                }`}
              >
                <div className="flex items-start gap-4">
                  {fotoUrl ? (
                    <Image
                      src={fotoUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover bg-navy-50 shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 font-bold shrink-0">
                      {nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">
                      {nome} {cognome}
                    </p>
                    <p className="text-sm text-ink-muted mt-0.5">
                      Iscrizione {annoIsc}
                      {quarter && <> · {quarter}</>}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      {typeof importo === "number" && (
                        <span className="text-sm font-semibold text-ink">{formatEUR(importo)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line flex justify-end">
                  {isDraft ? (
                    <span className="pointer-events-none inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-ember-50 text-ember-700 border border-ember-200">
                      {ctaLabel}
                    </span>
                  ) : (
                    <span className="pointer-events-none text-sm font-semibold text-navy-700 underline underline-offset-2 group-hover:text-navy-900">
                      {ctaLabel}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
