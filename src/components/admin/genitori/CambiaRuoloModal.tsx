"use client";

import * as React from "react";
import { UserCheck, AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cambiaRuoloAction } from "@/app/portale/(portal)/admin/genitori/actions";
import type { Genitore, Ruolo } from "@/lib/airtable-portale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genitore: Genitore | null;
  onSuccess?: () => void;
}

const RUOLI_OPTIONS: { value: Ruolo; label: string; description: string }[] = [
  {
    value: "GENITORE",
    label: "Genitore",
    description: "Accesso area genitore (dashboard, iscrizioni, pagamenti).",
  },
  {
    value: "ISTRUTTORE",
    label: "Maestro",
    description: "Accesso area genitore + sezione maestri (lezioni, gare assegnate).",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Accesso completo a tutta l'area admin del portale.",
  },
];

const RUOLO_LABEL: Record<Ruolo, string> = {
  GENITORE: "Genitore",
  ISTRUTTORE: "Maestro",
  ADMIN: "Admin",
};

export function CambiaRuoloModal({ open, onOpenChange, genitore, onSuccess }: Props) {
  const ruoloCorrente: Ruolo = genitore?.fields.RUOLO ?? "GENITORE";
  const [nuovoRuolo, setNuovoRuolo] = React.useState<Ruolo>(ruoloCorrente);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && genitore) {
      setNuovoRuolo(genitore.fields.RUOLO ?? "GENITORE");
      setError(null);
    }
  }, [open, genitore]);

  if (!genitore) return null;

  const openConfirm = () => {
    setError(null);
    if (nuovoRuolo === ruoloCorrente) {
      setError("Il ruolo selezionato è già quello attuale.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await cambiaRuoloAction(genitore.id, nuovoRuolo);
      if (!res.ok) {
        setError(res.error);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      onSuccess?.();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isDowngrade = ruoloCorrente === "ADMIN" && nuovoRuolo !== "ADMIN";

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) setError(null);
          onOpenChange(o);
        }}
      >
        <DialogContent
          size="md"
          showClose={false}
          className="p-0 overflow-hidden flex flex-col max-h-[calc(100vh-64px)]"
        >
          <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-line">
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-ember-100 text-ember-700">
              <UserCheck size={18} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <DialogTitle className="text-base font-bold text-ink leading-tight">
                Cambia ruolo utente
              </DialogTitle>
              <DialogDescription className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">
                {genitore.fields.COGNOME_GENITORE} {genitore.fields.NOME_GENITORE} ·
                attualmente {RUOLO_LABEL[ruoloCorrente]}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700/30"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {RUOLI_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-line cursor-pointer hover:bg-bg-soft has-[:checked]:border-navy-700 has-[:checked]:bg-navy-50/30"
                >
                  <input
                    type="radio"
                    name="ruolo"
                    value={opt.value}
                    checked={nuovoRuolo === opt.value}
                    onChange={() => setNuovoRuolo(opt.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink">{opt.label}</div>
                    <div className="text-[12px] text-ink-muted leading-snug">
                      {opt.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div
              role="alert"
              className="rounded-[var(--radius-md)] bg-ember-50 border border-ember-100 border-l-[3px] border-l-ember-500 px-3 py-2 text-[12px] text-ember-700 flex items-start gap-2"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-ember-500" />
              <span>
                Il nuovo ruolo sarà attivo <strong>al prossimo login</strong> dell&apos;utente.
                Se vuoi che si applichi subito, chiedigli di fare logout e login nuovamente.
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[var(--radius-md)] bg-flag-100 border border-flag-200 px-3 py-2 text-[12.5px] text-flag-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line bg-bg-soft">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={openConfirm}>
              Conferma nuovo ruolo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per {isDowngrade ? "declassare" : "promuovere"}{" "}
              <strong>
                {genitore.fields.COGNOME_GENITORE} {genitore.fields.NOME_GENITORE}
              </strong>{" "}
              da <strong>{RUOLO_LABEL[ruoloCorrente]}</strong> a{" "}
              <strong>{RUOLO_LABEL[nuovoRuolo]}</strong>. La modifica sarà sincronizzata
              in modo transazionale su Airtable e Clerk: in caso di fallimento Clerk,
              Airtable verrà ripristinato automaticamente al ruolo precedente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={submitting}
              className={
                isDowngrade ? "bg-flag-500 hover:bg-flag-600 text-white" : undefined
              }
            >
              {submitting ? "Sincronizzazione…" : "Conferma"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
