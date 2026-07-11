"use client";

import * as React from "react";
import { Megaphone, Plus, AlertTriangle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { Button } from "@/components/ui/button";
import type { ComunicazioneHeroAdmin, ComunicazioneHeroFormData } from "@/lib/airtable-admin";
import {
  createComunicazioneAction,
  updateComunicazioneAction,
} from "@/app/portale/(portal)/admin/comunicazioni/actions";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comunicazione?: ComunicazioneHeroAdmin;
}

export function ComunicazioneFormDialog({ open, onOpenChange, comunicazione }: DialogProps) {
  const editing = !!comunicazione;
  const f = comunicazione?.fields ?? {};

  const [nome, setNome] = React.useState(f.NOME ?? "");
  const [eyebrow, setEyebrow] = React.useState(f.EYEBROW ?? "");
  const [titolo, setTitolo] = React.useState(f.TITOLO ?? "");
  const [sottotitolo, setSottotitolo] = React.useState(f.SOTTOTITOLO ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(f.CTA_LABEL ?? "");
  const [ctaUrl, setCtaUrl] = React.useState(f.CTA_URL ?? "");
  const [cta2Label, setCta2Label] = React.useState(f.CTA2_LABEL ?? "");
  const [cta2Url, setCta2Url] = React.useState(f.CTA2_URL ?? "");
  const [immagineUrl, setImmagineUrl] = React.useState(f.IMMAGINE_URL ?? "");
  const [attiva, setAttiva] = React.useState(f.ATTIVA ?? true);
  const [validoDa, setValidoDa] = React.useState(f.VALIDO_DA ?? "");
  const [validoA, setValidoA] = React.useState(f.VALIDO_A ?? "");
  const [priorita, setPriorita] = React.useState(f.PRIORITA ?? 0);
  const [note, setNote] = React.useState(f.NOTE ?? "");
  const [errore, setErrore] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setErrore(null);
    const data: ComunicazioneHeroFormData = {
      nome: nome.trim(),
      eyebrow: eyebrow.trim() || undefined,
      titolo: titolo.trim(),
      sottotitolo: sottotitolo.trim() || undefined,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      cta2Label: cta2Label.trim() || undefined,
      cta2Url: cta2Url.trim() || undefined,
      immagineUrl: immagineUrl.trim() || undefined,
      attiva,
      validoDa: validoDa || undefined,
      validoA: validoA || undefined,
      priorita: Number(priorita) || 0,
      note: note.trim() || undefined,
    };
    const res = editing
      ? await updateComunicazioneAction(comunicazione.id, data)
      : await createComunicazioneAction(data);
    if (!res.ok) {
      // Re-throw mantiene il dialog aperto: AdminFormDialog chiude solo su successo.
      setErrore(res.error);
      throw new Error(res.error);
    }
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifica comunicazione" : "Nuova comunicazione"}
      description={
        editing ? f.NOME ?? "" : "Crea una comunicazione da ruotare nella hero della homepage."
      }
      icon={<Megaphone size={18} />}
      iconTone="navy"
      size="lg"
      submitLabel={editing ? "Salva modifiche" : "Crea comunicazione"}
      footerHint="Le comunicazioni attive e nel periodo di validità ruotano nella hero della homepage."
      onSubmit={handleSubmit}
    >
      {errore && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-flag-50 border border-flag-200 border-l-[3px] border-l-flag-500 px-3 py-2.5 text-[12.5px] text-flag-700 flex items-start gap-2"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{errore}</span>
        </div>
      )}

      <Field label="Nome interno" htmlFor="com-nome" helper="Solo per l'admin, non mostrato al pubblico">
        <input
          id="com-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Voglio Te — reclutamento maestri"
          className={inputCls}
        />
      </Field>

      <Field label="Eyebrow (opzionale)" htmlFor="com-eyebrow">
        <input
          id="com-eyebrow"
          type="text"
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          placeholder="Scuola Triono cerca te"
          className={inputCls}
        />
      </Field>

      <Field label="Titolo" htmlFor="com-titolo" helper={`${titolo.length}/60 caratteri`}>
        <input
          id="com-titolo"
          type="text"
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          placeholder="VOGLIO **TE**"
          className={inputCls}
        />
      </Field>

      <Field
        label="Sottotitolo (opzionale)"
        htmlFor="com-sottotitolo"
        helper={`${sottotitolo.length}/140 caratteri`}
      >
        <textarea
          id="com-sottotitolo"
          value={sottotitolo}
          onChange={(e) => setSottotitolo(e.target.value)}
          rows={2}
          placeholder="Diventa Maestro della nostra Scuola di Ciclismo"
          className={`${inputCls} h-auto py-2 resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA — etichetta" htmlFor="com-cta-label">
          <input
            id="com-cta-label"
            type="text"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Scopri come"
            className={inputCls}
          />
        </Field>
        <Field label="CTA — URL" htmlFor="com-cta-url">
          <input
            id="com-cta-url"
            type="text"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="/diventa-maestro"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA secondaria — etichetta (opz.)" htmlFor="com-cta2-label">
          <input
            id="com-cta2-label"
            type="text"
            value={cta2Label}
            onChange={(e) => setCta2Label(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="CTA secondaria — URL (opz.)" htmlFor="com-cta2-url">
          <input
            id="com-cta2-url"
            type="text"
            value={cta2Url}
            onChange={(e) => setCta2Url(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Immagine / cutout (URL, opzionale)" htmlFor="com-immagine">
        <input
          id="com-immagine"
          type="text"
          value={immagineUrl}
          onChange={(e) => setImmagineUrl(e.target.value)}
          placeholder="/vittoria/vittoria-iwantyou.webp"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Valido dal (opz.)" htmlFor="com-valido-da">
          <input
            id="com-valido-da"
            type="date"
            value={validoDa}
            onChange={(e) => setValidoDa(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Valido fino al (opz.)" htmlFor="com-valido-a">
          <input
            id="com-valido-a"
            type="date"
            value={validoA}
            onChange={(e) => setValidoA(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Priorità" htmlFor="com-priorita" helper="Ordine di rotazione, crescente">
        <input
          id="com-priorita"
          type="number"
          min={0}
          step={1}
          value={priorita}
          onChange={(e) => setPriorita(parseInt(e.target.value, 10) || 0)}
          className={`${inputCls} text-right tabular-nums`}
        />
      </Field>

      <Field label="Note interne (opzionale)" htmlFor="com-note">
        <textarea
          id="com-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={`${inputCls} h-auto py-2 resize-none`}
        />
      </Field>

      <label className="flex items-start gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] cursor-pointer">
        <input
          type="checkbox"
          checked={attiva}
          onChange={(e) => setAttiva(e.target.checked)}
          className="mt-0.5"
        />
        <div>
          <p className="text-[13px] font-semibold text-ink">Comunicazione attiva</p>
          <p className="text-[11.5px] text-ink-muted mt-0.5">
            Solo le comunicazioni attive e nel periodo di validità ruotano nella hero.
          </p>
        </div>
      </label>
    </AdminFormDialog>
  );
}

const inputCls =
  "h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-full";

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[11.5px] font-bold text-ink">
        {label}
      </label>
      {children}
      {helper && <span className="text-[11px] text-ink-muted">{helper}</span>}
    </div>
  );
}

export function ComunicazioneFormDialogTrigger() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} />
        Nuova comunicazione
      </Button>
      {open && <ComunicazioneFormDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
