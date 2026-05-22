import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bambino, Iscrizione } from "@/lib/airtable-portale";

const STATO_BADGE: Record<string, { label: string; variant: "neutral" | "warning" | "info" | "success" | "default" }> = {
  bozza: { label: "Bozza", variant: "neutral" },
  in_completamento: { label: "In completamento", variant: "warning" },
  pronta: { label: "Pronta", variant: "default" },
  attiva: { label: "Attiva", variant: "success" },
  chiusa: { label: "Chiusa", variant: "neutral" },
};

interface Props {
  bambino: Bambino;
  iscrizioni: Iscrizione[];
}

export default function TabIscrizioni({ bambino, iscrizioni }: Props) {
  const { fields } = bambino;
  const hasCert = !!fields.CERTIFICATO_MEDICO_FILE?.length && fields.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!fields.FOTO_BAMBINO?.length;
  const missingDocs = !hasCert || !hasFoto;

  return (
    <div className="space-y-5 max-w-2xl">
      {missingDocs && (
        <div className="flex items-start gap-3 bg-ember-50 border border-ember-200 rounded-[var(--radius-lg)] px-4 py-3">
          <p className="text-sm text-ember-700">
            Per iscrivere {fields.NOME_BAMBINO} serve{!hasCert && " certificato medico valido"}{!hasCert && !hasFoto && " e"}{!hasFoto && " foto"}.{" "}
            <Link href={`/portale/figli/${bambino.id}#certificato`} className="underline font-semibold">
              Caricali ora
            </Link>
          </p>
        </div>
      )}

      {iscrizioni.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
          <p className="text-ink font-semibold mb-1">Nessuna iscrizione</p>
          <p className="text-ink-muted text-sm mb-5">
            Non hai ancora iscritto {fields.NOME_BAMBINO} a un corso.
          </p>
          <Button asChild variant="primary" size="sm" disabled={missingDocs}>
            <Link href={`/portale/iscrizioni/nuova?bambino=${bambino.id}`}>
              Iscrivi ora
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] divide-y divide-line">
          {iscrizioni.map((isc) => {
            const anno = isc.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
            const nomeCorso = isc.fields["NOME_TARIFFA (from TABELLA_TARIFFE)"]?.[0];
            const stato = isc.fields.STATO_ISCRIZIONE ?? "bozza";
            const badgeInfo = STATO_BADGE[stato] ?? { label: stato, variant: "neutral" as const };
            return (
              <div key={isc.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {anno ? `Anno ${anno}` : "Iscrizione"}
                    {nomeCorso && <span className="ml-1.5 text-ink-muted font-normal">· {nomeCorso}</span>}
                  </p>
                  <div className="mt-1">
                    <Badge variant={badgeInfo.variant} size="sm">{badgeInfo.label}</Badge>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/portale/iscrizioni/${isc.id}`}>Apri</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
