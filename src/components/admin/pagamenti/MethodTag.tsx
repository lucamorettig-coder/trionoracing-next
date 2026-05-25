import { cn } from "@/lib/utils";

interface MethodTagProps {
  metodo?: string;
  className?: string;
}

interface Style {
  className: string;
  style?: React.CSSProperties;
  label: string;
}

export function methodTagVariant(metodo?: string): Style {
  const m = (metodo ?? "").toLowerCase().replace(/\s+/g, "_");
  if (m === "app" || m === "sumup") {
    return {
      className: "text-white",
      style: { background: "linear-gradient(135deg, #1c79e6, #00b86b)" },
      label: "SUMUP",
    };
  }
  if (m === "bonifico") {
    return { className: "bg-sky-100 text-sky-700", label: "BONIFICO" };
  }
  if (m === "contanti") {
    return { className: "bg-bg-muted text-ink", label: "CONTANTI" };
  }
  if (m === "pos_segreteria" || m === "pos") {
    return { className: "bg-ember-100 text-ember-700", label: "POS SEGRET." };
  }
  return { className: "bg-bg-muted text-ink-muted", label: (metodo ?? "—").toUpperCase() };
}

export function MethodTag({ metodo, className }: MethodTagProps) {
  if (!metodo) return <span className="text-ink-muted">—</span>;
  const v = methodTagVariant(metodo);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10.5px] font-bold uppercase tracking-wide",
        v.className,
        className,
      )}
      style={v.style}
    >
      {v.label}
    </span>
  );
}
