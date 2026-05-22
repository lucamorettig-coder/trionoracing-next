import { Check } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number;
}

/**
 * Stepper orizzontale per wizard a più step.
 * Step completati: cerchio navy con check. Step attivo: cerchio navy con numero.
 * Step futuri: cerchio neutral con numero.
 */
export default function StepperWizard({ steps, currentStep }: Props) {
  return (
    <ol className="flex items-center justify-between gap-2 max-w-3xl mx-auto" aria-label="Wizard iscrizione">
      {steps.map((label, i) => {
        const stepIdx = i + 1;
        const isCompleted = stepIdx < currentStep;
        const isActive = stepIdx === currentStep;
        const stateClass = isActive
          ? "bg-navy-700 text-white border-navy-700"
          : isCompleted
            ? "bg-navy-700 text-white border-navy-700"
            : "bg-white text-ink-muted border-line";

        return (
          <li key={label} className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${stateClass}`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepIdx}
              </div>
              <span
                className={`text-[11px] sm:text-xs text-center leading-tight font-semibold ${
                  isActive ? "text-navy-700" : isCompleted ? "text-ink" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {stepIdx < steps.length && (
              <div className={`flex-1 h-0.5 ${isCompleted ? "bg-navy-700" : "bg-line"} mb-6`} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
