"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FormField, Label, Input, FormHelper } from "@/components/ui/form";
import type { Genitore } from "@/lib/airtable-portale";

interface Props {
  genitore: Genitore;
}

export default function ProfiloGenitoreForm({ genitore }: Props) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { fields } = genitore;

  const [form, setForm] = useState({
    NOME_GENITORE: fields.NOME_GENITORE ?? "",
    COGNOME_GENITORE: fields.COGNOME_GENITORE ?? "",
    CELLULARE_GENITORE: fields.CELLULARE_GENITORE ?? "",
    DATA_NASCITA_GENITORE: fields.DATA_NASCITA_GENITORE ?? "",
    LUOGO_NASCITA_GENITORE: fields.LUOGO_NASCITA_GENITORE ?? "",
    CODICE_FISCALE_GENITORE: fields.CODICE_FISCALE_GENITORE ?? "",
    VIA_RESIDENZA_GENITORE: fields.VIA_RESIDENZA_GENITORE ?? "",
    CITTA_RESIDENZA_GENITORE: fields.CITTA_RESIDENZA_GENITORE ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField>
              <Label htmlFor="nome-genitore">Nome</Label>
              <Input id="nome-genitore" value={form.NOME_GENITORE} onChange={(e) => set("NOME_GENITORE", e.target.value)} />
            </FormField>
            <FormField>
              <Label htmlFor="cognome-genitore">Cognome</Label>
              <Input id="cognome-genitore" value={form.COGNOME_GENITORE} onChange={(e) => set("COGNOME_GENITORE", e.target.value)} />
            </FormField>
          </div>

          <FormField>
            <Label htmlFor="cellulare">Cellulare</Label>
            <Input id="cellulare" type="tel" value={form.CELLULARE_GENITORE} onChange={(e) => set("CELLULARE_GENITORE", e.target.value)} placeholder="+39 333 1234567" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField>
              <Label htmlFor="data-nascita-g">Data di nascita</Label>
              <Input id="data-nascita-g" type="date" value={form.DATA_NASCITA_GENITORE} onChange={(e) => set("DATA_NASCITA_GENITORE", e.target.value)} />
            </FormField>
            <FormField>
              <Label htmlFor="luogo-nascita-g">Luogo di nascita</Label>
              <Input id="luogo-nascita-g" value={form.LUOGO_NASCITA_GENITORE} onChange={(e) => set("LUOGO_NASCITA_GENITORE", e.target.value)} />
            </FormField>
          </div>

          <FormField>
            <Label htmlFor="cf-genitore">Codice fiscale</Label>
            <Input id="cf-genitore" value={form.CODICE_FISCALE_GENITORE} onChange={(e) => set("CODICE_FISCALE_GENITORE", e.target.value.toUpperCase())} maxLength={16} />
          </FormField>

          <FormField>
            <Label htmlFor="via-g">Indirizzo di residenza</Label>
            <Input id="via-g" value={form.VIA_RESIDENZA_GENITORE} onChange={(e) => set("VIA_RESIDENZA_GENITORE", e.target.value)} />
            <FormHelper>Via e numero civico</FormHelper>
          </FormField>

          <FormField>
            <Label htmlFor="citta-g">Città</Label>
            <Input id="citta-g" value={form.CITTA_RESIDENZA_GENITORE} onChange={(e) => set("CITTA_RESIDENZA_GENITORE", e.target.value)} />
          </FormField>

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
        <p className="text-xs text-ink-muted">
          Per cambiare email o password accedi alle impostazioni del tuo account Clerk.
        </p>
      </section>

      {/* Sezione 3: Sessioni */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="font-bold text-ink text-base mb-3">Sessioni</h2>
        <p className="text-sm text-ink-muted">
          Gestisci i dispositivi collegati al tuo account.
        </p>
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
