import { AlertCircle } from "lucide-react";

interface Props {
  reason?: string;
}

/**
 * Banner ember mostrato in M-4 quando la lezione è oltre 30 giorni e l'utente
 * non è admin. Il form sotto va renderizzato in modalità read-only.
 */
export default function BannerLezioneNonModificabile({ reason }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-ember-100 bg-ember-50 text-ember-800 px-4 py-3">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold">Lezione in sola lettura</p>
        <p className="mt-0.5">
          {reason ?? "Le lezioni di oltre 30 giorni si modificano solo dall'admin."}
        </p>
      </div>
    </div>
  );
}
