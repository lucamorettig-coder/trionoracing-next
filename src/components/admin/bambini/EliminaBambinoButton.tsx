"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteBambino } from "@/lib/actions-admin";

interface Props {
  bambinoId: string;
  nomeBambino: string;
  hasIscrizioni: boolean;
}

export function EliminaBambinoButton({ bambinoId, nomeBambino, hasIscrizioni }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={hasIscrizioni}
        title={hasIscrizioni ? "Impossibile eliminare: il bambino ha iscrizioni collegate" : undefined}
        className="text-flag-600 border-flag-200 hover:bg-flag-50 hover:border-flag-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 size={14} className="mr-1.5" />
        Elimina
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Eliminare ${nomeBambino}?`}
        description="L'operazione è irreversibile. Il record verrà rimosso da Airtable."
        variant="destructive"
        confirmLabel="Elimina bambino"
        cancelLabel="Annulla"
        onConfirm={async () => {
          await deleteBambino(bambinoId);
          router.push("/portale/admin/bambini");
        }}
      />
    </>
  );
}
