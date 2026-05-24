"use client";

import { useMemo, useState } from "react";
import type { Bambino, Gara, IscrizioneGara } from "@/lib/airtable-portale";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import { categoriaCompatibile } from "@/lib/portale-utils";
import CardGara from "./CardGara";
import { meseAnnoKey, meseAnnoLabel } from "./gara-utils";

interface Props {
  gare: Gara[];
  bambini: Bambino[];
  iscrizioniGenitore: IscrizioneGara[];
}

const ALL = "tutte";

export default function FiltriGare({ gare, bambini, iscrizioniGenitore }: Props) {
  const [mese, setMese] = useState<string>(ALL);
  const [regione, setRegione] = useState<string>(ALL);
  const [tipo, setTipo] = useState<string>(ALL);
  const [soloCompatibili, setSoloCompatibili] = useState(false);

  const mesiOptions = useMemo(() => {
    const set = new Map<string, string>();
    for (const g of gare) {
      set.set(meseAnnoKey(g.data), meseAnnoLabel(g.data));
    }
    return Array.from(set, ([key, label]) => ({ key, label })).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [gare]);

  const regioniOptions = useMemo(
    () => Array.from(new Set(gare.map((g) => g.comitatoRegionale).filter(Boolean))) as string[],
    [gare],
  );

  const tipiOptions = useMemo(
    () => Array.from(new Set(gare.map((g) => g.tipoGara).filter(Boolean))) as string[],
    [gare],
  );

  const categorieFigli = useMemo(
    () => bambini.map((b) => calcCategoriaFCI(b.fields.DATA_NASCITA_BAMBINO)).filter(Boolean) as string[],
    [bambini],
  );

  const filtrate = useMemo(() => {
    return gare.filter((g) => {
      if (mese !== ALL && meseAnnoKey(g.data) !== mese) return false;
      if (regione !== ALL && g.comitatoRegionale !== regione) return false;
      if (tipo !== ALL && g.tipoGara !== tipo) return false;
      if (soloCompatibili) {
        const almenoUnoCompat = categorieFigli.some((cat) => categoriaCompatibile(g.classe, cat));
        if (!almenoUnoCompat) return false;
      }
      return true;
    });
  }, [gare, mese, regione, tipo, soloCompatibili, categorieFigli]);

  const grouped = useMemo(() => {
    const map = new Map<string, Gara[]>();
    for (const g of filtrate) {
      const key = meseAnnoKey(g.data);
      const list = map.get(key) ?? [];
      list.push(g);
      map.set(key, list);
    }
    return Array.from(map, ([key, list]) => ({
      key,
      label: list[0] ? meseAnnoLabel(list[0].data) : key,
      list,
    }));
  }, [filtrate]);

  const filtriAttivi = mese !== ALL || regione !== ALL || tipo !== ALL || soloCompatibili;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Select label="Mese" value={mese} onChange={setMese} options={[{ value: ALL, label: "Tutti" }, ...mesiOptions.map((m) => ({ value: m.key, label: m.label }))]} />
        <Select label="Regione" value={regione} onChange={setRegione} options={[{ value: ALL, label: "Tutte" }, ...regioniOptions.map((r) => ({ value: r, label: r }))]} />
        <Select label="Tipologia" value={tipo} onChange={setTipo} options={[{ value: ALL, label: "Tutte" }, ...tipiOptions.map((t) => ({ value: t, label: t }))]} />

        {bambini.length > 0 && (
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium border rounded-[var(--radius-md)] cursor-pointer ${
              soloCompatibili
                ? "border-grass-500 bg-grass-50 text-grass-700 font-semibold"
                : "border-line bg-white text-ink"
            }`}
          >
            <input
              type="checkbox"
              checked={soloCompatibili}
              onChange={(e) => setSoloCompatibili(e.target.checked)}
              className="w-3.5 h-3.5 accent-navy-700"
            />
            Solo compatibili con i miei figli
          </label>
        )}

        {filtriAttivi && (
          <button
            type="button"
            onClick={() => {
              setMese(ALL);
              setRegione(ALL);
              setTipo(ALL);
              setSoloCompatibili(false);
            }}
            className="text-[12.5px] font-semibold text-sky-600 hover:text-navy-700 ml-1"
          >
            Pulisci filtri
          </button>
        )}

        <span className="ml-auto text-[11.5px] font-mono uppercase tracking-wider text-ink-muted">
          {filtrate.length} di {gare.length} {gare.length === 1 ? "gara" : "gare"}
        </span>
      </div>

      {filtrate.length === 0 ? (
        <div className="text-center py-12 bg-white border border-line rounded-[var(--radius-xl)] mt-8">
          <p className="text-ink-muted">Nessuna gara corrisponde ai filtri.</p>
        </div>
      ) : (
        grouped.map((g) => (
          <section key={g.key} className="mt-8">
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.1em] text-ink-muted mb-3.5">
              <span>
                {g.label} · {g.list.length} {g.list.length === 1 ? "gara" : "gare"}
              </span>
              <span className="flex-1 h-px bg-line" aria-hidden />
            </div>
            <div className="space-y-3">
              {g.list.map((gara) => (
                <CardGara
                  key={gara.id}
                  gara={gara}
                  bambini={bambini}
                  iscrizioniGenitore={iscrizioniGenitore}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

function Select({ label, value, onChange, options }: SelectProps) {
  const isActive = value !== ALL;
  return (
    <label
      className={`inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium border rounded-[var(--radius-md)] cursor-pointer ${
        isActive ? "border-navy-700 bg-navy-50" : "border-line bg-white hover:border-navy-200"
      }`}
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
