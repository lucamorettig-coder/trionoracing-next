"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { disabilitaAccountAction } from "@/app/portale/(portal)/admin/genitori/actions";
import type { Genitore } from "@/lib/airtable-portale";

interface Props {
  genitore: Genitore;
}

/**
 * Bottone destructive "Disabilita account" (EVO-008). Pattern AlertDialog di
 * EVO-020 (CambiaRuoloModal), variante destructive. Tiene il dialog aperto su
 * errore per mostrarlo inline; chiude + refresh su successo.
 */
export function DisabilitaAccountButton({ genitore }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await disabilitaAccountAction(genitore.id);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="md">
          <Ban size={16} />
          Disabilita account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disabilitare l&apos;account?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>
              {genitore.fields.COGNOME_GENITORE} {genitore.fields.NOME_GENITORE}
            </strong>{" "}
            non potrà più accedere finché non riabiliti l&apos;account. I dati
            restano invariati. Operazione reversibile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] bg-flag-100 border border-flag-200 px-3 py-2 text-[12.5px] text-flag-700"
          >
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={submitting}
            className={buttonVariants({ variant: "destructive", size: "sm" })}
          >
            {submitting ? "Disabilitazione…" : "Disabilita account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
