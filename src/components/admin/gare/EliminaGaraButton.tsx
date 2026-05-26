"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteGaraAction } from "@/app/portale/(portal)/admin/gare/actions";

interface Props {
  garaId: string;
  numIscrizioni: number;
  nomeGara: string;
}

export function EliminaGaraButton({ garaId, numIscrizioni, nomeGara }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasIscrizioni = numIscrizioni > 0;

  const handleConfirm = async () => {
    setError(null);
    const result = await deleteGaraAction(garaId);
    if (!result.ok) {
      if (result.reason === "has_iscrizioni") {
        setError(
          `Impossibile eliminare: ci sono ${result.count} iscrizioni gara collegate.`,
        );
      } else {
        setError(result.error);
      }
      return;
    }
    router.push("/portale/admin/gare?success=deleted");
    router.refresh();
  };

  return (
    <>
      <Button
        variant="destructive"
        size="md"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 size={14} aria-hidden />
        Elimina
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setError(null);
          setOpen(next);
        }}
        variant="destructive"
        title="Eliminare la gara?"
        description={
          hasIscrizioni ? (
            <span>
              <strong>Impossibile eliminare:</strong> ci sono <strong>{numIscrizioni}</strong>{" "}
              iscrizioni gara collegate a <strong>{nomeGara}</strong>. Rifiuta o ritira le iscrizioni
              prima di procedere.
            </span>
          ) : (
            <>
              <span>
                Stai per eliminare definitivamente la gara <strong>{nomeGara}</strong>. L&apos;operazione
                non è reversibile.
              </span>
              {error && (
                <span className="block mt-3 text-flag-700 text-[13px] font-medium">{error}</span>
              )}
            </>
          )
        }
        confirmLabel="Elimina definitivamente"
        cancelLabel="Annulla"
        onConfirm={hasIscrizioni ? () => {} : handleConfirm}
      />
    </>
  );
}
