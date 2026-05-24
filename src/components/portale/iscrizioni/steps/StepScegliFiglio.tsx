import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Bambino } from "@/lib/airtable-portale";
import { diffInYears } from "@/lib/portale-utils";
import StepHeader from "../StepHeader";

interface Props {
  step: number;
  total: number;
  bambini: Bambino[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  bambiniIscrittiAnno?: Map<string, string>;
}

export default function StepScegliFiglio({ step, total, bambini, selectedId, onSelect, bambiniIscrittiAnno }: Props) {
  const anno = new Date().getFullYear();

  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="Per chi è l'iscrizione?"
        description="Seleziona il figlio che vuoi iscrivere alla scuola. Se hai più figli, il wizard ti guiderà solo per quello scelto."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bambini.map((b) => {
          const fotoUrl = b.fields.FOTO_BAMBINO?.[0]?.thumbnails?.small?.url;
          const isSelected = b.id === selectedId;
          const iscrittoPerId = bambiniIscrittiAnno?.get(b.id);
          const isGiaIscritto = !!iscrittoPerId;
          const eta = b.fields.DATA_NASCITA_BAMBINO ? diffInYears(b.fields.DATA_NASCITA_BAMBINO) : null;

          if (isGiaIscritto) {
            return (
              <div
                key={b.id}
                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border-2 border-line bg-bg-soft opacity-85 cursor-not-allowed"
              >
                {fotoUrl ? (
                  <Image
                    src={fotoUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover bg-navy-50 shrink-0 grayscale"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center text-navy-400 font-bold shrink-0">
                    {b.fields.NOME_BAMBINO.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-muted truncate">
                    {b.fields.NOME_BAMBINO} {b.fields.COGNOME_BAMBINO}
                  </p>
                  <p className="text-xs text-ember-700 font-semibold mt-0.5">
                    Già iscritto/a al {anno}
                  </p>
                  <Link
                    href={`/portale/iscrizioni/${iscrittoPerId}`}
                    className="text-[12.5px] text-navy-700 underline underline-offset-1 hover:text-navy-900 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Vedi iscrizione →
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all ${
                isSelected
                  ? "border-navy-700 bg-navy-50"
                  : "border-line bg-white hover:border-navy-200"
              }`}
            >
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover bg-navy-50 shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 font-bold shrink-0">
                  {b.fields.NOME_BAMBINO.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">
                  {b.fields.NOME_BAMBINO} {b.fields.COGNOME_BAMBINO}
                </p>
                {eta !== null && (
                  <p className="text-sm text-ink-muted mt-0.5">{eta} anni</p>
                )}
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
