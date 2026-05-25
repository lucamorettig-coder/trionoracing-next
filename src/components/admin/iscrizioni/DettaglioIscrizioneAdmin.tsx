"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  MoreHorizontal,
  ExternalLink,
  ShieldOff,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statoIscrizioneAdminBadge } from "@/lib/admin-utils";
import { formatEUR } from "@/lib/portale-utils";
import { ModulisticaIcons, getModulisticaState } from "./ModulisticaIcons";
import { AnnullaIscrizioneModal } from "./AnnullaIscrizioneModal";
import { ForzaCompletaModal } from "./ForzaCompletaModal";
import { AggiungiTitoloManualeModal } from "./AggiungiTitoloManualeModal";
import { SegnaTitoloPagatoModal } from "./SegnaTitoloPagatoModal";
import { updateNoteAdmin } from "@/lib/actions-admin";
import type { Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";

const TABS = [
  { id: "stato", label: "Stato + Override" },
  { id: "modulistica", label: "Modulistica" },
  { id: "taglie", label: "Taglie" },
  { id: "pagamenti", label: "Pagamenti" },
  { id: "storia", label: "Storia + log" },
] as const;

type TabId = typeof TABS[number]["id"];

interface Props {
  iscrizione: Iscrizione;
  titoli: TitoloPagamento[];
}

function StepCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {ok ? (
        <CheckCircle2 size={18} className="text-grass-500 shrink-0" />
      ) : (
        <XCircle size={18} className="text-flag-400 shrink-0" />
      )}
      <span className={cn("text-sm", ok ? "text-ink" : "text-ink-muted")}>{label}</span>
    </div>
  );
}

function parseLogEntries(noteAdmin: string | undefined) {
  const entries: Array<{ ts: string; tipo: string; rest: string }> = [];
  for (const line of (noteAdmin ?? "").split("\n")) {
    const m = line.match(/^\[([^\]]+)\]\s+(\w+)\s+·\s+(.*)$/);
    if (m) {
      entries.push({ ts: m[1], tipo: m[2], rest: m[3] });
    }
  }
  return entries.reverse();
}

function buildTimeline(iscrizione: Iscrizione, titoli: TitoloPagamento[]) {
  const events: Array<{ ts: string; label: string; icon: React.ReactNode }> = [];

  if (iscrizione.createdTime) {
    events.push({
      ts: iscrizione.createdTime,
      label: "Iscrizione creata",
      icon: <CheckCircle2 size={14} className="text-grass-500" />,
    });
  }
  if (iscrizione.fields.DATA_FIRMA_PRIVACY) {
    events.push({
      ts: iscrizione.fields.DATA_FIRMA_PRIVACY,
      label: "Privacy minore firmata",
      icon: <CheckCircle2 size={14} className="text-grass-500" />,
    });
  }
  if (iscrizione.fields.DATA_FIRMA_REGOLAMENTO) {
    events.push({
      ts: iscrizione.fields.DATA_FIRMA_REGOLAMENTO,
      label: "Regolamento firmato",
      icon: <CheckCircle2 size={14} className="text-grass-500" />,
    });
  }
  for (const t of titoli) {
    if (t.fields.PAGATO && t.fields.DATA_PAGAMENTO) {
      events.push({
        ts: t.fields.DATA_PAGAMENTO,
        label: `Pagato: ${t.fields.DESCRIZIONE ?? t.fields.TIPO_TITOLO ?? "titolo"} — ${formatEUR(t.fields.IMPORTO ?? 0)}`,
        icon: <CheckCircle2 size={14} className="text-grass-500" />,
      });
    }
  }

  const logEntries = parseLogEntries(iscrizione.fields.NOTE_ADMIN);
  for (const e of logEntries) {
    events.push({
      ts: e.ts,
      label: `${e.tipo}: ${e.rest}`,
      icon:
        e.tipo === "ANNULLAMENTO" ? (
          <XCircle size={14} className="text-flag-500" />
        ) : (
          <Zap size={14} className="text-ember-500" />
        ),
    });
  }

  return events.sort((a, b) => b.ts.localeCompare(a.ts));
}

export function DettaglioIscrizioneAdmin({ iscrizione, titoli }: Props) {
  const [tab, setTab] = React.useState<TabId>("stato");
  const [openAnnulla, setOpenAnnulla] = React.useState(false);
  const [openForza, setOpenForza] = React.useState(false);
  const [openAggiungi, setOpenAggiungi] = React.useState(false);
  const [openSegna, setOpenSegna] = React.useState(false);
  const [titoloPerSegna, setTitoloPerSegna] = React.useState<TitoloPagamento | null>(null);
  const [noteAdmin, setNoteAdmin] = React.useState(iscrizione.fields.NOTE_ADMIN ?? "");
  const [savingNote, setSavingNote] = React.useState(false);

  const { label: statoLabel, variant: statoVariant } = statoIscrizioneAdminBadge(iscrizione);

  const pagati = titoli.filter((t) => t.fields.PAGATO).length;
  const totalePagato = titoli.filter((t) => t.fields.PAGATO).reduce((s, t) => s + (t.fields.IMPORTO ?? 0), 0);
  const totaleAtteso = titoli.reduce((s, t) => s + (t.fields.IMPORTO ?? 0), 0);

  const timeline = buildTimeline(iscrizione, titoli);

  const saveNote = async () => {
    setSavingNote(true);
    try { await updateNoteAdmin(iscrizione.id, noteAdmin); } finally { setSavingNote(false); }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <Link
        href="/portale/admin/iscrizioni"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft size={14} />
        Torna alla lista iscrizioni
      </Link>
      {/* Header iscrizione */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-sun-700 mb-1">
            Iscrizione {iscrizione.fields.ID_ISCRIZIONE ?? iscrizione.id.slice(-8)}
          </p>
          <h1 className="text-2xl font-bold text-ink">
            {iscrizione.fields.COGNOME_BAMBINO} {iscrizione.fields.NOME_BAMBINO}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={statoVariant} size="md">{statoLabel}</Badge>
            {iscrizione.fields.CORSO && (
              <Badge variant={iscrizione.fields.CORSO === "MTB" ? "success" : "info"} size="md">
                {iscrizione.fields.CORSO}
              </Badge>
            )}
            <Badge variant="neutral" size="md">
              {iscrizione.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? "—"}
            </Badge>
            <ModulisticaIcons {...getModulisticaState(iscrizione.fields)} size="sm" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {iscrizione.fields.TABELLA_BAMBINI?.[0] && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portale/admin/bambini/${iscrizione.fields.TABELLA_BAMBINI[0]}`}>
                <ExternalLink size={14} />
                Scheda bambino
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-line mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === id
                  ? "border-navy-700 text-navy-700"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Stato + Override */}
      {tab === "stato" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">Checklist completamento</h2>
            <StepCheck ok={!!iscrizione.fields.TABELLA_BAMBINI?.length} label="Dati bambino confermati" />
            <StepCheck ok={!!iscrizione.fields.PRIVACY_MINORE} label="Privacy firmata" />
            <StepCheck ok={!!iscrizione.fields.FLAG_REGOLAMENTO} label="Regolamento firmato e caricato" />
            <StepCheck
              ok={!!iscrizione.fields.TAGLIE_KIT_CONFERMATE}
              label="Taglie selezionate e confermate"
            />
            <StepCheck ok={!!iscrizione.fields.PRIMA_RATA_PAGATA} label="1ª rata pagata" />
          </div>

          {/* Override card */}
          <div className="bg-ember-50 border-l-4 border-ember-500 rounded-r-[var(--radius-lg)] p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
              <AlertCircle size={16} className="text-ember-500" />
              Override admin
            </h2>
            <p className="text-[12.5px] text-ink-muted">
              Usa questi bottoni per forzare uno stato o annullare l&apos;iscrizione. Le azioni vengono
              loggaste in Tab Storia.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setOpenForza(true)} className="border-grass-300 text-grass-700 hover:bg-grass-50 hover:border-grass-500">
                <Zap size={14} />
                Forza completata
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setOpenAnnulla(true)}>
                <ShieldOff size={14} />
                Annulla iscrizione
              </Button>
            </div>
          </div>

          {/* Note admin */}
          <div className="bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">Note admin</h2>
            <textarea
              value={noteAdmin}
              onChange={(e) => setNoteAdmin(e.target.value)}
              rows={4}
              placeholder="Note operative interne — non visibili al genitore"
              className="w-full px-3 py-2 text-sm border border-line rounded-[var(--radius-md)] bg-bg-soft focus:outline-none focus:ring-2 focus:ring-navy-700/20 resize-y"
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={saveNote} loading={savingNote}>
                Salva note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Modulistica */}
      {tab === "modulistica" && (
        <div className="bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-ink">Stato modulistica</h2>
          {[
            { label: "Privacy minore", ok: !!iscrizione.fields.PRIVACY_MINORE, data: iscrizione.fields.DATA_FIRMA_PRIVACY, file: null },
            { label: "Regolamento firmato", ok: !!iscrizione.fields.FLAG_REGOLAMENTO, data: iscrizione.fields.DATA_FIRMA_REGOLAMENTO, file: iscrizione.fields.REGOLAMENTO_FIRMATO },
            { label: "Modulo Triono", ok: iscrizione.fields.MODULO_TRIONO_STATO === "approvato", data: null, file: iscrizione.fields.MODULO_TRIONO },
            { label: "Modulo FCI", ok: iscrizione.fields.MODULO_FCI_STATO === "approvato", data: null, file: iscrizione.fields.MODULO_FCI },
          ].map(({ label, ok, data, file }) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-line-soft last:border-0">
              <div className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle2 size={16} className="text-grass-500" />
                ) : (
                  <XCircle size={16} className="text-flag-400" />
                )}
                <span className="text-sm text-ink">{label}</span>
                {data && <span className="text-[12px] text-ink-muted">{new Date(data).toLocaleDateString("it-IT")}</span>}
              </div>
              {file && file[0] && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={file[0].url} target="_blank" rel="noreferrer">
                    <Download size={14} />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Taglie */}
      {tab === "taglie" && (
        <div className="bg-white border border-line rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-ink">Kit scuola — taglie</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Maglia", val: iscrizione.fields.TAGLIA_MAGLIA },
              { label: "Pantaloncino", val: iscrizione.fields.TAGLIA_PANTALONCINO },
              { label: "Tuta", val: iscrizione.fields.TAGLIA_TUTA },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-[var(--radius-md)] border border-line p-3">
                <p className="text-xs text-ink-muted mb-1">{label}</p>
                <p className="font-semibold text-ink">{val ?? "—"}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {iscrizione.fields.TAGLIE_KIT_CONFERMATE ? (
              <CheckCircle2 size={16} className="text-grass-500" />
            ) : (
              <Clock size={16} className="text-ember-500" />
            )}
            <span className="text-sm text-ink">
              {iscrizione.fields.TAGLIE_KIT_CONFERMATE
                ? `Confermate il ${iscrizione.fields.DATA_CONFERMA_TAGLIE ? new Date(iscrizione.fields.DATA_CONFERMA_TAGLIE).toLocaleDateString("it-IT") : "—"}`
                : "Taglie non ancora confermate"}
            </span>
          </div>
        </div>
      )}

      {/* Tab: Pagamenti admin */}
      {tab === "pagamenti" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Titoli di pagamento</h2>
            <Button variant="outline" size="sm" onClick={() => setOpenAggiungi(true)}>
              + Aggiungi titolo manuale
            </Button>
          </div>
          {titoli.length === 0 ? (
            <div className="bg-white border border-line rounded-[var(--radius-lg)] p-8 text-center text-ink-muted text-sm">
              Nessun titolo di pagamento.
            </div>
          ) : (
            <div className="bg-white border border-line rounded-[var(--radius-lg)] overflow-hidden">
              {titoli.map((t) => {
                const stato = t.fields.STATO_TITOLO ?? "da_pagare";
                const stateVariant =
                  stato === "pagato" ? "success" : stato === "scaduto" ? "error" : "warning";
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-line-soft last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {t.fields.DESCRIZIONE ?? t.fields.TIPO_TITOLO ?? "Titolo"}
                      </p>
                      {t.fields.DATA_SCADENZA_PAGAMENTO && (
                        <p className="text-[12px] text-ink-muted">
                          Scadenza {new Date(t.fields.DATA_SCADENZA_PAGAMENTO).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-sm">
                      {formatEUR(t.fields.IMPORTO ?? 0)}
                    </span>
                    <Badge variant={stateVariant} size="sm">
                      {stato === "pagato" ? "Pagato" : stato === "scaduto" ? "Scaduto" : "Da pagare"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="p-1 rounded hover:bg-bg-muted" aria-label="Azioni titolo">
                          <MoreHorizontal size={16} className="text-ink-muted" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {stato !== "pagato" && (
                          <DropdownMenuItem
                            onClick={() => { setTitoloPerSegna(t); setOpenSegna(true); }}
                            className="text-grass-700"
                          >
                            <CheckCircle2 size={14} />
                            Segna pagato
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-right text-[13px] text-ink-muted">
            Totale pagato:{" "}
            <strong className="text-grass-700">{formatEUR(totalePagato)}</strong>
            {" "}/ {formatEUR(totaleAtteso)}
            {totaleAtteso - totalePagato > 0 && (
              <> · Residuo: <strong className="text-flag-600">{formatEUR(totaleAtteso - totalePagato)}</strong></>
            )}
            {" "}({pagati}/{titoli.length} pagati)
          </div>
        </div>
      )}

      {/* Tab: Storia + log */}
      {tab === "storia" && (
        <div className="bg-white border border-line rounded-[var(--radius-lg)] overflow-hidden">
          {timeline.length === 0 ? (
            <div className="p-8 text-center text-ink-muted text-sm">Nessun evento registrato.</div>
          ) : (
            <div className="divide-y divide-line-soft">
              {timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="shrink-0 mt-0.5">{ev.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-ink">{ev.label}</p>
                  </div>
                  <p className="text-[11px] font-mono text-ink-muted shrink-0">
                    {new Date(ev.ts).toLocaleString("it-IT")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnnullaIscrizioneModal
        open={openAnnulla}
        onOpenChange={setOpenAnnulla}
        iscrizioneId={iscrizione.id}
      />
      <ForzaCompletaModal
        open={openForza}
        onOpenChange={setOpenForza}
        iscrizioneId={iscrizione.id}
      />
      <AggiungiTitoloManualeModal
        open={openAggiungi}
        onOpenChange={setOpenAggiungi}
        iscrizioneId={iscrizione.id}
        importoTotale={iscrizione.fields.IMPORTO_FINALE_ANNUO}
      />
      {titoloPerSegna && (
        <SegnaTitoloPagatoModal
          open={openSegna}
          onOpenChange={(next) => { setOpenSegna(next); if (!next) setTitoloPerSegna(null); }}
          titolo={titoloPerSegna}
        />
      )}
    </div>
  );
}
