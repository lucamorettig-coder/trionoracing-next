"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";

const TAGLIE = ["XS", "S", "M", "L", "XL", "XXL"];

interface Props {
  iscrizione: Iscrizione;
}

export default function TabTaglie({ iscrizione }: Props) {
  const router = useRouter();
  const f = iscrizione.fields;
  const confermate = !!f.TAGLIE_KIT_CONFERMATE;

  const [maglia, setMaglia] = useState(f.TAGLIA_MAGLIA ?? "");
  const [pantaloncino, setPantaloncino] = useState(f.TAGLIA_PANTALONCINO ?? "");
  const [tuta, setTuta] = useState(f.TAGLIA_TUTA ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function conferma() {
    if (!maglia || !pantaloncino || !tuta) {
      setError("Seleziona tutte e tre le taglie.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/portale/iscrizioni/${iscrizione.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagliaMaglia: maglia,
          tagliaPantaloncino: pantaloncino,
          tagliaTuta: tuta,
          confermaTaglie: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Errore durante il salvataggio");
      } else {
        router.refresh();
      }
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      {confermate && (
        <div className="p-3 rounded-[var(--radius-lg)] border border-grass-200 bg-grass-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
          <p className="text-sm text-grass-700 font-semibold">
            Taglie confermate{f.DATA_CONFERMA_TAGLIE ? ` il ${formatDateIT(f.DATA_CONFERMA_TAGLIE)}` : ""}
          </p>
        </div>
      )}

      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-5 space-y-4">
        <TagliaSelect
          label="Taglia maglia"
          value={maglia}
          onChange={setMaglia}
          disabled={confermate}
        />
        <TagliaSelect
          label="Taglia pantaloncino"
          value={pantaloncino}
          onChange={setPantaloncino}
          disabled={confermate}
        />
        <TagliaSelect
          label="Taglia tuta"
          value={tuta}
          onChange={setTuta}
          disabled={confermate}
        />

        <p className="text-xs text-ink-muted">
          Trovi la guida taglie su <a href="https://trionoracing.it" className="underline">trionoracing.it</a>.
        </p>

        {error && (
          <div className="p-3 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 text-sm text-flag-700">
            {error}
          </div>
        )}

        {!confermate && (
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={conferma} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvataggio…</> : "Conferma taglie"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function TagliaSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 px-3 bg-white border border-line rounded-[var(--radius-md)] text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 disabled:bg-bg-soft disabled:text-ink-muted"
      >
        <option value="">Seleziona…</option>
        {TAGLIE.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
