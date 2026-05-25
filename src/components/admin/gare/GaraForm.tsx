"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GARA_CLASSI } from "@/lib/airtable-portale";
import { createGaraAction, updateGaraAction } from "@/app/portale/(portal)/admin/gare/actions";
import type { Gara } from "@/lib/airtable-portale";
import type { MaestroLite } from "@/lib/airtable-admin";

const TIPI_GARA = [
  "Strada Giovanile",
  "Crosscountry Giovanile",
  "Enduro",
  "Short Track (XCC)",
  "Gioco Ciclismo",
  "Abilità Str. o FuoriStr",
] as const;

interface Props {
  initial?: Gara;
  maestri: MaestroLite[];
}

export function GaraForm({ initial, maestri }: Props) {
  const router = useRouter();
  const editing = !!initial;

  const [nomeGara, setNomeGara] = React.useState(initial?.nomeGara ?? "");
  const [data, setData] = React.useState(initial?.data ?? "");
  const [luogo, setLuogo] = React.useState(initial?.luogo ?? "");
  const [tipoGara, setTipoGara] = React.useState<string>(initial?.tipoGara ?? "");
  const [classe, setClasse] = React.useState<string>(initial?.classe ?? "");
  const [descrizione, setDescrizione] = React.useState(initial?.descrizione ?? "");
  const [note, setNote] = React.useState(initial?.note ?? "");
  const [inEvidenza, setInEvidenza] = React.useState(initial?.inEvidenza ?? false);
  const [idGaraFci, setIdGaraFci] = React.useState(initial?.idGaraFci ?? "");
  const [linkFci, setLinkFci] = React.useState(initial?.linkFci ?? "");
  const [comitato, setComitato] = React.useState(initial?.comitatoRegionale ?? "");
  const [maestriSel, setMaestriSel] = React.useState<string[]>(
    initial?.maestroAccompagnatoreIds ?? [],
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleMaestro = (id: string) => {
    setMaestriSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomeGara.trim()) {
      setError("Il nome della gara è obbligatorio");
      return;
    }
    if (!data) {
      setError("La data è obbligatoria");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        "Nome Gara": nomeGara.trim(),
        Data: data,
        Luogo: luogo.trim() || undefined,
        "Tipo Gara": tipoGara || undefined,
        Classe: classe || undefined,
        DESCRIZIONE: descrizione.trim() || undefined,
        Note: note.trim() || undefined,
        IN_EVIDENZA: inEvidenza,
        "ID Gara FCI": idGaraFci.trim() || undefined,
        "Link FCI": linkFci.trim() || undefined,
        COMITATO_REGIONALE: comitato.trim() || undefined,
        "Maestro Accompagnatore": maestriSel,
      };

      const result = editing
        ? await updateGaraAction(initial!.id, payload)
        : await createGaraAction(payload);

      if (!result.ok) {
        setError(result.error ?? "Errore durante il salvataggio");
        setLoading(false);
        return;
      }

      router.push(
        `/portale/admin/gare/${result.garaId}?success=${editing ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-5">
      {/* Banner caso eccezionale */}
      <div
        role="alert"
        className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-4 py-3 text-[13px] text-ember-700 flex items-start gap-2"
      >
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <span>
          <strong className="text-ink">Caso eccezionale.</strong> Le gare arrivano normalmente dal
          database. Usa questo form solo se devi inserire una gara manualmente.
        </span>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] bg-flag-50 border border-flag-100 px-4 py-3 text-[13px] text-flag-700">
          {error}
        </div>
      )}

      <Section title="Identità gara">
        <Field label="Nome gara *" htmlFor="nomeGara">
          <input
            id="nomeGara"
            type="text"
            value={nomeGara}
            onChange={(e) => setNomeGara(e.target.value)}
            required
            className={INPUT_CLASS}
            placeholder="es. Gran Premio Giovanissimi Perugia"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Data *" htmlFor="data">
            <input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Luogo" htmlFor="luogo">
            <input
              id="luogo"
              type="text"
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Comune o circuito"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo Gara" htmlFor="tipo">
            <select
              id="tipo"
              value={tipoGara}
              onChange={(e) => setTipoGara(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">— Seleziona —</option>
              {TIPI_GARA.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Classe" htmlFor="classe">
            <select
              id="classe"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">— Seleziona —</option>
              {GARA_CLASSI.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Descrizione & note">
        <Field
          label="Descrizione (visibile ai genitori)"
          htmlFor="descrizione"
          helper="Mostrata su /portale/gare nella scheda gara. Markdown semplice supportato."
        >
          <textarea
            id="descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={4}
            className={`${INPUT_CLASS} min-h-[96px]`}
            placeholder="Descrivi la gara: programma, partenza, premi, info utili per le famiglie…"
          />
        </Field>
        <Field
          label="Note interne (solo admin)"
          htmlFor="note"
          helper="Promemoria operativi. Non visibili ai genitori."
        >
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={`${INPUT_CLASS} min-h-[72px]`}
            placeholder="es. Contatto referente, parcheggi, segreteria…"
          />
        </Field>
        <label className="flex items-start gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] cursor-pointer">
          <input
            type="checkbox"
            checked={inEvidenza}
            onChange={(e) => setInEvidenza(e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <p className="text-[13px] font-semibold text-ink">In evidenza</p>
            <p className="text-[11.5px] text-ink-muted mt-0.5">
              Mostra la gara come evidenziata nelle liste portale (icona ⭐).
            </p>
          </div>
        </label>
      </Section>

      <Section title="Riferimenti FCI">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ID Gara FCI" htmlFor="idFci">
            <input
              id="idFci"
              type="text"
              value={idGaraFci}
              onChange={(e) => setIdGaraFci(e.target.value)}
              className={INPUT_CLASS}
              placeholder="es. UM2026-G123"
            />
          </Field>
          <Field label="Comitato Regionale" htmlFor="comitato">
            <input
              id="comitato"
              type="text"
              value={comitato}
              onChange={(e) => setComitato(e.target.value)}
              className={INPUT_CLASS}
              placeholder="es. Umbria"
            />
          </Field>
        </div>
        <Field label="Link FCI (URL)" htmlFor="linkFci">
          <input
            id="linkFci"
            type="url"
            value={linkFci}
            onChange={(e) => setLinkFci(e.target.value)}
            className={INPUT_CLASS}
            placeholder="https://www.federciclismo.it/it/gara/…"
          />
        </Field>
      </Section>

      <Section title="Maestri assegnati">
        {maestri.length === 0 ? (
          <p className="text-[13px] text-ink-muted">
            Nessun maestro attivo disponibile.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {maestri.map((m) => {
              const selected = maestriSel.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMaestro(m.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12.5px] transition-colors ${
                    selected
                      ? "bg-navy-700 border-navy-700 text-white"
                      : "bg-white border-line text-ink-muted hover:border-navy-700 hover:text-ink"
                  }`}
                >
                  <span className="font-semibold">
                    {m.cognome} {m.nome}
                  </span>
                  {m.qualifica && (
                    <span className={selected ? "text-white/70 text-[11px]" : "text-ink-muted text-[11px]"}>
                      · {m.qualifica}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* Footer azioni */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() =>
            editing
              ? router.push(`/portale/admin/gare/${initial!.id}`)
              : router.push("/portale/admin/gare")
          }
        >
          <X size={14} aria-hidden />
          Annulla
        </Button>
        <Button type="submit" variant="primary" size="md" loading={loading}>
          <Save size={14} aria-hidden />
          {editing ? "Salva modifiche" : "Crea gara"}
        </Button>
      </div>

    </form>
  );
}

const INPUT_CLASS =
  "h-9 px-3 text-[13px] border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 w-full";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-3">
      <p className="text-[11.5px] uppercase tracking-wide font-bold text-ink-muted">{title}</p>
      {children}
    </section>
  );
}

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
      <label htmlFor={htmlFor} className="text-[12px] font-bold text-ink">
        {label}
      </label>
      {children}
      {helper && <span className="text-[11px] text-ink-muted">{helper}</span>}
    </div>
  );
}
