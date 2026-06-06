"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import {
  KIT_SCUOLA,
  TAGLIE_PER_CAMPO,
  cloudinaryOptimized,
  type CapoKit,
} from "@/lib/kit-scuola";

const MAGLIA = KIT_SCUOLA.find((c) => c.slug === "maglia")!;
const SALOPETTE = KIT_SCUOLA.find((c) => c.slug === "salopette")!;
const FELPA = KIT_SCUOLA.find((c) => c.slug === "felpa")!;
const PANTALONE = KIT_SCUOLA.find((c) => c.slug === "pantalone-felpa")!;

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
          capo={MAGLIA}
          label="Taglia maglia"
          value={maglia}
          onChange={setMaglia}
          disabled={confermate}
        />
        <TagliaSelect
          capo={SALOPETTE}
          label="Taglia pantaloncino"
          value={pantaloncino}
          onChange={setPantaloncino}
          disabled={confermate}
        />
        <TagliaTutaSelect
          value={tuta}
          onChange={setTuta}
          disabled={confermate}
        />

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

/** Thumbnail del capo: foto Cloudinary resa piccola su fondo bg-soft. */
function CapoThumb({ capo, className = "" }: { capo: CapoKit; className?: string }) {
  return (
    <div
      className={`relative shrink-0 bg-bg-soft border border-line rounded-[var(--radius-lg)] overflow-hidden ${className}`}
    >
      <Image
        src={cloudinaryOptimized(capo.imageUrl, 200)}
        alt={capo.alt}
        fill
        className="object-contain p-2"
        sizes="(max-width: 640px) 120px, 84px"
      />
    </div>
  );
}

/** Costruisce la lista opzioni includendo, in coda, un valore legacy salvato
 *  ma non più presente fra le choices (così il select non appare vuoto). */
function withLegacyValue(options: readonly string[], value: string): string[] {
  return value && !options.includes(value) ? [...options, value] : [...options];
}

function SelectTaglia({
  id,
  options,
  value,
  onChange,
  disabled,
}: {
  id: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 pl-3 pr-9 appearance-none bg-white border border-line rounded-[var(--radius-md)] text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 disabled:bg-bg-soft disabled:text-ink-muted"
      >
        <option value="">Seleziona…</option>
        {withLegacyValue(options, value).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
    </div>
  );
}

/** Riga taglia per capo singolo: thumbnail + label + select affiancati. */
function TagliaSelect({
  capo,
  label,
  value,
  onChange,
  disabled,
}: {
  capo: CapoKit;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-4">
      <CapoThumb capo={capo} className="w-[84px] h-[84px]" />
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="block text-sm font-semibold text-ink mb-1.5">
          {label}
        </label>
        <SelectTaglia
          id={id}
          options={TAGLIE_PER_CAMPO[capo.campoTaglia]}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

/** Caso speciale "Taglia tuta": felpa + pantalone hanno misura unica.
 *  Due thumbnail affiancate sopra un select unico. */
function TagliaTutaSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-ink">
          Taglia tuta
        </label>
        <span className="text-xs text-sky-500">felpa + pantalone, misura unica</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CapoThumb capo={FELPA} className="h-[120px]" />
        <CapoThumb capo={PANTALONE} className="h-[120px]" />
      </div>
      <SelectTaglia
        id={id}
        options={TAGLIE_PER_CAMPO.TAGLIA_TUTA}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
