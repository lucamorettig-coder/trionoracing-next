"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bambino, Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";
import { formatEUR, statoIscrizioneBadge, corsoLabel, corsoBadgeVariant } from "@/lib/portale-utils";
import TabStato from "./tabs/TabStato";
import TabModulistica from "./tabs/TabModulistica";
import TabTaglie from "./tabs/TabTaglie";
import TabPagamenti from "./tabs/TabPagamenti";

interface Props {
  iscrizione: Iscrizione;
  bambino: Bambino;
  titoli: TitoloPagamento[];
  banner: "just-created" | "paid" | null;
  initialTab?: string;
}

type TabKey = "stato" | "modulistica" | "taglie" | "pagamenti";
const TABS: { key: TabKey; label: string }[] = [
  { key: "stato", label: "Stato" },
  { key: "modulistica", label: "Modulistica" },
  { key: "taglie", label: "Taglie kit" },
  { key: "pagamenti", label: "Pagamenti" },
];

export default function DettaglioIscrizione({
  iscrizione,
  bambino,
  titoli: initialTitoli,
  banner,
  initialTab,
}: Props) {
  const validTab = TABS.find((t) => t.key === initialTab)?.key ?? "stato";
  const [tab, setTab] = useState<TabKey>(validTab);

  const fields = iscrizione.fields;
  const anno = fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "—";
  const quarter = fields["NOME_TARIFFA (from TABELLA_TARIFFE)"]?.[0];
  const importo = fields.IMPORTO_FINALE_ANNUO;
  const badge = statoIscrizioneBadge(fields.STATO_ISCRIZIONE);
  const fotoUrl = bambino.fields.FOTO_BAMBINO?.[0]?.thumbnails?.small?.url;
  const nome = bambino.fields.NOME_BAMBINO;
  const cognome = bambino.fields.COGNOME_BAMBINO;

  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-6 lg:py-10">
      <Link
        href="/portale/iscrizioni"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Iscrizioni
      </Link>

      {/* Banner */}
      {banner === "just-created" && (
        <div className="mb-6 p-4 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-grass-700">Iscrizione creata!</p>
            <p className="text-sm text-grass-700/80">
              Completa privacy, regolamento e taglie. Poi paga la prima rata.
            </p>
          </div>
        </div>
      )}
      {banner === "paid" && (
        <div className="mb-6 p-4 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-grass-700">Pagamento ricevuto.</p>
        </div>
      )}

      {/* Header sticky */}
      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 lg:p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {fotoUrl ? (
            <Image
              src={fotoUrl}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover bg-navy-50 shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 font-bold text-xl shrink-0">
              {nome.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-ink truncate">
              {nome} {cognome}
            </h1>
            <p className="text-sm text-ink-muted mt-0.5">
              Iscrizione {anno}
              {quarter && <> · {quarter}</>}
            </p>
            {fields.CORSO && (
              <div className="mt-2">
                <Badge variant={corsoBadgeVariant(fields.CORSO)} size="sm">
                  {corsoLabel(fields.CORSO).label}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <Badge variant={badge.variant} size="md">{badge.label}</Badge>
            {typeof importo === "number" && (
              <p className="text-lg font-bold text-ink mt-2">Totale {formatEUR(importo)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? "border-navy-700 text-navy-700"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "stato" && <TabStato iscrizione={iscrizione} titoli={initialTitoli} onJump={setTab} />}
        {tab === "modulistica" && <TabModulistica iscrizione={iscrizione} />}
        {tab === "taglie" && <TabTaglie iscrizione={iscrizione} />}
        {tab === "pagamenti" && <TabPagamenti iscrizione={iscrizione} titoli={initialTitoli} />}
      </div>
    </div>
  );
}
