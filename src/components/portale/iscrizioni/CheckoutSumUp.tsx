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
}

// Estrae dal body onResponse solo i campi diagnostici (mai dati carta completi)
function extractDetail(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  const card = (b.card ?? undefined) as Record<string, unknown> | undefined;
  const parts: string[] = [];
  if (b.status) parts.push(`status=${b.status}`);
  if (b.error_code) parts.push(`code=${b.error_code}`);
  if (typeof b.message === "string") parts.push(`msg=${b.message}`);
  if (card?.last_4_digits) parts.push(`card=*${card.last_4_digits}`);
  return parts.length ? parts.join(" · ").slice(0, 300) : undefined;
}

export default function CheckoutSumUp({
  iscrizioneId,
  titoloId,
  titoloTipo,
  importo,
  bambinoNome,
  annoIscrizione,
}: Props) {
  const router = useRouter();
  // Se lo script SumUp è già stato caricato in una visita precedente
  // (back/forward, BFCache, ecc.) Next.js Script NON ri-triggera onLoad
  // → leggo window.SumUpCard come initial state per evitare blocchi.
  const [scriptReady, setScriptReady] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!window.SumUpCard;
  });
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounting, setMounting] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const widgetRef = useRef<{ unmount: () => void } | null>(null);
  const verifyingRef = useRef(false);
  // Esito raggiunto dal widget (success/error): gating per PAGE_ABANDONED
  const outcomeRef = useRef<string | null>(null);

  // Telemetria diagnostica fire-and-forget: non deve mai interferire col pagamento
  const logEvent = useCallback(
    (event: string, detail?: string, ckId?: string | null) => {
      try {
        void fetch("/api/portale/pagamenti/sumup/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titoloId,
            checkoutId: ckId ?? undefined,
            event,
            detail,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* noop */
      }
    },
    [titoloId],
  );

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

  // Timeout di sicurezza: se dopo 8s il widget non si è montato, suggerisci ricarica.
  useEffect(() => {
    if (!mounting) return;
    const t = setTimeout(() => {
      setSlowLoading(true);
      logEvent("WIDGET_MOUNT_TIMEOUT", undefined, checkoutId);
    }, 8000);
    return () => clearTimeout(t);
  }, [mounting, checkoutId, logEvent]);

  // Se l'utente chiude/abbandona la pagina con un pagamento aperto senza esito → beacon
  useEffect(() => {
    if (!checkoutId) return;
    const onPageHide = () => {
      if (outcomeRef.current) return;
      try {
        navigator.sendBeacon(
          "/api/portale/pagamenti/sumup/log",
          new Blob(
            [JSON.stringify({ titoloId, checkoutId, event: "PAGE_ABANDONED" })],
            { type: "application/json" },
          ),
        );
      } catch {
        /* noop */
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [checkoutId, titoloId]);

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

    let widget: { unmount: () => void } | null = null;
    try {
      widget = window.SumUpCard.mount({
        id: "sumup-card",
        checkoutId,
        locale: "it-IT",
        showFooter: false,
        onResponse: (type, body) => {
          // Telemetria: ogni evento del widget (sent, auth-screen, success, error, fail, invalid…)
          const evt = `WIDGET_${String(type).toUpperCase().replace(/[^A-Z0-9]/g, "_")}`.slice(0, 40);
          logEvent(evt, extractDetail(body), checkoutId);
          if (type === "success" || (type === "sent" && body?.status === "PAID")) {
            outcomeRef.current = "success";
            callVerify();
          } else if (type === "error" || type === "fail" || type === "invalid") {
            // Checkout già pagato in precedenza (METADATA non aggiornato) → verifica
            if (
              body?.error_code === "CONFLICT" ||
              (typeof body?.message === "string" && body.message.includes("already been processed"))
            ) {
              outcomeRef.current = "success";
              callVerify();
              return;
            }
            // invalid = errore di compilazione correggibile, non è un esito terminale
            if (type !== "invalid") outcomeRef.current = "error";
            const raw = body?.detail || body?.message;
            const isMeaningful = raw && typeof raw === "string" && !raw.includes("undefined");
            setError(isMeaningful ? raw : "Pagamento non riuscito. Riprova.");
          }
        },
      });
      widgetRef.current = widget;
      logEvent("WIDGET_MOUNTED", undefined, checkoutId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounting(false);
    } catch (err) {
      console.error("[SumUp widget] mount error:", err);
      logEvent("WIDGET_MOUNT_ERROR", err instanceof Error ? err.message : undefined, checkoutId);
      setError(
        "Impossibile caricare il widget di pagamento. Ricarica la pagina e riprova.",
      );
      setMounting(false);
      return;
    }

    return () => {
      // Navigazione SPA (Annulla/Torna indietro): pagehide non scatta,
      // l'abbandono va intercettato qui allo smontaggio del widget.
      if (!outcomeRef.current) {
        logEvent("WIDGET_UNMOUNTED", undefined, checkoutId);
      }
      try {
        widget?.unmount();
      } catch {
        /* noop */
      }
      widgetRef.current = null;
    };
  }, [scriptReady, checkoutId, callVerify, logEvent]);

  return (
    <div className="max-w-xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          logEvent("SCRIPT_LOAD_ERROR");
          setError(
            "Impossibile caricare il modulo di pagamento. Controlla la connessione o eventuali blocchi del browser e ricarica.",
          );
          setMounting(false);
        }}
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
            {bambinoNome} · {annoIscrizione}
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
        <div className="mb-4 p-4 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-flag-700 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-flag-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Ricarica e riprova
            </Button>
          </div>
        </div>
      )}

      {/* SumUp widget mount point */}
      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 min-h-[420px] relative">
        {(mounting || verifying) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 rounded-[var(--radius-xl)] z-10 px-6 text-center">
            <div className="flex items-center gap-2 text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              {verifying ? "Verifica pagamento…" : "Caricamento widget…"}
            </div>
            {slowLoading && !verifying && (
              <>
                <p className="text-xs text-ink-muted max-w-sm">
                  Il widget ci sta mettendo più del previsto. Può succedere se sei tornato indietro durante un pagamento in corso.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Ricarica e riprova
                </Button>
              </>
            )}
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
