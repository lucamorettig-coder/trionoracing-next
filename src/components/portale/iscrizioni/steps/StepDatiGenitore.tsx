"use client";

import { Lock } from "lucide-react";
import StepHeader from "../StepHeader";
import DatiAnagraficiGenitoreFields, {
  type DatiAnagraficiValues,
  type DatiAnagraficiErrors,
} from "@/components/portale/DatiAnagraficiGenitoreFields";

interface Props {
  step: number;
  total: number;
  values: DatiAnagraficiValues;
  errors: DatiAnagraficiErrors;
  onChange: (field: keyof DatiAnagraficiValues, value: string) => void;
  saving?: boolean;
}

/**
 * Step "I tuoi dati" — primo step condizionale del wizard di iscrizione (EVO-029).
 * Compare solo quando il profilo del genitore è incompleto. Presentazionale: lo
 * stato e il salvataggio (PATCH /api/portale/profilo) vivono in WizardNuovaIscrizione.
 */
export default function StepDatiGenitore({
  step,
  total,
  values,
  errors,
  onChange,
  saving = false,
}: Props) {
  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title="I tuoi dati"
        description="Prima di iscrivere tuo figlio completa i tuoi dati anagrafici: servono per il tesseramento e l'assicurazione. Te li chiediamo una sola volta, poi restano nel tuo profilo."
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-navy-100 bg-navy-50 px-3.5 py-3 text-[12.5px] leading-snug text-navy-700">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Dati trattati secondo la Privacy Policy. Usati solo per il tesseramento
          FCI e l&apos;assicurazione del minore.
        </span>
      </div>

      <DatiAnagraficiGenitoreFields
        values={values}
        onChange={onChange}
        errors={errors}
        nomeCognomeReadonly
        disabled={saving}
      />
    </div>
  );
}
