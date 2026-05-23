import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  currentStep: number;
}

/**
 * Stepper navy con pattern di brand + glow conico sull'attivo.
 * Step done = sun-500 con check. Step attivo = bianco con alone iridescente.
 */
export default function StepperWizard({ steps, currentStep }: Props) {
  const label = steps[currentStep - 1] ?? "";

  return (
    <section
      className="relative rounded-[var(--radius-xl)] overflow-hidden bg-navy-900 pattern-navy px-6 sm:px-7 pt-10 sm:pt-12 pb-8 sm:pb-9 shadow-[var(--shadow-md)] max-w-[980px] mx-auto"
      aria-label="Wizard iscrizione"
    >
      {/* Chip "Step X di N · Label" */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.18] font-mono text-[11px] tracking-[0.08em] uppercase font-semibold text-white/75">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-sun-500"
            style={{ boxShadow: "0 0 8px var(--color-sun-500)" }}
          />
          Step {currentStep} di {steps.length} · {label}
        </div>
      </div>

      {/* Stepper row */}
      <div>
        <ol className="flex items-start justify-between gap-0">
          {steps.map((stepLabel, i) => {
            const idx = i + 1;
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            const isFirst = i === 0;
            const isLast = i === steps.length - 1;
            const leftLineDone = idx <= currentStep && !isFirst;
            const rightLineDone = idx < currentStep && !isLast;

            return (
              <li
                key={stepLabel}
                className="flex-1 min-w-0 flex flex-col items-center text-center"
              >
                <div className="flex items-center w-full relative">
                  <div
                    className={cn(
                      "flex-1 h-[3px] rounded-[2px]",
                      isFirst
                        ? "bg-transparent"
                        : leftLineDone
                          ? "bg-sun-500"
                          : "bg-white/[0.12]",
                    )}
                    style={
                      leftLineDone
                        ? { boxShadow: "0 0 12px rgba(239,230,58,0.4)" }
                        : undefined
                    }
                    aria-hidden
                  />
                  <div className="relative mx-2 flex-shrink-0">
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-0"
                        style={{
                          width: 80,
                          height: 80,
                          filter: "blur(8px)",
                          opacity: 0.35,
                          background:
                            "conic-gradient(from 215deg at 50% 50%, var(--color-sun-500) 0deg, var(--color-ember-500) 90deg, var(--color-flag-500) 180deg, var(--color-sky-500) 270deg, var(--color-sun-500) 360deg)",
                        }}
                      />
                    )}
                    <div
                      aria-current={isActive ? "step" : undefined}
                      aria-label={
                        isDone
                          ? `Step ${idx} completato: ${stepLabel}`
                          : isActive
                            ? `Step ${idx} attivo: ${stepLabel}`
                            : `Step ${idx}: ${stepLabel}`
                      }
                      className={cn(
                        "relative inline-flex items-center justify-center rounded-full font-extrabold text-lg transition-all",
                        isDone &&
                          "bg-sun-500 text-navy-900 border-2 border-sun-500 shadow-[0_0_0_4px_rgba(239,230,58,0.18)]",
                        isActive &&
                          "bg-white text-navy-900 border-2 border-white shadow-[0_0_0_5px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.35)]",
                        !isDone &&
                          !isActive &&
                          "bg-white/[0.06] border-2 border-white/[0.18] text-white/55",
                      )}
                      style={{ width: 52, height: 52 }}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5" strokeWidth={2.4} />
                      ) : (
                        idx
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex-1 h-[3px] rounded-[2px]",
                      isLast
                        ? "bg-transparent"
                        : rightLineDone
                          ? "bg-sun-500"
                          : "bg-white/[0.12]",
                    )}
                    style={
                      rightLineDone
                        ? { boxShadow: "0 0 12px rgba(239,230,58,0.4)" }
                        : undefined
                    }
                    aria-hidden
                  />
                </div>
                <div className="mt-3.5 min-w-0 px-1">
                  <div
                    className={cn(
                      "font-mono text-[10px] tracking-[0.1em] uppercase font-semibold mb-0.5",
                      isDone
                        ? "text-sun-500"
                        : isActive
                          ? "text-white"
                          : "text-white/45",
                    )}
                  >
                    Step {String(idx).padStart(2, "0")}
                    {isActive ? " · Attivo" : ""}
                  </div>
                  <div
                    className={cn(
                      "text-[13.5px] leading-tight",
                      isDone
                        ? "text-white/85 font-semibold"
                        : isActive
                          ? "text-white font-bold"
                          : "text-white/55 font-semibold",
                    )}
                  >
                    {stepLabel}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
