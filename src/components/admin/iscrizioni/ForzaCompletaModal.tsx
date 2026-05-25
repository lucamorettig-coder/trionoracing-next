"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { forceCompletaIscrizione } from "@/lib/actions-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizioneId: string;
}

export function ForzaCompletaModal({ open, onOpenChange, iscrizioneId }: Props) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Forza completata iscrizione?"
      description="Bypass dei requisiti modulistica. La formula STATO_ISCRIZIONE rimane INCOMPLETA, ma l'UI mostrerà badge 'Completata in deroga' e l'override sarà loggato in Tab Storia."
      variant="warning"
      motivoLabel="Motivo override"
      motivoPlaceholder="Es: modulistica in corso di approvazione, genitore confermato telefonicamente…"
      motivoRequired
      confirmLabel="Forza completata"
      cancelLabel="Annulla"
      onConfirm={async (motivo) => {
        if (!motivo) return;
        await forceCompletaIscrizione(iscrizioneId, { motivo });
      }}
    />
  );
}
