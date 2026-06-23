"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { Genitore } from "@/lib/airtable-portale";
import DatiAnagraficiGenitoreFields, {
  datiAnagraficiFromGenitore,
  validateDatiAnagrafici,
  type DatiAnagraficiValues,
  type DatiAnagraficiErrors,
} from "@/components/portale/DatiAnagraficiGenitoreFields";

interface Props {
  genitore: Genitore;
}

export default function ProfiloGenitoreForm({ genitore }: Props) {
  const router = useRouter();
  const { signOut, openUserProfile } = useClerk();
  const { fields } = genitore;

  const [form, setForm] = useState<DatiAnagraficiValues>(() =>
    datiAnagraficiFromGenitore(fields),
  );
  const [errors, setErrors] = useState<DatiAnagraficiErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof DatiAnagraficiValues, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateDatiAnagrafici(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setError(null);
      setSuccess(false);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/portale/profilo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Errore durante il salvataggio.");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di connessione.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Sezione 1: I tuoi dati */}
      <form onSubmit={handleSave}>
        <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-5">
          <h2 className="font-bold text-ink text-base">I tuoi dati</h2>

          {success && (
            <div className="bg-grass-50 border border-grass-200 rounded-[var(--radius-md)] px-4 py-2 text-grass-700 text-sm">
              Modifiche salvate.
            </div>
          )}
          {error && (
            <div className="bg-flag-50 border border-flag-200 rounded-[var(--radius-md)] px-4 py-2 text-flag-700 text-sm">
              {error}
            </div>
          )}

          <DatiAnagraficiGenitoreFields
            values={form}
            onChange={set}
            errors={errors}
            disabled={saving}
          />

          <Button type="submit" variant="primary" size="md" loading={saving}>
            Salva modifiche
          </Button>
        </section>
      </form>

      {/* Sezione 2: Sicurezza */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-4">
        <h2 className="font-bold text-ink text-base">Sicurezza</h2>
        <div className="flex items-center justify-between py-2 border-b border-line/60">
          <div>
            <p className="text-sm font-semibold text-ink">Email</p>
            <p className="text-sm text-ink-muted">{fields.EMAIL_GENITORE}</p>
          </div>
        </div>
        <p className="text-sm text-ink-muted">
          Gestisci email, password, autenticazione e dispositivi collegati dal tuo
          account.
        </p>
        <Button
          variant="outline"
          size="md"
          onClick={() => openUserProfile()}
        >
          Gestisci account
        </Button>
      </section>

      {/* Sezione 4: Esci */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-3">
        <h2 className="font-bold text-ink text-base">Account</h2>
        <p className="text-sm text-ink-muted">
          Per cancellare il tuo account scrivi a{" "}
          <a href="mailto:privacy@trionoracing.it" className="underline text-sky-600">
            privacy@trionoracing.it
          </a>
          .
        </p>
        <Button
          variant="destructive"
          size="md"
          onClick={() => signOut({ redirectUrl: "/portale/login" })}
        >
          Esci
        </Button>
      </section>
    </div>
  );
}
