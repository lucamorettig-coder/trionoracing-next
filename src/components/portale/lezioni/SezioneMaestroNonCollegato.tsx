import { UserX } from "lucide-react";

/**
 * Banner mostrato a un utente ISTRUTTORE il cui record TABELLA_MAESTRI
 * non risulta linkato (email match fallito durante il lazy sync).
 * Sostituisce l'intera SezioneMaestro in dashboard / pagina lezioni.
 */
export default function SezioneMaestroNonCollegato() {
  return (
    <section className="bg-white border border-flag-100 rounded-[var(--radius-xl)] p-6 lg:p-8 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-flag-100 text-flag-700 flex items-center justify-center shrink-0">
          <UserX className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-ink">
            Account maestro non collegato
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Il tuo profilo Clerk risulta come ISTRUTTORE ma non è ancora
            associato a un record nella tabella maestri. Per poter registrare
            lezioni o vedere le gare assegnate, contatta l&apos;amministratore.
          </p>
          <a
            href="mailto:admin@trionoracing.it?subject=Account%20maestro%20da%20collegare"
            className="inline-flex items-center mt-3 text-sm font-semibold text-flag-700 underline underline-offset-2"
          >
            Contatta admin →
          </a>
        </div>
      </div>
    </section>
  );
}
