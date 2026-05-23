"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Shirt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bambino, Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";
import { formatEUR, quarterLabel, statoTitoloBadge } from "@/lib/portale-utils";
import StepHeader from "../StepHeader";
import type { TariffaInfo } from "../WizardNuovaIscrizione";

interface Props {
  step: number;
  total: number;
  bambino: Bambino;
  iscrizione: Iscrizione;
  tariffa: TariffaInfo;
  titoli: TitoloPagamento[];
}

const MESI_LABEL: Record<string, string> = {
  GENNAIO: "gennaio",
  FEBBRAIO: "febbraio",
  MARZO: "marzo",
  APRILE: "aprile",
  MAGGIO: "maggio",
  GIUGNO: "giugno",
  LUGLIO: "luglio",
  AGOSTO: "agosto",
  SETTEMBRE: "settembre",
  OTTOBRE: "ottobre",
  NOVEMBRE: "novembre",
  DICEMBRE: "dicembre",
};

export default function StepSommario({
  step,
  total,
  bambino,
  iscrizione,
  tariffa,
  titoli,
}: Props) {
  const f = iscrizione.fields;
  const primaRata = titoli.find((t) => t.fields.NUMERO_RATA === 1) ?? titoli[0];
  const kit = tariffa.importoKit ?? 0;
  const quotaTotale = tariffa.quotaTotaleAnno;
  const iscrizioneFee = tariffa.importoIscrizione;
  const sconto = tariffa.scontoFamiglia ? tariffa.scontoImporto : 0;
  const totaleAnno = quotaTotale + iscrizioneFee + kit - sconto;

  const privacyOk = !!f.PRIVACY_MINORE;
  const regolamentoOk = !!f.FLAG_REGOLAMENTO && !!f.REGOLAMENTO_FIRMATO?.length;

  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="Sommario iscrizione"
        description="Controlla il riepilogo dell'iscrizione, il piano rate e l'importo totale. Da qui puoi procedere al pagamento della prima rata."
        accent="sun"
      />

      <div className="space-y-5">
        {/* Anagrafica + stato modulistica */}
        <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 space-y-3">
          <Row label="Figlio" value={`${bambino.fields.NOME_BAMBINO} ${bambino.fields.COGNOME_BAMBINO}`} />
          <Row label="Anno" value={`${tariffa.anno}`} />
          <Row label="Periodo" value={quarterLabel(tariffa.quarter)} />
          <div className="pt-3 border-t border-line space-y-2">
            <ChecklistRow label="Privacy minore firmata" done={privacyOk} />
            <ChecklistRow label="Regolamento firmato caricato" done={regolamentoOk} />
          </div>
        </section>

        {/* Voci di costo */}
        <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-3">
            Dettaglio costi
          </p>
          <div className="space-y-3">
            <Row label="Quota iscrizione" value={formatEUR(iscrizioneFee)} />
            <Row
              label={`${tariffa.numeroRate} ${tariffa.numeroRate === 1 ? "rata" : "rate"} × ${formatEUR(tariffa.importoRata)}`}
              value={formatEUR(quotaTotale)}
            />
            {kit > 0 && (
              <Row
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-ink-muted" aria-hidden />
                    Kit scuola<span className="text-sun-700 font-bold">*</span>
                  </span>
                }
                value={formatEUR(kit)}
              />
            )}
            {sconto > 0 && (
              <div className="flex justify-between items-baseline text-grass-700">
                <span className="text-sm">Sconto famiglia ({tariffa.ordineIscrizioneGenitore}° figlio iscritto)</span>
                <span className="font-semibold">− {formatEUR(sconto)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Totale (banda navy) */}
        <section className="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-md)]">
          <div className="relative overflow-hidden bg-navy-900 pattern-navy text-white px-5 py-5">
            <div className="flex justify-between items-baseline gap-3">
              <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                Totale anno {tariffa.anno}
              </span>
              <span className="text-3xl font-bold text-sun-500">{formatEUR(totaleAnno)}</span>
            </div>
            {kit > 0 && (
              <p className="mt-3 text-xs text-white/70 leading-relaxed">
                <span className="text-sun-500 font-bold">*</span> Il kit scuola è obbligatorio ma potrebbe non essere subito disponibile alla consegna.
              </p>
            )}
          </div>
        </section>

        {/* Piano rate */}
        <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-5 py-3 border-b border-line bg-bg-soft">
            <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold">
              Piano rate
            </p>
          </div>
          {titoli.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">Nessun titolo generato.</p>
          ) : (
            <ul className="divide-y divide-line">
              {titoli.map((t) => {
                const tipo = t.fields.NUMERO_RATA === 1 ? "Prima rata" : `Rata ${t.fields.NUMERO_RATA ?? ""}`;
                const meseLabel = t.fields.SCADENZA_MESE
                  ? MESI_LABEL[t.fields.SCADENZA_MESE.toUpperCase()] ?? t.fields.SCADENZA_MESE.toLowerCase()
                  : "—";
                const stato = statoTitoloBadge(t.fields.STATO_TITOLO);
                const importo = t.fields.IMPORTO ?? 0;
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{tipo.trim()}</p>
                      <p className="text-xs text-ink-muted capitalize mt-0.5">
                        scadenza {meseLabel}
                      </p>
                    </div>
                    <Badge variant={stato.variant} size="sm">{stato.label}</Badge>
                    <span className="text-sm font-semibold text-ink">{formatEUR(importo)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* CTA pagamento */}
        {primaRata && primaRata.fields.STATO_TITOLO !== "pagato" && (
          <div className="flex justify-end">
            <Button asChild variant="primary" size="lg">
              <Link href={`/portale/iscrizioni/${iscrizione.id}/checkout?titolo=${primaRata.id}`}>
                Vai al pagamento prima rata
              </Link>
            </Button>
          </div>
        )}
        {primaRata?.fields.STATO_TITOLO === "pagato" && (
          <div className="p-4 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
            <p className="text-sm text-grass-700 font-semibold">
              Prima rata pagata. L&apos;iscrizione è in regola.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className="text-ink-muted text-sm">{label}</span>
      <span className="text-ink font-semibold text-right">{value}</span>
    </div>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-grass-700 shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-ink-muted shrink-0" />
      )}
      <span className={done ? "text-ink" : "text-ink-muted"}>{label}</span>
    </div>
  );
}
