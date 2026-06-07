"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TIPO_SESSIONE_VALUES, type TipoSessione } from "@/lib/airtable-portale";
import { tipoSessioneStyle } from "@/lib/portale-utils";
import type { Bambino, Gara, Maestro } from "@/lib/airtable-portale";
import type { LezioneConflittoDTO } from "@/app/portale/(portal)/lezioni/actions-types";
import AttivitaChips from "@/components/portale/lezioni/AttivitaChips";
import MaestriSelector from "@/components/portale/lezioni/MaestriSelector";
import BambiniSelector from "@/components/portale/lezioni/BambiniSelector";
import GaraPicker from "./GaraPicker";

type Modo = "lezione" | "gara";

interface Props {
  /** Server Action a cui inviare il form. */
  action: (formData: FormData) => void | Promise<void>;
  maestri: Maestro[];
  bambini: Bambino[];
  /** Gare selezionabili (future + passate) per la modalità gara. */
  gare: Gara[];
  /** Maestro corrente: in modalità maestro è forzato fra i presenti. Stringa vuota in admin. */
  currentMaestroId: string;
  admin?: boolean;
  cancelHref?: string;
  /**
   * Rileva lezioni già caricate per lo stesso giorno + tipo. Se passata,
   * mostra un avviso anti-duplicato con la possibilità di aggiungersi alla
   * lezione esistente. Assente in admin (banner non mostrato).
   */
  checkConflitto?: (data: string, tipo: string) => Promise<LezioneConflittoDTO[]>;
  /** Server Action "Aggiungimi a questa lezione" (riceve JOIN_LEZIONE_ID). */
  joinAction?: (formData: FormData) => void | Promise<void>;
}

// In modalità lezione le opzioni "Gara …" non devono comparire: una gara si
// registra dalla modalità gara (scrive presenza tipo "gara").
const TIPI_LEZIONE = TIPO_SESSIONE_VALUES.filter(
  (t) => !t.toLowerCase().startsWith("gara"),
) as TipoSessione[];

const oggiISO = () => new Date().toISOString().slice(0, 10);

export default function FormCaricaPresenza({
  action,
  maestri,
  bambini,
  gare,
  currentMaestroId,
  admin = false,
  cancelHref = "/portale/lezioni",
  checkConflitto,
  joinAction,
}: Props) {
  const [modo, setModo] = useState<Modo>("lezione");
  const [tipo, setTipo] = useState<TipoSessione | "">("");
  const [data, setData] = useState<string>(oggiISO());
  const [conflitti, setConflitti] = useState<LezioneConflittoDTO[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [checking, startCheck] = useTransition();

  // Verifica anti-duplicato: ad ogni cambio di data o tipo, cerca lezioni già
  // caricate per la stessa sessione. Niente useEffect (event-driven) per restare
  // lint-clean rispetto a react-hooks/set-state-in-effect.
  function runConflictCheck(nextData: string, nextTipo: TipoSessione | "") {
    if (!checkConflitto || !nextData || !nextTipo) {
      setConflitti([]);
      return;
    }
    setDismissed(false);
    startCheck(async () => {
      const res = await checkConflitto(nextData, nextTipo);
      setConflitti(res);
    });
  }

  const mostraAvviso = conflitti.length > 0 && !dismissed;

  return (
    <form action={action} className="space-y-8 max-w-[720px]" aria-label="Carica presenza">
      {admin && (
        <div
          role="note"
          className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-4 py-3 text-[13px] text-ember-700"
        >
          Stai caricando una presenza <strong className="text-ink">come admin</strong>.
        </div>
      )}

      {/* Switch lezione / gara */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold text-ink mb-1">Tipo di presenza</legend>
        <p className="text-xs text-ink-muted">
          Scegli se stai registrando una lezione o la presenza a una gara.
        </p>
        <div role="radiogroup" aria-label="Tipo di presenza" className="flex flex-wrap gap-2">
          {(["lezione", "gara"] as Modo[]).map((m) => {
            const selected = modo === m;
            return (
              <label
                key={m}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border cursor-pointer transition-colors text-sm font-semibold capitalize",
                  selected
                    ? "bg-navy-700 text-white border-navy-700"
                    : "bg-white border-line text-ink hover:border-navy-200",
                )}
              >
                <input
                  type="radio"
                  name="MODO"
                  value={m}
                  checked={selected}
                  onChange={() => setModo(m)}
                  className="sr-only"
                />
                {m}
              </label>
            );
          })}
        </div>
      </fieldset>

      {modo === "lezione" ? (
        <>
          {/* Quando + tipo */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-ink mb-1">Quando</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="data-input" className="text-sm font-semibold text-ink">
                  Data lezione
                </label>
                <input
                  id="data-input"
                  type="date"
                  name="DATA"
                  required
                  value={data}
                  onChange={(e) => {
                    setData(e.target.value);
                    runConflictCheck(e.target.value, tipo);
                  }}
                  max={oggiISO()}
                  className="w-full h-11 px-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">Tipo di sessione</p>
              <div role="radiogroup" aria-label="Tipo di sessione" className="flex flex-wrap gap-2">
                {TIPI_LEZIONE.map((t) => {
                  const style = tipoSessioneStyle(t);
                  const isSelected = tipo === t;
                  return (
                    <label
                      key={t}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border cursor-pointer transition-colors text-sm font-medium",
                        isSelected
                          ? `${style.bg} ${style.text} border-transparent`
                          : "bg-white border-line text-ink hover:border-navy-200",
                      )}
                    >
                      <input
                        type="radio"
                        name="TIPO_SESSIONE"
                        value={t}
                        checked={isSelected}
                        onChange={() => {
                          setTipo(t);
                          runConflictCheck(data, t);
                        }}
                        required
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                          isSelected ? "bg-white/20" : `${style.bg} ${style.text}`,
                        )}
                      >
                        {style.shortLabel}
                      </span>
                      {t}
                    </label>
                  );
                })}
              </div>
            </div>
          </fieldset>

          {/* Avviso anti-duplicato: lezione già caricata per stesso giorno + tipo */}
          {checking && !mostraAvviso && (
            <p className="text-xs text-ink-muted" role="status">
              Controllo lezioni già caricate per questa data…
            </p>
          )}
          {mostraAvviso && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-4 py-3.5 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={18}
                  className="text-ember-500 shrink-0 mt-0.5"
                  aria-hidden
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-ink">
                    {conflitti.length === 1
                      ? "Questa lezione risulta già caricata"
                      : "Lezioni già caricate per questo giorno"}
                  </p>
                  <p className="text-[13px] text-ember-700">
                    Per evitare doppioni, aggiungiti alla lezione esistente invece
                    di crearne una nuova. Crea una lezione separata solo se è
                    davvero un&apos;altra sessione.
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {conflitti.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-md)] bg-white border border-ember-100 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">
                        {c.tipoLabel}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {c.compilatoriNomi.length > 0
                          ? `Caricata da ${c.compilatoriNomi.join(", ")}`
                          : "Caricata da un altro maestro"}{" "}
                        · {c.nBambini}{" "}
                        {c.nBambini === 1 ? "bambino" : "bambini"}
                      </p>
                    </div>
                    {c.giaPresente ? (
                      <span className="text-xs font-semibold text-grass-700 shrink-0">
                        Sei già su questa lezione
                      </span>
                    ) : (
                      joinAction && (
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          formAction={joinAction}
                          formNoValidate
                          name="JOIN_LEZIONE_ID"
                          value={c.id}
                          className="shrink-0"
                        >
                          Aggiungimi a questa lezione
                        </Button>
                      )
                    )}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-2"
              >
                Crea comunque una lezione separata
              </button>
            </div>
          )}

          {/* Chi ha tenuto */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-ink mb-1">Chi ha tenuto la lezione</legend>
            <p className="text-xs text-ink-muted">
              {admin
                ? "Seleziona il/i maestro/i che hanno tenuto la lezione."
                : "Sei sempre incluso. Aggiungi i co-maestri presenti."}
            </p>
            <MaestriSelector
              maestri={maestri}
              currentMaestroId={currentMaestroId}
              defaultValue={currentMaestroId ? [currentMaestroId] : []}
            />
          </fieldset>

          {/* Argomento */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-ink mb-1">Argomento della lezione</legend>
            <AttivitaChips defaultValue={[]} />
          </fieldset>

          {/* Bambini */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-ink mb-1">Bambini presenti</legend>
            <BambiniSelector bambini={bambini} defaultValue={[]} />
          </fieldset>

          {/* Note */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-ink mb-1">Note</legend>
            <div className="space-y-1.5">
              <label htmlFor="note-pub" className="text-sm font-semibold text-ink">
                Note pubbliche{" "}
                <span className="text-xs font-normal text-ink-muted">(visibili ai genitori)</span>
              </label>
              <textarea
                id="note-pub"
                name="NOTE_ATTIVITA"
                rows={3}
                className="w-full p-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="note-int" className="text-sm font-semibold text-ink">
                Note interne{" "}
                <span className="text-xs font-normal text-ink-muted">(solo maestri e admin)</span>
              </label>
              <textarea
                id="note-int"
                name="NOTE_INTERNE"
                rows={3}
                className="w-full p-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
              />
            </div>
          </fieldset>
        </>
      ) : (
        <>
          {/* Gara esistente */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-ink mb-1">Gara</legend>
            <p className="text-xs text-ink-muted">
              Seleziona la gara dal calendario. La presenza verrà registrata come
              presenza a una gara (rimborso gara).
            </p>
            {gare.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Nessuna gara disponibile nel calendario.
              </p>
            ) : (
              <GaraPicker gare={gare} />
            )}
          </fieldset>

          {/* Maestri presenti */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-ink mb-1">Maestri presenti</legend>
            <p className="text-xs text-ink-muted">
              {admin
                ? "Seleziona il/i maestro/i presenti alla gara."
                : "Sei sempre incluso. Aggiungi i co-maestri presenti."}
            </p>
            <MaestriSelector
              maestri={maestri}
              currentMaestroId={currentMaestroId}
              defaultValue={currentMaestroId ? [currentMaestroId] : []}
            />
          </fieldset>
        </>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="md">
          Salva presenza
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href={cancelHref}>Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
