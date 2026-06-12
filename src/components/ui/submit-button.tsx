"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * SubmitButton — Triono Racing
 *
 * Bottone di submit che riflette lo stato `pending` del `<form action={…}>`
 * genitore (Server Action): mentre l'azione è in corso mostra lo spinner e si
 * disabilita, così l'utente vede subito che il click è stato registrato e non
 * può rilanciare il form. Previene i doppi invii (es. il maestro che, non
 * vedendo feedback, riclicca "Salva" creando lezioni duplicate).
 *
 * DEVE essere reso DENTRO un `<form>` (non è il form): `useFormStatus` legge lo
 * stato del form genitore più vicino. Per i Server Action passati come prop
 * `action` del form, il `pending` resta true anche durante il `redirect()`
 * finale → il bottone non torna cliccabile finché la navigazione non avviene.
 *
 * Submit multipli nello stesso form (es. "Salva" + un secondo bottone con
 * `formAction`): durante il pending si disabilitano tutti, ma lo spinner appare
 * solo sul bottone effettivamente inviato — se il bottone porta `name`/`value`,
 * confronta la coppia con la FormData in volo; il submit "principale" (senza
 * name) mostra lo spinner su ogni invio.
 */
export function SubmitButton({ loading, disabled, ...props }: ButtonProps) {
  const { pending, data } = useFormStatus();

  const named = typeof props.name === "string";
  const isThisSubmit =
    named && data ? data.get(props.name as string) === String(props.value) : true;

  return (
    <Button
      type="submit"
      loading={loading || (pending && isThisSubmit)}
      disabled={disabled || pending}
      {...props}
    />
  );
}
