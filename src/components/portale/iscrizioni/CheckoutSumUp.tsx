"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Loader2, Tag, TicketPercent, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/portale-utils";
import { validaCodiceScontoAction } from "@/app/portale/(portal)/iscrizioni/[id]/checkout/actions";

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

interface AppliedSconto {
  codice: string;
  sconto: number;
  nuovoImporto: number;
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
  const codiceFieldId = useId();

  // ─── Codice sconto (EVO-028) ──────────────────────────────────────────────
  const [codiceInput, setCodiceInput] = useState("");
  const [applied, setApplied] = useState<AppliedSconto | null>(null);
  const [codiceError, setCodiceError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  // Il checkout SumUp si crea SOLO dopo "Procedi al pagamento", così il codice
  // può essere applicato prima che l'importo venga fissato lato SumUp.
  const [started, setStarted] = useState(false);

  // ─── Stato widget SumUp ───────────────────────────────────────────────────
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

  const importoFinale = applied ? applied.nuovoImporto : importo;

  async function handleApplica() {
    const value = codiceInput.trim();
    if (!value || applying) return;
    setApplying(true);
    setCodiceError(null);
    try {
      const res = await validaCodiceScontoAction(titoloId, value);
      if (res.ok) {
        setApplied({ codice: res.codice, sconto: res.sconto, nuovoImporto: res.nuovoImporto });
        setCodiceError(null);
      } else {
        setApplied(null);
        setCodiceError(res.messaggio);
      }
    } catch {
      setCodiceError("Impossibile verificare il codice. Riprova.");
    } finally {
      setApplying(false);
    }
  }

  function handleRimuovi() {
    setApplied(null);
    setCodiceInput("");
    setCodiceError(null);
  }

  // Crea checkout SumUp lato server — solo dopo "Procedi al pagamento".
  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portale/pagamenti/sumup/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titoloId, codiceSconto: applied?.codice }),
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
  }, [titoloId, started, applied]);

  // Timeout di sicurezza: se dopo 8s il widget non si è montato, suggerisci ricarica.
  useEffect(() => {
    if (!started || !mounting) return;
    const t = setTimeout(() => setSlowLoading(true), 8000);
    return () => clearTimeout(t);
  }, [started, mounting]);

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
          if (type === "success" || (type === "sent" && body?.status === "PAID")) {
            callVerify();
          } else if (type === "error" || type === "fail" || type === "invalid") {
            // Checkout già pagato in precedenza (METADATA non aggiornato) → verifica
            if (
              body?.error_code === "CONFLICT" ||
              (typeof body?.message === "string" && body.message.includes("already been processed"))
            ) {
              callVerify();
              return;
            }
            const raw = body?.detail || body?.message;
            const isMeaningful = raw && typeof raw === "string" && !raw.includes("undefined");
            setError(isMeaningful ? raw : "Pagamento non riuscito. Riprova.");
          }
        },
      });
      widgetRef.current = widget;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounting(false);
    } catch (err) {
      console.error("[SumUp widget] mount error:", err);

      setError(
        "Impossibile caricare il widget di pagamento. Ricarica la pagina e riprova.",
      );

      setMounting(false);
      return;
    }

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
      <p className="text-ink-muted mb-6">
        {started
          ? "Inserisci i dati della carta nel widget qui sotto."
          : "Controlla il riepilogo, applica un eventuale codice sconto e procedi."}
      </p>

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

        {applied ? (
          <>
            <div className="pt-3 border-t border-line flex justify-between items-baseline">
              <span className="text-sm text-ink-muted">Importo pieno</span>
              <span className="text-sm text-ink-muted line-through">{formatEUR(importo)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="inline-flex items-center gap-1.5 text-sm text-grass-700">
                <TicketPercent className="w-4 h-4" /> Sconto · {applied.codice}
              </span>
              <span className="text-sm font-semibold text-grass-700">
                −{formatEUR(applied.sconto)}
              </span>
            </div>
            <div className="pt-3 border-t border-line flex justify-between items-baseline">
              <span className="text-ink font-bold">Totale da pagare</span>
              <span className="text-2xl font-bold text-navy-700">
                {formatEUR(applied.nuovoImporto)}
              </span>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 bg-grass-50 text-grass-700 border border-grass-100 rounded-[var(--radius-lg)] px-2.5 py-1 text-sm font-semibold">
                <Check className="w-4 h-4" /> Risparmi {formatEUR(applied.sconto)}
              </span>
            </div>
          </>
        ) : (
          <div className="pt-3 border-t border-line flex justify-between items-baseline">
            <span className="text-ink font-bold">Importo</span>
            <span className="text-2xl font-bold text-navy-700">{formatEUR(importo)}</span>
          </div>
        )}
      </div>

      {/* Codice sconto — solo prima di procedere al pagamento */}
      {!started && (
        <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 mb-6">
          <label
            htmlFor={codiceFieldId}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-2"
          >
            <Tag className="w-4 h-4 text-ink-muted" /> Hai un codice sconto?
          </label>
          <div className="flex gap-2">
            <input
              id={codiceFieldId}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={codiceInput}
              onChange={(e) => setCodiceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplica();
                }
              }}
              placeholder="Inserisci il codice"
              disabled={!!applied || applying}
              className="flex-1 min-w-0 h-11 px-3 rounded-[var(--radius-lg)] border border-line bg-white text-ink placeholder:text-ink-muted uppercase focus:outline-none focus:ring-2 focus:ring-navy-700/15 focus:border-navy-700 disabled:opacity-60"
            />
            {applied ? (
              <Button type="button" variant="outline" onClick={handleRimuovi} className="shrink-0">
                <X className="w-4 h-4" /> Rimuovi
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleApplica}
                disabled={applying || !codiceInput.trim()}
                className="shrink-0"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Applica
              </Button>
            )}
          </div>
          <div aria-live="polite" className="mt-2 empty:mt-0">
            {codiceError && (
              <p className="flex items-start gap-2 text-sm text-flag-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {codiceError}
              </p>
            )}
            {applied && !codiceError && (
              <p className="flex items-center gap-1.5 text-sm text-grass-700">
                <Check className="w-4 h-4" /> Codice {applied.codice} applicato.
              </p>
            )}
          </div>
        </div>
      )}

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

      {/* CTA Procedi — solo prima di avviare il pagamento */}
      {!started && !error && (
        <Button
          type="button"
          variant="primary"
          onClick={() => setStarted(true)}
          className="w-full"
        >
          Procedi al pagamento · {formatEUR(importoFinale)}
        </Button>
      )}

      {/* Widget SumUp mount point — dopo "Procedi al pagamento" */}
      {started && (
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
      )}

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
