"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Mail, MailCheck, Lock, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Regole password (live) — stesse della registrazione
   ───────────────────────────────────────────────────────────── */
function passwordRules(pwd: string) {
  return [
    { label: "Almeno 8 caratteri", ok: pwd.length >= 8 },
    { label: "Una maiuscola", ok: /[A-Z]/.test(pwd) },
    { label: "Un numero", ok: /[0-9]/.test(pwd) },
    { label: "Un carattere speciale", ok: /[^A-Za-z0-9]/.test(pwd) },
  ];
}

/* ─────────────────────────────────────────────────────────────
   CodeInput — 6 celle con auto-advance, backspace e paste
   ───────────────────────────────────────────────────────────── */
function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const LENGTH = 6;
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = (value.slice(0, i) + digit + value.slice(i + 1)).slice(0, LENGTH);
    onChange(next);
    if (digit && i < LENGTH - 1) refs.current[i + 1]?.focus();
    if (next.length === LENGTH) onComplete?.(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, LENGTH - 1)]?.focus();
    if (digits.length === LENGTH) onComplete?.(digits);
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Cifra ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-14 flex-1 rounded-[12px] border-[1.5px] text-center font-mono text-[22px] font-bold text-ink outline-none transition-colors",
            "focus:border-navy-700",
            value[i] ? "border-navy-700 bg-navy-50 text-navy-900" : "border-line bg-white",
            invalid && "border-flag-500",
            disabled && "opacity-60",
          )}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   StepCard — card step con label pill (completed / active / upcoming)
   ───────────────────────────────────────────────────────────── */
type StepVariant = "completed" | "active" | "upcoming";

function StepCard({
  variant,
  label,
  title,
  children,
}: {
  variant: StepVariant;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[580px] rounded-[var(--radius-xl)] border bg-white p-6 shadow-sm lg:p-8",
        variant === "active" && "border-[2px] border-navy-700",
        variant === "completed" && "border-grass-100 bg-grass-50",
        variant === "upcoming" && "border-line",
      )}
    >
      <span
        className={cn(
          "absolute -top-3 left-[18px] inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]",
          variant === "active" && "bg-navy-700 text-white",
          variant === "completed" && "bg-grass-500 text-white",
          variant === "upcoming" && "border border-line bg-bg-muted text-ink-muted",
        )}
      >
        {variant === "completed" && <Check size={11} aria-hidden />}
        {label}
      </span>
      <h2
        className={cn(
          "mt-3 mb-2 text-[22px] font-bold leading-[1.2] tracking-[-0.015em] lg:text-[26px]",
          variant === "upcoming" ? "text-ink-muted" : "text-ink",
        )}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Pagina recupero password — flusso Clerk "Future API" (reset_password_email_code)
   create(identifier) → sendCode() → verifyCode(code) → submitPassword(password) → finalize()
   ───────────────────────────────────────────────────────────── */
export default function RecuperoPasswordPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [done, setDone] = useState(false);

  // Countdown reinvio codice
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Step 1: crea l'attempt con l'email e invia il codice
  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await signIn.create({ identifier: email });
      if (created.error) {
        setError(created.error.longMessage ?? created.error.message);
        return;
      }
      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (sent.error) {
        setError(sent.error.longMessage ?? sent.error.message);
        return;
      }
      setStep(2);
      setCode("");
      setResendIn(60);
    } catch {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  // Reinvio codice (step 2): l'attempt esiste già, basta richiedere il codice
  async function resendCode() {
    if (submitting || resendIn > 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (sent.error) {
        setError(sent.error.longMessage ?? sent.error.message);
        return;
      }
      setCode("");
      setResendIn(60);
    } catch {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: verifica il codice
  async function verifyCode(theCode: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signIn.resetPasswordEmailCode.verifyCode({ code: theCode });
      if (res.error) {
        setError(res.error.longMessage ?? res.error.message);
        return;
      }
      setStep(3);
    } catch {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 3: imposta la nuova password e finalizza la sessione
  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (passwordRules(password).some((r) => !r.ok)) {
      setError("La password non rispetta tutti i requisiti.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (res.error) {
        setError(res.error.longMessage ?? res.error.message);
        return;
      }
      const finalized = await signIn.finalize();
      if (finalized.error) {
        setError(finalized.error.longMessage ?? finalized.error.message);
        return;
      }
      setDone(true);
      router.push("/portale");
    } catch {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  const rules = passwordRules(password);

  return (
    <main className="flex min-h-screen flex-col bg-bg-soft">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5 lg:px-10 lg:py-4">
        <Link
          href="/portale/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-navy-700"
        >
          <ArrowLeft size={16} aria-hidden />
          Torna al login
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-navy-700 text-[14px] font-extrabold text-white">
            T
          </div>
          <span className="text-[14px] font-bold text-ink">Triono Racing</span>
        </div>
      </div>

      {/* Wrap step */}
      <div className="flex flex-1 flex-col gap-5 px-4 py-6 lg:gap-6 lg:py-12">
        {/* STEP 1 — richiedi recupero */}
        {step === 1 ? (
          <StepCard variant="active" label="Step 1 · in corso" title="Recupera l'accesso">
            <p className="mb-[18px] text-[14px] leading-[1.55] text-ink-muted">
              Inserisci l&apos;email del tuo account: ti invieremo un codice a 6 cifre per impostare
              una nuova password.
            </p>
            <form onSubmit={sendCode}>
              <label htmlFor="recover-email" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  aria-hidden
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="recover-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="luca.rossi@email.it"
                  className="h-12 w-full rounded-[12px] border-[1.5px] border-line bg-white pl-11 pr-3.5 text-[15px] text-ink outline-none transition-colors focus:border-navy-700"
                />
              </div>
              {error ? <p className="mt-2 text-[12.5px] text-flag-500">{error}</p> : null}
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                disabled={email.length === 0}
                className="mt-4 w-full"
              >
                Invia il codice
                <ArrowRight size={18} aria-hidden />
              </Button>
            </form>
          </StepCard>
        ) : (
          <StepCard variant="completed" label="Step 1 · completato" title="Recupera l'accesso">
            <p className="text-[14px] leading-[1.55] text-ink-muted">
              Hai inserito <strong className="text-ink">{email}</strong>. Abbiamo inviato un codice a
              6 cifre alla tua casella.
            </p>
          </StepCard>
        )}

        {/* STEP 2 — inserisci codice */}
        {step < 2 ? (
          <StepCard variant="upcoming" label="Step 2 · in arrivo" title="Inserisci il codice ricevuto">
            <p className="text-[14px] leading-[1.55] text-ink-muted">
              Dopo aver richiesto il recupero, riceverai un codice a 6 cifre da inserire qui.
            </p>
          </StepCard>
        ) : step === 2 ? (
          <StepCard variant="active" label="Step 2 · in corso" title="Inserisci il codice ricevuto">
            <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-grass-100 bg-white p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grass-500 text-white">
                <MailCheck size={18} aria-hidden />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-ink">Email inviata a {email}</div>
                <div className="mt-0.5 text-[12.5px] leading-[1.4] text-ink-muted">
                  Controlla la casella (anche spam/promozioni). Il codice scade tra 15 minuti.
                </div>
              </div>
            </div>

            <label className="mb-1.5 block text-[13px] font-semibold text-ink">
              Codice di verifica
            </label>
            <CodeInput
              value={code}
              onChange={(v) => {
                setCode(v);
                if (error) setError(null);
              }}
              onComplete={(v) => verifyCode(v)}
              disabled={submitting}
              invalid={!!error}
            />
            {error ? (
              <p className="mt-2 text-[12.5px] text-flag-500">{error}</p>
            ) : (
              <p className="mt-2 text-[12.5px] text-ink-muted">
                Il codice si verifica automaticamente al sesto carattere.
              </p>
            )}

            <Button
              type="button"
              size="lg"
              loading={submitting}
              disabled={code.length < 6}
              className="mt-4 w-full"
              onClick={() => verifyCode(code)}
            >
              Verifica codice
              <ArrowRight size={18} aria-hidden />
            </Button>

            <p className="mt-3.5 text-center text-[12.5px] text-ink-muted">
              Non hai ricevuto l&apos;email?{" "}
              {resendIn > 0 ? (
                <>
                  Reinvia tra{" "}
                  <span className="font-mono text-ink">00:{String(resendIn).padStart(2, "0")}</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={submitting}
                  className="font-semibold text-sky-600 hover:text-navy-700 disabled:opacity-50"
                >
                  Reinvia codice
                </button>
              )}
            </p>
          </StepCard>
        ) : (
          <StepCard variant="completed" label="Step 2 · completato" title="Codice verificato">
            <p className="text-[14px] leading-[1.55] text-ink-muted">
              Il codice è corretto. Scegli ora una nuova password.
            </p>
          </StepCard>
        )}

        {/* STEP 3 — nuova password */}
        <StepCard
          variant={step === 3 ? "active" : "upcoming"}
          label={step === 3 ? "Step 3 · in corso" : "Step 3 · in arrivo"}
          title="Scegli una nuova password"
        >
          {step === 3 ? (
            <form onSubmit={submitNewPassword}>
              <label htmlFor="recover-pwd" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Nuova password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  aria-hidden
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  id="recover-pwd"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Scegli una password"
                  className="h-12 w-full rounded-[12px] border-[1.5px] border-line bg-white pl-11 pr-3.5 text-[15px] text-ink outline-none transition-colors focus:border-navy-700"
                />
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11.5px]">
                {rules.map((r) => (
                  <div
                    key={r.label}
                    className={cn(
                      "flex items-center gap-1.5",
                      r.ok ? "text-grass-700" : "text-ink-muted",
                    )}
                  >
                    {r.ok ? <Check size={11} aria-hidden /> : <Circle size={11} aria-hidden />}
                    {r.label}
                  </div>
                ))}
              </div>

              {error ? <p className="mt-2 text-[12.5px] text-flag-500">{error}</p> : null}

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                disabled={done || rules.some((r) => !r.ok)}
                className="mt-4 w-full"
              >
                Aggiorna password e accedi
                <ArrowRight size={18} aria-hidden />
              </Button>
            </form>
          ) : (
            <p className="text-[14px] leading-[1.55] text-ink-muted">
              Dopo aver verificato il codice sceglierai una nuova password (min. 8 caratteri, 1
              maiuscola, 1 numero, 1 carattere speciale).
            </p>
          )}
        </StepCard>

        {/* Aiuto in fondo */}
        <div className="mx-auto w-full max-w-[580px] px-2 text-center text-[13px] text-ink-muted">
          Continui a non ricevere l&apos;email?{" "}
          <a
            href="mailto:info@trionoracing.it?subject=Recupero%20accesso%20portale"
            className="font-semibold text-sky-600 hover:text-navy-700"
          >
            Contatta la segreteria
          </a>{" "}
          e ti aiuteremo a sbloccare il tuo account.
        </div>
      </div>
    </main>
  );
}
