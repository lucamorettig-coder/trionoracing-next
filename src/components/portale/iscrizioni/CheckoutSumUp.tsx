"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/portale-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SumUpCard?: {
      mount: (config: {
        id: string;
        checkoutId: string;
        onResponse?: (type: string, body: any) => void;
        showFooter?: boolean;
        locale?: string;
      }) => { unmount: () => void };
    };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface Props {
  iscrizioneId: string;
  titoloId: string;
  titoloTipo: string;
  importo: number;
  bambinoNome: string;
  annoIscrizione: string;
  corso?: string;
}

export default function CheckoutSumUp({
  iscrizioneId,
  titoloId,
  titoloTipo,
  importo,
  bambinoNome,
  annoIscrizione,
  corso,
}: Props) {
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounting, setMounting] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const widgetRef = useRef<{ unmount: () => void } | null>(null);
  const verifyingRef = useRef(false);

  // Crea checkout SumUp lato server
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portale/pagamenti/sumup/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titoloId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Impossibile inizializzare il pagamento");
          setMounting(false);
          return;
        }
        setCheckoutId(data.checkoutId);
      } catch {
        if (!cancelled) {
          setError("Errore di rete durante l'inizializzazione del pagamento");
          setMounting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [titoloId]);

  const callVerify = useCallback(async () => {
    if (verifyingRef.current || !checkoutId) return;
    verifyingRef.current = true;
    setVerifying(true);
    try {
      const res = await fetch("/api/portale/pagamenti/sumup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titoloId, checkoutId }),
      });
      const data = await res.json();
      if (data.paid) {
        router.push(`/portale/iscrizioni/${iscrizioneId}?paid=true&tab=pagamenti`);
        return;
      }
      setError("Pagamento non confermato. Se hai effettivamente pagato, attendi qualche istante e ricarica.");
    } catch {
      setError("Errore durante la verifica del pagamento. Ricarica la pagina.");
    } finally {
      setVerifying(false);
      verifyingRef.current = false;
    }
  }, [checkoutId, titoloId, iscrizioneId, router]);

  // Monta il widget SumUp quando script + checkoutId pronti
  useEffect(() => {
    if (!scriptReady || !checkoutId || !window.SumUpCard) return;
    if (widgetRef.current) return;

    const widget = window.SumUpCard.mount({
      id: "sumup-card",
      checkoutId,
      locale: "it-IT",
      showFooter: false,
      onResponse: (type, body) => {
        if (type === "success" || (type === "sent" && body?.status === "PAID")) {
          callVerify();
        } else if (type === "error" || type === "fail" || type === "invalid") {
          setError(body?.detail || body?.message || "Pagamento non riuscito. Riprova.");
        }
      },
    });
    widgetRef.current = widget;
    setMounting(false);

    return () => {
      try {
        widget?.unmount();
      } catch {
        /* noop */
      }
      widgetRef.current = null;
    };
  }, [scriptReady, checkoutId, callVerify]);

  return (
    <div className="max-w-xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <Link
        href={`/portale/iscrizioni/${iscrizioneId}?tab=pagamenti`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Torna all&apos;iscrizione
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-1">Pagamento — {titoloTipo}</h1>
      <p className="text-ink-muted mb-6">Inserisci i dati della carta nel widget qui sotto.</p>

      {/* Riepilogo */}
      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Iscrizione</span>
          <span className="text-ink font-semibold text-right">
            {bambinoNome} · {annoIscrizione}{corso ? ` · ${corso}` : ""}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Tipo</span>
          <span className="text-ink font-semibold">{titoloTipo}</span>
        </div>
        <div className="pt-3 border-t border-line flex justify-between items-baseline">
          <span className="text-ink font-bold">Importo</span>
          <span className="text-2xl font-bold text-navy-700">{formatEUR(importo)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-flag-700 shrink-0" />
          <p className="text-sm text-flag-700">{error}</p>
        </div>
      )}

      {/* SumUp widget mount point */}
      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 min-h-[420px] relative">
        {(mounting || verifying) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[var(--radius-xl)] z-10">
            <div className="flex items-center gap-2 text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              {verifying ? "Verifica pagamento…" : "Caricamento widget…"}
            </div>
          </div>
        )}
        <div id="sumup-card" />
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portale/iscrizioni/${iscrizioneId}?tab=pagamenti`}>
            Annulla e torna all&apos;iscrizione
          </Link>
        </Button>
      </div>
    </div>
  );
}
