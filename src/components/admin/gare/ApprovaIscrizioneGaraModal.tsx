"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { approvaIscrizioneAction } from "@/app/portale/(portal)/admin/gare/actions";
import type { IscrizioneGaraAdminEnriched } from "@/lib/airtable-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizione: IscrizioneGaraAdminEnriched;
  nomeGara: string;
  dataGara: string;
  onSuccess?: () => void;
}

export function ApprovaIscrizioneGaraModal({
  open,
  onOpenChange,
  iscrizione,
  nomeGara,
  dataGara,
  onSuccess,
}: Props) {
  const [notifyEmail, setNotifyEmail] = React.useState(true);

  const handleSubmit = async () => {
    await approvaIscrizioneAction(iscrizione.id);
    onSuccess?.();
  };

  const bambinoFull = `${iscrizione.bambinoNome} ${iscrizione.bambinoCognome}`.trim();

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Approva iscrizione"
      icon={<Check size={18} />}
      iconTone="grass"
      submitLabel="Conferma approvazione"
      submitVariant="success"
      onSubmit={handleSubmit}
      footerHint="L'iscrizione passerà a 'Confermata' e DATA_CONFERMA sarà valorizzata a oggi."
    >
      <p className="text-[14px] text-ink leading-relaxed">
        Confermi l&apos;iscrizione di <strong>{bambinoFull}</strong> alla gara{" "}
        <strong>{nomeGara}</strong> del {dataGara}?
      </p>

      <NotifyEmailToggle value={notifyEmail} onChange={setNotifyEmail} />
    </AdminFormDialog>
  );
}

export function NotifyEmailToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 p-3 bg-bg-soft rounded-[var(--radius-md)] cursor-not-allowed opacity-75">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled
        className="mt-0.5"
      />
      <div>
        <p className="text-[13px] font-semibold text-ink">
          Notifica genitore via email
        </p>
        <p className="text-[11.5px] text-ink-muted mt-0.5">
          Non attiva in MVP — verrà abilitata in una evolutiva futura. Per ora avvisa manualmente il
          genitore.
        </p>
      </div>
    </label>
  );
}
