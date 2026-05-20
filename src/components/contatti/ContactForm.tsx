"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  FormField,
  Label,
  Input,
  Textarea,
  Select,
  Checkbox,
  FormError,
  FormHelper,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";

type Motivo = "Scuola di Ciclismo" | "Tesseramento Amatori" | "Marathon 209" | "Altro";

const MOTIVI: Motivo[] = [
  "Scuola di Ciclismo",
  "Tesseramento Amatori",
  "Marathon 209",
  "Altro",
];

const motivoFromKey = (key: string | null): Motivo => {
  switch (key) {
    case "scuola":
      return "Scuola di Ciclismo";
    case "tesseramento":
      return "Tesseramento Amatori";
    case "marathon":
      return "Marathon 209";
    default:
      return "Altro";
  }
};

type Status = "idle" | "submitting" | "success" | "error";

interface FieldErrors {
  nome?: string;
  email?: string;
  motivo?: string;
  messaggio?: string;
  privacy_ok?: string;
}

export function ContactForm() {
  const sp = useSearchParams();
  const motivoIniziale = motivoFromKey(sp.get("motivo"));

  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    setFieldErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      nome: String(fd.get("nome") ?? ""),
      cognome: String(fd.get("cognome") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
      motivo: String(fd.get("motivo") ?? ""),
      messaggio: String(fd.get("messaggio") ?? ""),
      privacy_ok: fd.get("privacy_ok") === "on",
      website: String(fd.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && Array.isArray(data?.issues)) {
        const fe: FieldErrors = {};
        for (const it of data.issues as Array<{ path: string; message: string }>) {
          (fe as Record<string, string>)[it.path] = it.message;
        }
        setFieldErrors(fe);
        setErrorMessage("Controlla i campi evidenziati.");
      } else {
        setErrorMessage(data?.error ?? "Errore di invio. Riprova tra qualche minuto.");
      }
      setStatus("error");
    } catch {
      setErrorMessage("Connessione fallita. Verifica la rete e riprova.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-grass-50 border border-grass-200 rounded-[var(--radius-lg)] p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-grass-500 text-white mb-4">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-grass-700">Messaggio inviato!</h2>
        <p className="mt-3 text-ink leading-relaxed">
          Abbiamo ricevuto la tua richiesta. Ti rispondiamo entro 2–3 giorni dall&apos;email
          che hai indicato. In caso di urgenze, scrivici direttamente a{" "}
          <a
            href="mailto:info@trionoracing.it"
            className="font-semibold text-navy-700 underline underline-offset-4"
          >
            info@trionoracing.it
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — nascosto agli umani, visibile ai bot stupidi */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden>
        <label>
          Website (non compilare)
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <FormField>
          <Label htmlFor="nome" required>
            Nome
          </Label>
          <Input
            id="nome"
            name="nome"
            required
            autoComplete="given-name"
            error={!!fieldErrors.nome}
          />
          {fieldErrors.nome && <FormError>{fieldErrors.nome}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="cognome">Cognome</Label>
          <Input id="cognome" name="cognome" autoComplete="family-name" />
        </FormField>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <FormField>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={!!fieldErrors.email}
          />
          {fieldErrors.email && <FormError>{fieldErrors.email}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="telefono">Telefono</Label>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="Opzionale"
          />
        </FormField>
      </div>

      <FormField>
        <Label htmlFor="motivo" required>
          Motivo della richiesta
        </Label>
        <Select id="motivo" name="motivo" required defaultValue={motivoIniziale}>
          {MOTIVI.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField>
        <Label htmlFor="messaggio" required>
          Messaggio
        </Label>
        <Textarea
          id="messaggio"
          name="messaggio"
          required
          rows={5}
          placeholder="Raccontaci di cosa hai bisogno: età di tuo figlio, esperienza, qualsiasi domanda…"
          error={!!fieldErrors.messaggio}
        />
        {fieldErrors.messaggio ? (
          <FormError>{fieldErrors.messaggio}</FormError>
        ) : (
          <FormHelper>Almeno 10 caratteri.</FormHelper>
        )}
      </FormField>

      <FormField>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox name="privacy_ok" required />
          <span className="text-sm text-ink leading-relaxed">
            Ho letto l&apos;informativa privacy e acconsento al trattamento dei miei dati per
            essere ricontattato.{" "}
            <span className="text-flag-500">*</span>
          </span>
        </label>
        {fieldErrors.privacy_ok && <FormError>{fieldErrors.privacy_ok}</FormError>}
      </FormField>

      {errorMessage && (
        <div className="bg-flag-50 border border-flag-200 text-flag-700 rounded-[var(--radius-md)] px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" size="lg" loading={status === "submitting"}>
          Invia richiesta
        </Button>
        <span className="text-xs text-ink-muted">
          Rispondiamo entro 2–3 giorni dall&apos;email indicata.
        </span>
      </div>
    </form>
  );
}
