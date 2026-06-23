"use client";

import { Check } from "lucide-react";
import { FormField, Label, Input, FormHelper, FormError } from "@/components/ui/form";
import { CAMPI_PROFILO_OBBLIGATORI } from "@/lib/portale-utils";
import { isCodiceFiscaleValido, ERRORE_CF } from "@/lib/codice-fiscale";

/**
 * Campi anagrafici del genitore — componente condiviso (EVO-030).
 * Usato dalla pagina profilo (`ProfiloGenitoreForm`) e dallo step "I tuoi dati"
 * del wizard di iscrizione (`StepDatiGenitore`). Controllato: lo stato vive nel
 * parent; la validazione è il puro `validateDatiAnagrafici` esportato sotto.
 */

export interface DatiAnagraficiValues {
  NOME_GENITORE: string;
  COGNOME_GENITORE: string;
  CELLULARE_GENITORE: string;
  DATA_NASCITA_GENITORE: string;
  LUOGO_NASCITA_GENITORE: string;
  CODICE_FISCALE_GENITORE: string;
  VIA_RESIDENZA_GENITORE: string;
  CITTA_RESIDENZA_GENITORE: string;
}

export type DatiAnagraficiErrors = Partial<
  Record<keyof DatiAnagraficiValues, string>
>;

/** Valori iniziali da un record genitore (campi mancanti → stringa vuota). */
export function datiAnagraficiFromGenitore(fields: {
  NOME_GENITORE?: string;
  COGNOME_GENITORE?: string;
  CELLULARE_GENITORE?: string;
  DATA_NASCITA_GENITORE?: string;
  LUOGO_NASCITA_GENITORE?: string;
  CODICE_FISCALE_GENITORE?: string;
  VIA_RESIDENZA_GENITORE?: string;
  CITTA_RESIDENZA_GENITORE?: string;
}): DatiAnagraficiValues {
  return {
    NOME_GENITORE: fields.NOME_GENITORE ?? "",
    COGNOME_GENITORE: fields.COGNOME_GENITORE ?? "",
    CELLULARE_GENITORE: fields.CELLULARE_GENITORE ?? "",
    DATA_NASCITA_GENITORE: fields.DATA_NASCITA_GENITORE ?? "",
    LUOGO_NASCITA_GENITORE: fields.LUOGO_NASCITA_GENITORE ?? "",
    CODICE_FISCALE_GENITORE: fields.CODICE_FISCALE_GENITORE ?? "",
    VIA_RESIDENZA_GENITORE: fields.VIA_RESIDENZA_GENITORE ?? "",
    CITTA_RESIDENZA_GENITORE: fields.CITTA_RESIDENZA_GENITORE ?? "",
  };
}

/**
 * Valida i campi obbligatori (presenza) + il codice fiscale (checksum).
 * Ritorna una mappa campo→messaggio; vuota = form valido.
 */
export function validateDatiAnagrafici(
  v: DatiAnagraficiValues,
): DatiAnagraficiErrors {
  const errors: DatiAnagraficiErrors = {};
  for (const k of CAMPI_PROFILO_OBBLIGATORI) {
    if (!v[k].trim()) errors[k] = "Campo obbligatorio";
  }
  if (v.CODICE_FISCALE_GENITORE.trim() && !isCodiceFiscaleValido(v.CODICE_FISCALE_GENITORE)) {
    errors.CODICE_FISCALE_GENITORE = ERRORE_CF;
  }
  return errors;
}

/** True se non ci sono errori di validazione. */
export function isDatiAnagraficiValido(v: DatiAnagraficiValues): boolean {
  return Object.keys(validateDatiAnagrafici(v)).length === 0;
}

interface Props {
  values: DatiAnagraficiValues;
  onChange: (field: keyof DatiAnagraficiValues, value: string) => void;
  /** Errori da mostrare inline (tipicamente dopo un tentativo di submit). */
  errors?: DatiAnagraficiErrors;
  /** Nome/Cognome in sola lettura con hint "(dal tuo account)" — wizard step. */
  nomeCognomeReadonly?: boolean;
  disabled?: boolean;
}

export default function DatiAnagraficiGenitoreFields({
  values,
  onChange,
  errors = {},
  nomeCognomeReadonly = false,
  disabled = false,
}: Props) {
  const cfValid =
    !!values.CODICE_FISCALE_GENITORE.trim() &&
    isCodiceFiscaleValido(values.CODICE_FISCALE_GENITORE);

  return (
    <div className="space-y-4">
      {/* Nome / Cognome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="dati-nome" required={!nomeCognomeReadonly}>
            Nome{" "}
            {nomeCognomeReadonly && (
              <span className="text-ink-muted font-normal">(dal tuo account)</span>
            )}
          </Label>
          <Input
            id="dati-nome"
            value={values.NOME_GENITORE}
            onChange={(e) => onChange("NOME_GENITORE", e.target.value)}
            readOnly={nomeCognomeReadonly}
            disabled={disabled}
            className={nomeCognomeReadonly ? "bg-bg-soft" : undefined}
          />
        </FormField>
        <FormField>
          <Label htmlFor="dati-cognome" required={!nomeCognomeReadonly}>
            Cognome{" "}
            {nomeCognomeReadonly && (
              <span className="text-ink-muted font-normal">(dal tuo account)</span>
            )}
          </Label>
          <Input
            id="dati-cognome"
            value={values.COGNOME_GENITORE}
            onChange={(e) => onChange("COGNOME_GENITORE", e.target.value)}
            readOnly={nomeCognomeReadonly}
            disabled={disabled}
            className={nomeCognomeReadonly ? "bg-bg-soft" : undefined}
          />
        </FormField>
      </div>

      {/* Cellulare */}
      <FormField>
        <Label htmlFor="dati-cellulare" required>
          Cellulare
        </Label>
        <Input
          id="dati-cellulare"
          type="tel"
          value={values.CELLULARE_GENITORE}
          onChange={(e) => onChange("CELLULARE_GENITORE", e.target.value)}
          placeholder="+39 333 1234567"
          error={!!errors.CELLULARE_GENITORE}
          disabled={disabled}
        />
        {errors.CELLULARE_GENITORE && <FormError>{errors.CELLULARE_GENITORE}</FormError>}
      </FormField>

      {/* Data + Luogo nascita */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="dati-data-nascita" required>
            Data di nascita
          </Label>
          <Input
            id="dati-data-nascita"
            type="date"
            value={values.DATA_NASCITA_GENITORE}
            onChange={(e) => onChange("DATA_NASCITA_GENITORE", e.target.value)}
            error={!!errors.DATA_NASCITA_GENITORE}
            disabled={disabled}
          />
          {errors.DATA_NASCITA_GENITORE && (
            <FormError>{errors.DATA_NASCITA_GENITORE}</FormError>
          )}
        </FormField>
        <FormField>
          <Label htmlFor="dati-luogo-nascita" required>
            Luogo di nascita
          </Label>
          <Input
            id="dati-luogo-nascita"
            value={values.LUOGO_NASCITA_GENITORE}
            onChange={(e) => onChange("LUOGO_NASCITA_GENITORE", e.target.value)}
            placeholder="Es. Terni"
            error={!!errors.LUOGO_NASCITA_GENITORE}
            disabled={disabled}
          />
          {errors.LUOGO_NASCITA_GENITORE && (
            <FormError>{errors.LUOGO_NASCITA_GENITORE}</FormError>
          )}
        </FormField>
      </div>

      {/* Codice fiscale */}
      <FormField>
        <Label htmlFor="dati-cf" required>
          Codice fiscale
        </Label>
        <Input
          id="dati-cf"
          value={values.CODICE_FISCALE_GENITORE}
          onChange={(e) =>
            onChange("CODICE_FISCALE_GENITORE", e.target.value.toUpperCase())
          }
          maxLength={16}
          placeholder="RSSMRA80A01L117X"
          className="uppercase"
          error={!!errors.CODICE_FISCALE_GENITORE}
          disabled={disabled}
        />
        {errors.CODICE_FISCALE_GENITORE ? (
          <FormError>{errors.CODICE_FISCALE_GENITORE}</FormError>
        ) : cfValid ? (
          <FormHelper className="text-grass-700 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 shrink-0" /> Valido
          </FormHelper>
        ) : (
          <FormHelper>16 caratteri</FormHelper>
        )}
      </FormField>

      {/* Indirizzo residenza */}
      <FormField>
        <Label htmlFor="dati-via" required>
          Indirizzo di residenza
        </Label>
        <Input
          id="dati-via"
          value={values.VIA_RESIDENZA_GENITORE}
          onChange={(e) => onChange("VIA_RESIDENZA_GENITORE", e.target.value)}
          placeholder="Via e numero civico"
          error={!!errors.VIA_RESIDENZA_GENITORE}
          disabled={disabled}
        />
        {errors.VIA_RESIDENZA_GENITORE ? (
          <FormError>{errors.VIA_RESIDENZA_GENITORE}</FormError>
        ) : (
          <FormHelper>Via e numero civico</FormHelper>
        )}
      </FormField>

      {/* Città */}
      <FormField>
        <Label htmlFor="dati-citta" required>
          Città
        </Label>
        <Input
          id="dati-citta"
          value={values.CITTA_RESIDENZA_GENITORE}
          onChange={(e) => onChange("CITTA_RESIDENZA_GENITORE", e.target.value)}
          placeholder="Es. Terni"
          error={!!errors.CITTA_RESIDENZA_GENITORE}
          disabled={disabled}
        />
        {errors.CITTA_RESIDENZA_GENITORE && (
          <FormError>{errors.CITTA_RESIDENZA_GENITORE}</FormError>
        )}
      </FormField>

      <p className="text-xs text-ink-muted">
        I campi con <span className="text-flag-500 font-bold">*</span> sono obbligatori.
      </p>
    </div>
  );
}
