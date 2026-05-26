"use client";

import * as React from "react";
import { Euro, AlertTriangle } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { aggiornaTariffaMaestroAction } from "@/app/portale/(portal)/admin/presenze-maestri/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maestroId: string;
  maestroNome: string;
  maestroCognome: string;
  /** Valori correnti (undefined se mai impostati). */
  tariffaLezione: number | undefined;
  tariffaGara: number | undefined;
  onSuccess?: () => void;
}

export function ModificaTariffaMaestroModal({
  open,
  onOpenChange,
  maestroId,
  maestroNome,
  maestroCognome,
  tariffaLezione,
  tariffaGara,
  onSuccess,
}: Props) {
  const [lezione, setLezione] = React.useState<string>(
    tariffaLezione !== undefined ? String(tariffaLezione) : "",
  );
  const [gara, setGara] = React.useState<string>(
    tariffaGara !== undefined ? String(tariffaGara) : "",
  );

  React.useEffect(() => {
    if (open) {
      setLezione(tariffaLezione !== undefined ? String(tariffaLezione) : "");
      setGara(tariffaGara !== undefined ? String(tariffaGara) : "");
    }
  }, [open, tariffaLezione, tariffaGara]);

  const handleSubmit = async () => {
    const lezioneNum = lezione === "" ? undefined : parseFloat(lezione);
    const garaNum = gara === "" ? undefined : parseFloat(gara);
    if (lezioneNum !== undefined && isNaN(lezioneNum)) {
      alert("Importo lezione non valido");
      return;
    }
    if (garaNum !== undefined && isNaN(garaNum)) {
      alert("Importo gara non valido");
      return;
    }
    const res = await aggiornaTariffaMaestroAction(
      maestroId,
      lezioneNum,
      garaNum,
    );
    if (!res.ok) {
      alert(`Errore: ${res.error}`);
      return;
    }
    onSuccess?.();
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Tariffa rimborso di ${maestroCognome} ${maestroNome}`}
      description="Imposta gli importi per lezione e per gara. Modifica non retroattiva."
      icon={<Euro size={18} />}
      iconTone="ember"
      size="md"
      submitLabel="Salva tariffa"
      submitVariant="primary"
      onSubmit={handleSubmit}
    >
      <div
        role="alert"
        className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-3 py-2 text-[12px] text-ember-700 flex items-start gap-2"
      >
        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-ember-500" />
        <span>
          <strong>La modifica non è retroattiva</strong>: solo le nuove presenze
          useranno questi importi. Le presenze già registrate mantengono l&apos;importo
          storico.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">
          Importo per lezione (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={lezione}
          onChange={(e) => setLezione(e.target.value)}
          placeholder="es. 30.00"
          className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 tabular-nums"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-ink">
          Importo per gara accompagnata (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={gara}
          onChange={(e) => setGara(e.target.value)}
          placeholder="es. 50.00"
          className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 tabular-nums"
        />
      </div>
    </AdminFormDialog>
  );
}
