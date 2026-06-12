"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  Label,
  Input,
  FormHelper,
  FormError,
} from "@/components/ui/form";
import { calcCategoriaFCI } from "@/lib/airtable-portale";

const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

interface FormData {
  NOME_BAMBINO: string;
  COGNOME_BAMBINO: string;
  DATA_NASCITA_BAMBINO: string;
  LUOGO_NASCITA_BAMBINO: string;
  CODICE_FISCALE_BAMBINO: string;
  VIA_RESIDENZA_BAMBINO: string;
  CITTA_RESIDENZA_BAMBINO: string;
}

interface Props {
  bambinoId?: string;
  initialData?: Partial<FormData>;
  mode?: "create" | "edit";
}

export default function AggiungiFiglioForm({ bambinoId, initialData, mode = "create" }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    NOME_BAMBINO: initialData?.NOME_BAMBINO ?? "",
    COGNOME_BAMBINO: initialData?.COGNOME_BAMBINO ?? "",
    DATA_NASCITA_BAMBINO: initialData?.DATA_NASCITA_BAMBINO ?? "",
    LUOGO_NASCITA_BAMBINO: initialData?.LUOGO_NASCITA_BAMBINO ?? "",
    CODICE_FISCALE_BAMBINO: initialData?.CODICE_FISCALE_BAMBINO ?? "",
    VIA_RESIDENZA_BAMBINO: initialData?.VIA_RESIDENZA_BAMBINO ?? "",
    CITTA_RESIDENZA_BAMBINO: initialData?.CITTA_RESIDENZA_BAMBINO ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categoria = form.DATA_NASCITA_BAMBINO ? calcCategoriaFCI(form.DATA_NASCITA_BAMBINO) : null;

  const eta = form.DATA_NASCITA_BAMBINO
    ? new Date().getFullYear() - new Date(form.DATA_NASCITA_BAMBINO).getFullYear()
    : null;
  const etaWarning = eta !== null && (eta < 5 || eta > 18)
    ? "I nostri corsi sono per bambini 5-12 anni; oltre, l'iscrizione può comunque essere valutata."
    : null;

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.NOME_BAMBINO.trim()) e.NOME_BAMBINO = "Campo obbligatorio";
    if (!form.COGNOME_BAMBINO.trim()) e.COGNOME_BAMBINO = "Campo obbligatorio";
    if (!form.DATA_NASCITA_BAMBINO) e.DATA_NASCITA_BAMBINO = "Campo obbligatorio";
    if (!form.LUOGO_NASCITA_BAMBINO.trim()) e.LUOGO_NASCITA_BAMBINO = "Campo obbligatorio";
    if (!form.CODICE_FISCALE_BAMBINO.trim()) {
      e.CODICE_FISCALE_BAMBINO = "Campo obbligatorio";
    } else if (!CF_REGEX.test(form.CODICE_FISCALE_BAMBINO.toUpperCase())) {
      e.CODICE_FISCALE_BAMBINO = "Formato non valido. Il CF deve essere di 16 caratteri.";
    }
    if (!form.VIA_RESIDENZA_BAMBINO.trim()) e.VIA_RESIDENZA_BAMBINO = "Campo obbligatorio";
    if (!form.CITTA_RESIDENZA_BAMBINO.trim()) e.CITTA_RESIDENZA_BAMBINO = "Campo obbligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);

    const payload = {
      ...form,
      CODICE_FISCALE_BAMBINO: form.CODICE_FISCALE_BAMBINO.toUpperCase(),
    };

    try {
      let res: Response;
      if (mode === "edit" && bambinoId) {
        res = await fetch(`/api/portale/bambini/${bambinoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/portale/bambini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Si è verificato un errore. Riprova.");
        return;
      }

      if (mode === "edit" && bambinoId) {
        router.push(`/portale/figli/${bambinoId}#anagrafica`);
        router.refresh();
      } else {
        const id = data.bambino?.id;
        router.push(`/portale?figlio-creato=${id}`);
      }
    } catch {
      setServerError("Errore di connessione. Controlla la tua rete e riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {serverError && (
        <div className="bg-flag-50 border border-flag-200 rounded-[var(--radius-lg)] px-4 py-3 text-flag-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Sezione 1: Anagrafica */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
        <h2 className="font-bold text-ink text-base">Anagrafica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField>
            <Label htmlFor="nome" required>Nome</Label>
            <Input
              id="nome"
              value={form.NOME_BAMBINO}
              onChange={(e) => set("NOME_BAMBINO", e.target.value)}
              error={!!errors.NOME_BAMBINO}
              placeholder="Es. Marco"
            />
            {errors.NOME_BAMBINO && <FormError>{errors.NOME_BAMBINO}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="cognome" required>Cognome</Label>
            <Input
              id="cognome"
              value={form.COGNOME_BAMBINO}
              onChange={(e) => set("COGNOME_BAMBINO", e.target.value)}
              error={!!errors.COGNOME_BAMBINO}
              placeholder="Es. Rossi"
            />
            {errors.COGNOME_BAMBINO && <FormError>{errors.COGNOME_BAMBINO}</FormError>}
          </FormField>
        </div>

        <FormField>
          <Label htmlFor="data-nascita" required>Data di nascita</Label>
          <Input
            id="data-nascita"
            type="date"
            value={form.DATA_NASCITA_BAMBINO}
            onChange={(e) => set("DATA_NASCITA_BAMBINO", e.target.value)}
            error={!!errors.DATA_NASCITA_BAMBINO}
          />
          {errors.DATA_NASCITA_BAMBINO && <FormError>{errors.DATA_NASCITA_BAMBINO}</FormError>}
          {etaWarning && (
            <FormHelper className="text-ember-600">{etaWarning}</FormHelper>
          )}
          {categoria && !etaWarning && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs text-ink-muted">Categoria FCI:</span>
              <span className="text-xs font-semibold text-sun-700 bg-sun-100 px-2 py-0.5 rounded-full">
                {categoria}
              </span>
              <span className="relative group">
                <Info className="w-3.5 h-3.5 text-ink-muted cursor-help" />
                <span className="hidden group-hover:block absolute left-full ml-1 top-0 bg-ink text-white text-xs rounded px-2 py-1 w-56 z-10">
                  Calcolata automaticamente dal regolamento FCI vigente
                </span>
              </span>
            </div>
          )}
        </FormField>

        <FormField>
          <Label htmlFor="luogo-nascita" required>Luogo di nascita</Label>
          <Input
            id="luogo-nascita"
            value={form.LUOGO_NASCITA_BAMBINO}
            onChange={(e) => set("LUOGO_NASCITA_BAMBINO", e.target.value)}
            error={!!errors.LUOGO_NASCITA_BAMBINO}
            placeholder="Es. Terni TR"
          />
          <FormHelper>Comune e provincia (es. Terni TR)</FormHelper>
          {errors.LUOGO_NASCITA_BAMBINO && <FormError>{errors.LUOGO_NASCITA_BAMBINO}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="cf" required>Codice fiscale</Label>
          <Input
            id="cf"
            value={form.CODICE_FISCALE_BAMBINO}
            onChange={(e) => set("CODICE_FISCALE_BAMBINO", e.target.value.toUpperCase())}
            error={!!errors.CODICE_FISCALE_BAMBINO}
            placeholder="Es. RSSMRC10A01L117K"
            maxLength={16}
          />
          <FormHelper>16 caratteri. Lo trovi sulla tessera sanitaria.</FormHelper>
          {errors.CODICE_FISCALE_BAMBINO && <FormError>{errors.CODICE_FISCALE_BAMBINO}</FormError>}
        </FormField>
      </section>

      {/* Sezione 2: Residenza */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
        <h2 className="font-bold text-ink text-base">Residenza</h2>

        <FormField>
          <Label htmlFor="via" required>Indirizzo di residenza</Label>
          <Input
            id="via"
            value={form.VIA_RESIDENZA_BAMBINO}
            onChange={(e) => set("VIA_RESIDENZA_BAMBINO", e.target.value)}
            error={!!errors.VIA_RESIDENZA_BAMBINO}
            placeholder="Es. Via Roma 1"
          />
          <FormHelper>Via e numero civico</FormHelper>
          {errors.VIA_RESIDENZA_BAMBINO && <FormError>{errors.VIA_RESIDENZA_BAMBINO}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="citta" required>Città</Label>
          <Input
            id="citta"
            value={form.CITTA_RESIDENZA_BAMBINO}
            onChange={(e) => set("CITTA_RESIDENZA_BAMBINO", e.target.value)}
            error={!!errors.CITTA_RESIDENZA_BAMBINO}
            placeholder="Es. Terni TR"
          />
          <FormHelper>Comune e provincia</FormHelper>
          {errors.CITTA_RESIDENZA_BAMBINO && <FormError>{errors.CITTA_RESIDENZA_BAMBINO}</FormError>}
        </FormField>
      </section>

      {/* Sezione 3: Sport */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-bold text-ink text-base mb-4">Sport</h2>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Categoria FCI</p>
            {categoria ? (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sun-700 bg-sun-100 px-3 py-1 rounded-full text-sm">
                  {categoria}
                </span>
                <span className="relative group">
                  <Info className="w-4 h-4 text-ink-muted cursor-help" />
                  <span className="hidden group-hover:block absolute left-full ml-1 top-0 bg-ink text-white text-xs rounded px-2 py-1 w-56 z-10">
                    Calcolata automaticamente dal regolamento FCI vigente
                  </span>
                </span>
              </div>
            ) : (
              <p className="text-ink-muted text-sm">Inserisci la data di nascita per calcolarla</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="md" loading={loading}>
          {mode === "edit" ? "Salva modifiche" : "Aggiungi figlio"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annulla
        </Button>
      </div>
    </form>
  );
}
