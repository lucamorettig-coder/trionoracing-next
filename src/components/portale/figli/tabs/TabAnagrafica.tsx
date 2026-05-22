"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calcCategoriaFCI, type Bambino } from "@/lib/airtable-portale";

interface Props {
  bambino: Bambino;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4">
      <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm text-ink font-medium">{value || <span className="text-ink-muted italic">Non inserito</span>}</dd>
    </div>
  );
}

export default function TabAnagrafica({ bambino }: Props) {
  const { fields } = bambino;
  const categoria = fields.DATA_NASCITA_BAMBINO ? calcCategoriaFCI(fields.DATA_NASCITA_BAMBINO) : null;
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Dati anagrafici */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
        <div className="px-6 pt-5 pb-3 border-b border-line">
          <h2 className="font-bold text-ink">Dati anagrafici</h2>
        </div>
        <dl className="px-6 divide-y divide-line/60">
          <Field label="Nome" value={fields.NOME_BAMBINO} />
          <Field label="Cognome" value={fields.COGNOME_BAMBINO} />
          <Field label="Data di nascita" value={fields.DATA_NASCITA_BAMBINO} />
          <Field label="Luogo di nascita" value={fields.LUOGO_NASCITA_BAMBINO} />
          <Field label="Codice fiscale" value={fields.CODICE_FISCALE_BAMBINO} />
        </dl>
      </section>

      {/* Residenza */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
        <div className="px-6 pt-5 pb-3 border-b border-line">
          <h2 className="font-bold text-ink">Residenza</h2>
        </div>
        <dl className="px-6 divide-y divide-line/60">
          <Field label="Indirizzo" value={fields.VIA_RESIDENZA_BAMBINO} />
          <Field label="Città" value={fields.CITTA_RESIDENZA_BAMBINO} />
        </dl>
      </section>

      {/* Sport */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
        <div className="px-6 pt-5 pb-3 border-b border-line">
          <h2 className="font-bold text-ink">Sport</h2>
        </div>
        <dl className="px-6 divide-y divide-line/60">
          <Field label="Categoria FCI" value={categoria ?? undefined} />
        </dl>
      </section>

      <Button asChild variant="outline" size="md">
        <Link href={`/portale/figli/${bambino.id}/modifica`}>Modifica anagrafica</Link>
      </Button>

      {/* Genitori collegati */}
      <section className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="font-bold text-ink mb-4">Genitori collegati</h2>
        <p className="text-sm text-ink-muted mb-4">Tu sei collegato a questo profilo.</p>
        <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
          Invita altro genitore
        </Button>
      </section>

      {/* Modal placeholder invito */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-xl)] p-6 max-w-sm w-full shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-ink text-lg mb-2">Invita altro genitore</h3>
            <p className="text-ink-muted text-sm mb-4">
              Questa funzionalità sarà disponibile a breve. Potrai invitare un secondo genitore a gestire il profilo di tuo figlio.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowInviteModal(false)}>
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
