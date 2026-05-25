"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { rifiutaIscrizioneAction } from "@/app/portale/(portal)/admin/gare/actions";
import { NotifyEmailToggle } from "./ApprovaIscrizioneGaraModal";
import type { IscrizioneGaraAdminEnriched } from "@/lib/airtable-admin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iscrizione: IscrizioneGaraAdminEnriched;
  nomeGara: string;
}

export function RifiutaIscrizioneGaraModal({
  open,
  onOpenChange,
  iscrizione,
  nomeGara,
}: Props) {
  const [notifyEmail, setNotifyEmail] = React.useState(true);

  const handleSubmit = async () => {
    await rifiutaIscrizioneAction(iscrizione.id);
  };

  const bambinoFull = `${iscrizione.bambinoNome} ${iscrizione.bambinoCognome}`.trim();

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rifiuta iscrizione"
      icon={<X size={18} />}
      iconTone="flag"
      submitLabel="Rifiuta iscrizione"
      submitVariant="destructive"
      onSubmit={handleSubmit}
      footerHint="L'iscrizione passerà a 'Rifiutata'. Nessun motivo memorizzato in MVP."
    >
      <p className="text-[14px] text-ink leading-relaxed">
        Sei sicuro di voler rifiutare l&apos;iscrizione di <strong>{bambinoFull}</strong> alla gara{" "}
        <strong>{nomeGara}</strong>?
      </p>

      <NotifyEmailToggle value={notifyEmail} onChange={setNotifyEmail} />
    </AdminFormDialog>
  );
}
