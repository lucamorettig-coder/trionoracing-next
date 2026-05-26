"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import {
  bulkApprovaAction,
  bulkRifiutaAction,
} from "@/app/portale/(portal)/admin/gare/actions";
import { NotifyEmailToggle } from "./ApprovaIscrizioneGaraModal";
import type { IscrizioneGaraAdminEnriched } from "@/lib/airtable-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizioni: IscrizioneGaraAdminEnriched[];
  variant: "approva" | "rifiuta";
  nomeGara: string;
  onSuccess?: () => void;
}

export function BulkApprovaRifiutaModal({
  open,
  onOpenChange,
  iscrizioni,
  variant,
  nomeGara,
  onSuccess,
}: Props) {
  const [notifyEmail, setNotifyEmail] = React.useState(true);

  const handleSubmit = async () => {
    const ids = iscrizioni.map((i) => i.id);
    if (variant === "approva") {
      await bulkApprovaAction(ids);
    } else {
      await bulkRifiutaAction(ids);
    }
    onSuccess?.();
  };

  const isApprova = variant === "approva";
  const n = iscrizioni.length;

  const visible = iscrizioni.slice(0, 5);
  const extra = iscrizioni.length - visible.length;

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isApprova ? `Approva ${n} iscrizioni` : `Rifiuta ${n} iscrizioni`}
      icon={isApprova ? <Check size={18} /> : <X size={18} />}
      iconTone={isApprova ? "grass" : "flag"}
      submitLabel={isApprova ? `Approva ${n} iscrizioni` : `Rifiuta ${n} iscrizioni`}
      submitVariant={isApprova ? "success" : "destructive"}
      size="md"
      onSubmit={handleSubmit}
      footerHint={
        isApprova
          ? "Le iscrizioni selezionate passeranno tutte a 'Confermata'."
          : "Le iscrizioni selezionate passeranno tutte a 'Rifiutata'."
      }
    >
      <p className="text-[14px] text-ink leading-relaxed">
        {isApprova ? "Confermi l'approvazione delle " : "Sei sicuro di voler rifiutare le "}
        <strong>{n} iscrizioni</strong> alla gara <strong>{nomeGara}</strong>?
      </p>

      <div className="bg-bg-soft rounded-[var(--radius-md)] p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted mb-2">
          Bambini coinvolti
        </p>
        <ul className="space-y-1">
          {visible.map((i) => (
            <li key={i.id} className="text-[13px] text-ink">
              {i.bambinoCognome} {i.bambinoNome}
              {i.categoriaFCI && (
                <span className="ml-1 text-ink-muted text-[12px]">· {i.categoriaFCI}</span>
              )}
            </li>
          ))}
          {extra > 0 && (
            <li className="text-[13px] text-ink-muted italic">…e altri {extra}</li>
          )}
        </ul>
      </div>

      <NotifyEmailToggle value={notifyEmail} onChange={setNotifyEmail} />
    </AdminFormDialog>
  );
}
