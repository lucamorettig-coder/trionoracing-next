"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Bambino } from "@/lib/airtable-portale";
import { formatEUR, quarterLabel } from "@/lib/portale-utils";
import type { TariffaInfo } from "../WizardNuovaIscrizione";

interface Props {
  bambino: Bambino;
  anno: number;
  tariffa: TariffaInfo | null;
  onTariffaLoaded: (t: TariffaInfo) => void;
}

export default function StepRiepilogoTariffa({
  bambino,
  anno,
  tariffa,
  onTariffaLoaded,
}: Props) {
  const [loading, setLoading] = useState(!tariffa);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tariffa) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/portale/iscrizioni/tariffa?bambinoId=${bambino.id}&anno=${anno}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Impossibile calcolare la tariffa");
        } else {
          onTariffaLoaded(data);
        }
      } catch {
        if (!cancelled) setError("Errore di rete");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bambino.id, anno, tariffa, onTariffaLoaded]);

  return (
    <div>
      <h2 className="text-xl font-bold text-ink mb-2">Riepilogo tariffa</h2>
      <p className="text-ink-muted text-sm mb-6">
        Verifica l&apos;importo calcolato in base al periodo dell&apos;anno.
      </p>

      {/* Card tariffa */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-ink-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Calcolo tariffa…
        </div>
      ) : error ? (
        <div className="p-4 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-flag-700 text-sm">
          {error}
        </div>
      ) : tariffa ? (
        <div className="bg-bg-soft border border-line rounded-[var(--radius-xl)] p-5">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-3">
            Tariffa applicata
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-ink-muted text-sm">Anno</span>
              <span className="text-ink font-semibold">{tariffa.anno}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-ink-muted text-sm">Periodo</span>
              <span className="text-ink font-semibold">{quarterLabel(tariffa.quarter)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-ink-muted text-sm">Quota iscrizione</span>
              <span className="text-ink">{formatEUR(tariffa.importoIscrizione)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-ink-muted text-sm">
                {tariffa.numeroRate} {tariffa.numeroRate === 1 ? "rata" : "rate"} ×{" "}
                {formatEUR(tariffa.importoRata)}
              </span>
              <span className="text-ink">{formatEUR(tariffa.importoRata * tariffa.numeroRate)}</span>
            </div>
            {tariffa.scontoFamiglia && (
              <div className="flex justify-between items-baseline text-grass-700">
                <span className="text-sm">
                  Sconto famiglia ({bambino.fields.NOME_BAMBINO} è il tuo {tariffa.ordineIscrizioneGenitore}° figlio iscritto)
                </span>
                <span className="font-semibold">− {formatEUR(tariffa.scontoImporto)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-line flex justify-between items-baseline">
              <span className="text-ink font-bold">Totale</span>
              <span className="text-2xl font-bold text-navy-700">
                {formatEUR(tariffa.importoTotale)}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-muted leading-relaxed">
            Confermando creerai l&apos;iscrizione. La prima rata sarà generata automaticamente e potrai pagarla subito.
          </p>
        </div>
      ) : null}
    </div>
  );
}
