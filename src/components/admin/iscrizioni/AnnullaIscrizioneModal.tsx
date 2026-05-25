"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { annullaIscrizione } from "@/lib/actions-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizioneId: string;
}

export function AnnullaIscrizioneModal({ open, onOpenChange, iscrizioneId }: Props) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Annulla iscrizione?"
      description="Eventuali rimborsi vanno gestiti manualmente da SumUp Dashboard o bonifico. I titoli pagamento esistenti restano invariati."
      variant="destructive"
      motivoLabel="Motivo annullamento"
      motivoPlaceholder="Es: richiesta del genitore per trasferimento…"
      motivoRequired
      confirmLabel="Annulla iscrizione"
      cancelLabel="Torna indietro"
      onConfirm={async (motivo) => {
        if (!motivo) return;
        await annullaIscrizione(iscrizioneId, { motivo });
      }}
    />
  );
}
