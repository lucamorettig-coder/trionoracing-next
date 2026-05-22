import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bambino } from "@/lib/airtable-portale";
import { certBadgeVariant } from "@/lib/portale-utils";

interface Props {
  bambino: Bambino;
}

export default function StepVerificaRequisiti({ bambino }: Props) {
  const f = bambino.fields;
  const hasCert =
    !!f.CERTIFICATO_MEDICO_FILE?.length && f.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!f.FOTO_BAMBINO?.length;

  const certInfo = certBadgeVariant(f.CERTIFICATO_MEDICO_STATO, f.CERTIFICATO_MEDICO_SCADENZA);

  return (
    <div>
      <h2 className="text-xl font-bold text-ink mb-2">Verifica requisiti</h2>
      <p className="text-ink-muted text-sm mb-6">
        Per iscrivere {f.NOME_BAMBINO} servono certificato medico valido e una sua foto.
      </p>

      <div className="space-y-3">
        {/* Certificato */}
        <div
          className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border ${
            hasCert ? "border-grass-200 bg-grass-50" : "border-ember-200 bg-ember-50"
          }`}
        >
          {hasCert ? (
            <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-ember-700 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">Certificato medico</p>
            <div className="mt-1">
              <Badge variant={certInfo.variant} size="sm">{certInfo.label}</Badge>
            </div>
          </div>
          {!hasCert && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/portale/figli/${bambino.id}#certificato`}>Carica</Link>
            </Button>
          )}
        </div>

        {/* Foto */}
        <div
          className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border ${
            hasFoto ? "border-grass-200 bg-grass-50" : "border-ember-200 bg-ember-50"
          }`}
        >
          {hasFoto ? (
            <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-ember-700 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">Foto</p>
            <p className="text-sm text-ink-muted mt-0.5">
              {hasFoto ? "Foto caricata" : "Foto del bambino mancante"}
            </p>
          </div>
          {!hasFoto && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/portale/figli/${bambino.id}#foto`}>Carica</Link>
            </Button>
          )}
        </div>
      </div>

      {(!hasCert || !hasFoto) && (
        <p className="mt-4 text-sm text-ink-muted">
          Aggiorna i documenti mancanti, poi torna qui per continuare.
        </p>
      )}
    </div>
  );
}
