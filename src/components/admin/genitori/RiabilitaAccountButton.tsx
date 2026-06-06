"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { riabilitaAccountAction } from "@/app/portale/(portal)/admin/genitori/actions";
import type { Genitore } from "@/lib/airtable-portale";

interface Props {
  genitore: Genitore;
}

// Variante grass (riusa i token DS grass-*, nessun token nuovo) per il CTA
// positivo "Riabilita", speculare al destructive "Disabilita".
const GRASS_BTN =
  "bg-grass-600 text-white border-[1.5px] border-grass-600 hover:bg-grass-700 hover:border-grass-700";

/**
 * Bottone "Riabilita account" (EVO-008). Speculare a DisabilitaAccountButton,
 * variante grass (positiva). Mostrato dentro il banner "Account disabilitato".
 */
export function RiabilitaAccountButton({ genitore }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await riabilitaAccountAction(
      genitore.id,
      genitore.fields.AUTH_USER_ID,
    );
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
        <Button type="button" variant="primary" size="sm" className={GRASS_BTN}>
          <UserCheck size={16} />
          Riabilita account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Riabilitare l&apos;account?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>
              {genitore.fields.COGNOME_GENITORE} {genitore.fields.NOME_GENITORE}
            </strong>{" "}
            tornerà a poter accedere con le stesse credenziali.
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
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), GRASS_BTN)}
          >
            {submitting ? "Riabilitazione…" : "Riabilita account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
