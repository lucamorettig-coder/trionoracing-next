import { AlertCircle } from "lucide-react";
import type { Bambino, Corso } from "@/lib/airtable-portale";
import { formatEUR, quarterLabel } from "@/lib/portale-utils";
import type { TariffaInfo } from "../WizardNuovaIscrizione";

interface Props {
  bambino: Bambino;
  corso: Corso | null;
  tariffa: TariffaInfo;
  accettato: boolean;
  onAccettatoChange: (v: boolean) => void;
  error: string | null;
  submitting: boolean;
}

export default function StepConferma({
  bambino,
  corso,
  tariffa,
  accettato,
  onAccettatoChange,
  error,
  submitting,
}: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink mb-2">Conferma iscrizione</h2>
      <p className="text-ink-muted text-sm mb-6">
        Controlla i dati prima di confermare.
      </p>

      <div className="bg-bg-soft border border-line rounded-[var(--radius-xl)] p-5 space-y-3 mb-6">
        <Row label="Figlio" value={`${bambino.fields.NOME_BAMBINO} ${bambino.fields.COGNOME_BAMBINO}`} />
        {corso && <Row label="Corso" value={corso} />}
        <Row label="Anno" value={`${tariffa.anno}`} />
        <Row label="Periodo" value={quarterLabel(tariffa.quarter)} />
        <div className="pt-3 border-t border-line flex justify-between items-baseline">
          <span className="text-ink font-bold">Totale</span>
          <span className="text-2xl font-bold text-navy-700">
            {formatEUR(tariffa.importoTotale)}
          </span>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-[var(--radius-lg)] border border-line bg-white hover:border-navy-200 transition-colors">
        <input
          type="checkbox"
          checked={accettato}
          onChange={(e) => onAccettatoChange(e.target.checked)}
          disabled={submitting}
          className="w-5 h-5 mt-0.5 rounded border-line text-navy-700 focus:ring-navy-700/20 shrink-0"
        />
        <span className="text-sm text-ink">
          Ho letto e accetto le condizioni di partecipazione. Confermo i dati del minore.
        </span>
      </label>

      {error && (
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] border border-flag-200 bg-flag-50 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-flag-700 shrink-0" />
          <p className="text-sm text-flag-700">{error}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-ink-muted text-sm">{label}</span>
      <span className="text-ink font-semibold text-right">{value}</span>
    </div>
  );
}
