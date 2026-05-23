"use client";

import { useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  PenLine,
  Upload,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Iscrizione } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import { cn } from "@/lib/utils";
import StepHeader from "../StepHeader";

interface Props {
  step: number;
  total: number;
  iscrizione: Iscrizione;
  regolamentoUrl: string | null;
  regolamentoFilename: string | null;
  onUploaded: (info: { url: string; filename: string }) => void;
}

type Phase = "idle" | "downloaded" | "done";

const COPY: Record<Phase, { title: string; description: string }> = {
  idle: {
    title: "Scarica, firma e ricarica il regolamento",
    description:
      "Devi prima scaricare il PDF, firmarlo a penna o digitalmente, e poi ricaricarlo qui. Puoi salvare e tornare in un secondo momento — la procedura riprende da dove l'avevi lasciata.",
  },
  downloaded: {
    title: "Hai scaricato il PDF · ora caricalo firmato",
    description:
      "Firmalo a penna (poi scansiona/fotografa) oppure usa la firma digitale su un PDF reader. Quando sei pronto, trascinalo qui sotto o clicca per selezionarlo.",
  },
  done: {
    title: "Regolamento caricato. Procedi al sommario.",
    description:
      "Abbiamo ricevuto il tuo PDF firmato. Nel frattempo puoi completare l'ultimo step e pagare la prima rata.",
  },
};

export default function StepRegolamento({
  step,
  total,
  iscrizione,
  regolamentoUrl,
  regolamentoFilename,
  onUploaded,
}: Props) {
  const router = useRouter();
  const f = iscrizione.fields;
  const alreadyUploaded =
    !!f.REGOLAMENTO_FIRMATO?.length && !!f.FLAG_REGOLAMENTO;
  const [downloaded, setDownloaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const phase: Phase = alreadyUploaded
    ? "done"
    : downloaded
      ? "downloaded"
      : "idle";

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(
        `/api/portale/iscrizioni/${iscrizione.id}/regolamento`,
        { method: "POST", body: fd },
      );
      if (!res.ok) {
        const raw = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          msg = JSON.parse(raw).error ?? msg;
        } catch {
          if (raw) msg = raw.slice(0, 200);
        }
        setError(msg);
        return;
      }
      const data = (await res.json()) as { url: string; filename: string };
      router.refresh();
      onUploaded({ url: data.url, filename: data.filename });
    } catch {
      setError("Errore di rete");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  const copy = COPY[phase];

  return (
    <div>
      <StepHeader
        step={step}
        total={total}
        title={copy.title}
        description={copy.description}
        accent={phase === "done" ? "grass" : "ember"}
      />

      <div className="rounded-[var(--radius-xl)] overflow-hidden border border-line bg-white shadow-[var(--shadow-sm)]">
        {/* Flow strip a 3 fasi */}
        <FlowStrip phase={phase} />

        <div className="px-5 sm:px-7 py-6 space-y-3">
          <SubStep5a
            phase={phase}
            regolamentoUrl={regolamentoUrl}
            regolamentoFilename={regolamentoFilename}
            onDownloadClick={() => setDownloaded(true)}
          />

          <Connector done={phase !== "idle"} />

          <SubStep5b
            phase={phase}
            iscrizione={iscrizione}
            uploading={uploading}
            dragOver={dragOver}
            onPickFile={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="mt-4 p-3 rounded-[var(--radius-lg)] border border-flag-100 bg-flag-50 text-sm text-flag-700">
          {error}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── FlowStrip ─────────────────────────────

function FlowStrip({ phase }: { phase: Phase }) {
  const states = {
    download: phase === "idle" ? "active" : "done",
    sign: phase === "done" ? "done" : "idle",
    upload:
      phase === "downloaded" ? "active" : phase === "done" ? "done" : "idle",
  } as const;

  return (
    <div className="mx-5 sm:mx-7 mt-5 p-4 rounded-[var(--radius-md)] border border-ember-100 bg-gradient-to-br from-ember-50 to-white relative">
      <div className="grid grid-cols-3 gap-0 relative">
        <FlowStep
          icon={Download}
          num={phase === "idle" ? "5a · ora" : "5a · fatto"}
          label={phase === "idle" ? "Scarica PDF" : "Scaricato"}
          state={states.download}
          showChevron
        />
        <FlowStep
          icon={PenLine}
          num="offline"
          label={phase === "done" ? "Firmato" : "Firma"}
          state={states.sign}
          showChevron
        />
        <FlowStep
          icon={Upload}
          num={
            phase === "done"
              ? "5b · fatto"
              : phase === "downloaded"
                ? "5b · ora"
                : "5b · dopo"
          }
          label={
            phase === "done"
              ? "Caricato"
              : phase === "downloaded"
                ? "Carica firmato"
                : "Ricarica firmato"
          }
          state={states.upload}
          showChevron={false}
        />
      </div>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  num,
  label,
  state,
  showChevron,
}: {
  icon: ComponentType<{ className?: string }>;
  num: string;
  label: string;
  state: "idle" | "active" | "done";
  showChevron: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center px-2 sm:px-3 relative">
      <div
        className={cn(
          "w-9 h-9 rounded-full inline-flex items-center justify-center mb-2 border-2 transition-colors",
          state === "active" &&
            "bg-ember-500 border-ember-500 text-white shadow-[0_0_0_4px_rgba(224,150,24,0.18)]",
          state === "done" && "bg-grass-500 border-grass-500 text-white",
          state === "idle" && "bg-white border-ember-100 text-ember-700",
        )}
      >
        {state === "done" ? (
          <Check className="w-4 h-4" strokeWidth={2.4} />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      <div className="font-mono text-[10px] tracking-[0.08em] uppercase font-bold text-ink-muted">
        {num}
      </div>
      <div
        className={cn(
          "text-[12.5px] font-semibold mt-0.5 leading-tight",
          state === "active" && "text-ember-700",
          state === "done" && "text-grass-700",
          state === "idle" && "text-ink",
        )}
      >
        {label}
      </div>
      {showChevron && (
        <ChevronRight
          aria-hidden
          className="hidden sm:block absolute -right-2.5 top-[14px] w-4 h-4 text-ember-100"
        />
      )}
    </div>
  );
}

// ───────────────────────────── SubStep 5a ─────────────────────────────

function SubStep5a({
  phase,
  regolamentoUrl,
  regolamentoFilename,
  onDownloadClick,
}: {
  phase: Phase;
  regolamentoUrl: string | null;
  regolamentoFilename: string | null;
  onDownloadClick: () => void;
}) {
  const isDone = phase !== "idle";

  return (
    <section
      className={cn(
        "rounded-[var(--radius-md)] border-[1.5px] transition-all overflow-hidden",
        isDone
          ? "border-grass-500/40 bg-grass-50"
          : "border-navy-700 bg-white shadow-[0_0_0_3px_rgba(31,45,90,0.08)]",
      )}
    >
      <header className="flex items-center gap-3.5 px-4 sm:px-[18px] py-3.5">
        <Marker state={isDone ? "done" : "active"} label="5a" />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-ink tracking-tight">
            {isDone ? "Regolamento scaricato" : "Scarica il regolamento"}
          </div>
          <div className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">
            {isDone
              ? "Hai il PDF — firmalo e ricaricalo qui sotto."
              : "Scaricalo, firmalo offline e torna qui per il caricamento."}
          </div>
        </div>
        <StatePill state={isDone ? "done" : "active"} />
      </header>

      <div className="pl-[64px] pr-4 sm:pr-[18px] pb-[18px]">
        {!isDone ? (
          <>
            <div className="bg-bg-soft border border-line rounded-[var(--radius-md)] px-3.5 py-3.5 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[10px] bg-flag-100 text-flag-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-[22px] h-[22px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate">
                  {regolamentoFilename ?? "Regolamento Scuola di Ciclismo.pdf"}
                </div>
                <div className="text-xs text-ink-muted mt-0.5 font-mono">
                  PDF · scaricabile
                </div>
              </div>
              {regolamentoUrl ? (
                <Button asChild variant="primary" size="sm" onClick={onDownloadClick}>
                  <a
                    href={regolamentoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="w-3.5 h-3.5" />
                    Scarica
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-ink-muted italic">
                  Non disponibile
                </span>
              )}
            </div>

            <div className="mt-3.5 p-3 bg-sky-50 border-l-[3px] border-sky-500 rounded-r-[var(--radius-sm)] flex items-start gap-2.5 text-[12.5px] text-sky-700 leading-snug">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-sky-700" />
              <span>
                Una volta scaricato,{" "}
                <strong className="text-sky-800">firma il documento</strong> a
                penna (e poi scansiona/fotografa) oppure usa un PDF reader con
                firma digitale. Quando sei pronto, torna qui: lo step di
                caricamento si attiverà automaticamente.
              </span>
            </div>
          </>
        ) : regolamentoUrl ? (
          <a
            href={regolamentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-700 hover:text-navy-900 underline"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica di nuovo
          </a>
        ) : null}
      </div>
    </section>
  );
}

// ───────────────────────────── SubStep 5b ─────────────────────────────

function SubStep5b({
  phase,
  iscrizione,
  uploading,
  dragOver,
  onPickFile,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  phase: Phase;
  iscrizione: Iscrizione;
  uploading: boolean;
  dragOver: boolean;
  onPickFile: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const state: "locked" | "active" | "done" =
    phase === "idle" ? "locked" : phase === "done" ? "done" : "active";
  const f = iscrizione.fields;
  const file = f.REGOLAMENTO_FIRMATO?.[0];

  return (
    <section
      className={cn(
        "rounded-[var(--radius-md)] border-[1.5px] overflow-hidden transition-all",
        state === "locked" && "opacity-55 border-line bg-bg-soft",
        state === "active" &&
          "border-navy-700 bg-white shadow-[0_0_0_3px_rgba(31,45,90,0.08)]",
        state === "done" && "border-grass-500/40 bg-grass-50",
      )}
    >
      <header className="flex items-center gap-3.5 px-4 sm:px-[18px] py-3.5">
        {state === "locked" ? (
          <div className="w-8 h-8 rounded-full border-2 border-line bg-bg-muted text-ink-muted flex items-center justify-center flex-shrink-0">
            <Lock className="w-[13px] h-[13px]" />
          </div>
        ) : (
          <Marker state={state === "done" ? "done" : "active"} label="5b" />
        )}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[15px] font-bold tracking-tight",
              state === "locked" ? "text-ink-muted" : "text-ink",
            )}
          >
            {state === "done"
              ? "Regolamento firmato caricato"
              : "Ricarica il regolamento firmato"}
          </div>
          <div className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">
            {state === "locked"
              ? "Si sblocca dopo il download. PDF, JPG o PNG · max 50 MB."
              : state === "done" && f.DATA_FIRMA_REGOLAMENTO
                ? `Caricato il ${formatDateIT(f.DATA_FIRMA_REGOLAMENTO)} · in attesa di verifica admin`
                : "PDF, JPG o PNG · max 50 MB. Tutte le pagine devono essere leggibili."}
          </div>
        </div>
        <StatePill state={state} />
      </header>

      {state !== "locked" && (
        <div className="pl-[64px] pr-4 sm:pr-[18px] pb-[18px]">
          {state === "done" && file ? (
            <div className="bg-white border-[1.5px] border-grass-500 rounded-[var(--radius-md)] px-3.5 py-3.5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[10px] bg-grass-500 text-white flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate">
                  {file.filename ?? "Regolamento firmato"}
                </div>
                <div className="text-xs text-grass-700 mt-0.5 font-mono">
                  caricato
                  {f.DATA_FIRMA_REGOLAMENTO
                    ? ` · ${formatDateIT(f.DATA_FIRMA_REGOLAMENTO)}`
                    : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={onPickFile}
                className="text-[12.5px] font-semibold text-ink-muted hover:text-flag-600 underline"
              >
                Sostituisci
              </button>
            </div>
          ) : (
            <>
              <div
                onClick={onPickFile}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onPickFile();
                }}
                className={cn(
                  "border-2 border-dashed rounded-[var(--radius-md)] px-4 py-6 text-center cursor-pointer transition-all",
                  dragOver
                    ? "border-navy-700 bg-navy-100"
                    : "border-navy-200 bg-navy-50 hover:border-navy-700 hover:bg-navy-100",
                )}
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-white text-navy-700 shadow-[var(--shadow-sm)] mb-2.5">
                  {uploading ? (
                    <Loader2 className="w-[22px] h-[22px] animate-spin" />
                  ) : (
                    <UploadCloud className="w-[22px] h-[22px]" />
                  )}
                </div>
                <div className="text-[15px] font-bold text-ink">
                  {uploading
                    ? "Caricamento…"
                    : "Trascina qui il file firmato"}
                </div>
                {!uploading && (
                  <div className="text-[12.5px] text-ink-muted mt-1 leading-snug">
                    oppure{" "}
                    <span className="text-navy-700 underline font-semibold">
                      scegli un file
                    </span>{" "}
                    dal tuo dispositivo · PDF, JPG, PNG · max 50&nbsp;MB
                  </div>
                )}
              </div>

              <div className="mt-3.5 p-3 bg-sky-50 border-l-[3px] border-sky-500 rounded-r-[var(--radius-sm)] flex items-start gap-2.5 text-[12.5px] text-sky-700 leading-snug">
                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-sky-700" />
                <span>
                  <strong className="text-sky-800">
                    Non hai modo di firmare adesso?
                  </strong>{" "}
                  Clicca &quot;Salva ed esci&quot;. Troverai l&apos;iscrizione
                  nella tua lista, pronta a riprendere da qui.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

// ───────────────────────────── Bits ─────────────────────────────

function Marker({
  state,
  label,
}: {
  state: "active" | "done";
  label: string;
}) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full border-2 inline-flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono",
        state === "active" && "bg-navy-700 text-white border-navy-700",
        state === "done" && "bg-grass-500 text-white border-grass-500",
      )}
    >
      {state === "done" ? <Check className="w-3.5 h-3.5" strokeWidth={2.4} /> : label}
    </div>
  );
}

function StatePill({ state }: { state: "active" | "done" | "locked" }) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] tracking-[0.06em] uppercase font-bold flex-shrink-0 px-2.5 py-1 rounded-full",
        state === "active" && "bg-navy-50 text-navy-700",
        state === "done" && "bg-grass-100 text-grass-700",
        state === "locked" && "bg-bg-muted text-ink-muted",
      )}
    >
      {state === "active"
        ? "In corso"
        : state === "done"
          ? "Completato"
          : "Bloccato"}
    </span>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-[18px] ml-7 border-l-2 border-dashed",
        done ? "border-grass-500" : "border-line",
      )}
    />
  );
}
