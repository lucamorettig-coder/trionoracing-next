import { tipoGaraStyle } from "@/components/portale/gare/gara-utils";
import { cn } from "@/lib/utils";

/** Pill colorata 32x32 per `tipoGara` (riuso EVO-005). */
export function TipoGaraTile({ tipo, size = "md" }: { tipo: string | null; size?: "sm" | "md" | "lg" }) {
  const style = tipoGaraStyle(tipo);
  const sizeClass =
    size === "sm" ? "w-7 h-7 text-[10px]"
    : size === "lg" ? "w-24 h-24 text-base"
    : "w-9 h-9 text-[11px]";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold uppercase tracking-tight shrink-0",
        sizeClass,
        style?.bg ?? "bg-navy-700",
        style?.text ?? "text-white",
      )}
      title={tipo ?? undefined}
    >
      {style?.shortLabel ?? "—"}
    </span>
  );
}

const GIORNI_IT_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const MESI_IT_SHORT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

/** Formatta una data ISO YYYY-MM-DD come "12/06/2026" + giorno settimana abbreviato. */
export function formatDataGara(iso: string | null | undefined): { primary: string; weekday: string } {
  if (!iso) return { primary: "—", weekday: "" };
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return { primary: iso, weekday: "" };
  const dt = new Date(y, m - 1, d);
  const weekday = GIORNI_IT_SHORT[dt.getDay()];
  const primary = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  return { primary, weekday };
}

/** Formatta una data ISO con mese abbreviato in italiano: "12 giu 2026". */
export function formatDataLongIT(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  return `${d} ${MESI_IT_SHORT[m - 1]} ${y}`;
}

/** Formatta DATA_RICHIESTA (ISO datetime) come "12/06/2026 14:30". */
export function formatDataOraIT(iso: string | null | undefined): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}
