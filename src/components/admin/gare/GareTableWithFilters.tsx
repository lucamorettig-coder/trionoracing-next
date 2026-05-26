"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GareDataTable, type GaraWithCounter } from "./GareDataTable";

const ALL = "tutte";
const TIPI_GARA = [
  "Strada Giovanile",
  "Crosscountry Giovanile",
  "Enduro",
  "Short Track (XCC)",
  "Gioco Ciclismo",
  "Abilità Str. o FuoriStr",
] as const;

interface Props {
  gare: GaraWithCounter[];
  toggle: "future" | "passate";
  initialSearch: string;
}

function meseKeyOf(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

const MESI_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

function meseLabelOf(iso: string): string {
  const [, m, ] = iso.split("-").map((s) => parseInt(s, 10));
  if (!m) return iso;
  return `${MESI_IT[m - 1]} ${iso.slice(0, 4)}`;
}

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function GareTableWithFilters({ gare, toggle, initialSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search e toggle restano in URL (server-driven)
  const [search, setSearch] = React.useState(initialSearch);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
    // searchParams / router / pathname intentionally omitted: includere
    // searchParams crea un loop infinito (router.replace cambia searchParams →
    // ri-triggera l'effect). Closure cattura i valori corretti al momento del
    // timer fire — è sufficiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Filtri mese/regione/tipo in-memory con prefiltro mese corrente + Umbria.
  const mesiOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const g of gare) {
      if (!g.data) continue;
      map.set(meseKeyOf(g.data), meseLabelOf(g.data));
    }
    return Array.from(map, ([key, label]) => ({ key, label })).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [gare]);

  const regioniOptions = React.useMemo(
    () =>
      Array.from(
        new Set(gare.map((g) => g.comitatoRegionale).filter((x): x is string => !!x)),
      ).sort(),
    [gare],
  );

  const initialMese = React.useMemo(() => {
    if (toggle !== "future") return ALL;
    const key = currentMonthKey();
    return gare.some((g) => meseKeyOf(g.data) === key) ? key : ALL;
  }, [gare, toggle]);

  const initialRegione = React.useMemo(
    () => (gare.some((g) => g.comitatoRegionale === "Umbria") ? "Umbria" : ALL),
    [gare],
  );

  const [mese, setMese] = React.useState<string>(initialMese);
  const [regione, setRegione] = React.useState<string>(initialRegione);
  const [tipo, setTipo] = React.useState<string>(ALL);

  const filtrate = React.useMemo(() => {
    return gare.filter((g) => {
      if (mese !== ALL && meseKeyOf(g.data) !== mese) return false;
      if (regione !== ALL && g.comitatoRegionale !== regione) return false;
      if (tipo !== ALL && g.tipoGara !== tipo) return false;
      return true;
    });
  }, [gare, mese, regione, tipo]);

  const filtriAttivi =
    mese !== initialMese || regione !== initialRegione || tipo !== ALL || !!search;

  const resetFilters = () => {
    setMese(initialMese);
    setRegione(initialRegione);
    setTipo(ALL);
    setSearch("");
  };

  const showAll = () => {
    setMese(ALL);
    setRegione(ALL);
    setTipo(ALL);
    setSearch("");
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        {/* Riga 1: toggle Future/Passate (URL) + search + counter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-line rounded-[var(--radius-md)] overflow-hidden">
            {(["future", "passate"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (val === "future") params.delete("toggle");
                  else params.set("toggle", val);
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                className={cn(
                  "h-9 px-4 text-[13px] font-semibold transition-colors",
                  toggle === val
                    ? "bg-navy-700 text-white"
                    : "bg-white text-ink-muted hover:text-ink hover:bg-bg-soft",
                )}
              >
                {val === "future" ? "Future" : "Passate"}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca gara per nome o luogo…"
              className="w-full h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
              aria-label="Cerca"
            />
          </div>

          <span className="ml-auto text-[12.5px] text-ink-muted font-mono tabular-nums">
            {filtrate.length} di {gare.length} {gare.length === 1 ? "gara" : "gare"}
          </span>

          {filtriAttivi && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 text-[13px] text-ink-muted hover:text-ink flex items-center gap-1"
            >
              <X size={13} />
              Ripristina
            </button>
          )}
        </div>

        {/* Riga 2: mese + regione + tipo (client-side) */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Mese"
            value={mese}
            onChange={setMese}
            options={[{ value: ALL, label: "Tutti" }, ...mesiOptions.map((m) => ({ value: m.key, label: m.label }))]}
          />
          <FilterSelect
            label="Regione"
            value={regione}
            onChange={setRegione}
            options={[{ value: ALL, label: "Tutte" }, ...regioniOptions.map((r) => ({ value: r, label: r }))]}
          />
          <FilterSelect
            label="Tipologia"
            value={tipo}
            onChange={setTipo}
            options={[{ value: ALL, label: "Tutte" }, ...TIPI_GARA.map((t) => ({ value: t, label: t }))]}
          />
        </div>
      </div>

      {filtrate.length === 0 && gare.length > 0 ? (
        <div className="text-center py-12 bg-white border border-line rounded-[var(--radius-xl)]">
          <p className="text-ink-muted mb-3">Nessuna gara corrisponde ai filtri.</p>
          <button
            type="button"
            onClick={showAll}
            className="text-[13px] font-semibold text-sky-600 hover:text-navy-700"
          >
            Mostra tutte le gare
          </button>
        </div>
      ) : (
        <GareDataTable gare={filtrate} toggle={toggle} />
      )}
    </>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  const isActive = value !== ALL;
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium border rounded-[var(--radius-md)] cursor-pointer transition-colors",
        isActive
          ? "border-navy-700 bg-navy-50"
          : "border-line bg-white hover:border-navy-300",
      )}
    >
      <span className="text-[11.5px] text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
