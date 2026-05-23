interface Props {
  step: number;
  total: number;
  title: string;
  description: string;
}

/**
 * Header standard per ogni step del wizard di iscrizione.
 * Mostra "Step X di N" + titolo + descrizione pratica per il genitore.
 */
export default function StepHeader({ step, total, title, description }: Props) {
  return (
    <header className="mb-6">
      <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-2">
        Step {step} di {total}
      </p>
      <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
      <p className="text-ink-muted text-sm leading-relaxed">{description}</p>
    </header>
  );
}
