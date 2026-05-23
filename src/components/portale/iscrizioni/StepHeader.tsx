type Accent = "navy" | "sky" | "indigo" | "grass" | "ember" | "sun";

interface Props {
  step: number;
  total: number;
  title: string;
  description: string;
  accent?: Accent;
}

const ACCENT_CLASSES: Record<Accent, { text: string; pip: string }> = {
  navy: { text: "text-navy-700", pip: "bg-navy-700" },
  sky: { text: "text-sky-700", pip: "bg-sky-600" },
  indigo: { text: "text-[#4E3878]", pip: "bg-[#4E3878]" },
  grass: { text: "text-grass-700", pip: "bg-grass-500" },
  ember: { text: "text-ember-700", pip: "bg-ember-500" },
  sun: { text: "text-sun-700", pip: "bg-sun-600" },
};

export default function StepHeader({
  step,
  total,
  title,
  description,
  accent = "navy",
}: Props) {
  const { text, pip } = ACCENT_CLASSES[accent];
  return (
    <header className="mb-6">
      <p
        className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-bold font-mono mb-2 ${text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${pip}`} aria-hidden />
        Step {step} di {total}
      </p>
      <h2 className="text-2xl font-bold text-ink tracking-tight mb-2">{title}</h2>
      <p className="text-ink-muted text-sm leading-relaxed">{description}</p>
    </header>
  );
}
