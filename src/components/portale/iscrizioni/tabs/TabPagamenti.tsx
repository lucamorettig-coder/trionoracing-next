import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";
import { formatEUR, formatDateIT, statoTitoloBadge } from "@/lib/portale-utils";

interface Props {
  iscrizione: Iscrizione;
  titoli: TitoloPagamento[];
}

const TITOLO_LABEL: Record<string, string> = {
  rata: "Rata",
  prima_rata: "Prima rata",
  rata_successiva: "Rata",
  saldo: "Saldo",
};

export default function TabPagamenti({ iscrizione, titoli }: Props) {
  const incassato = titoli
    .filter((t) => t.fields.STATO_TITOLO === "pagato")
    .reduce((sum, t) => sum + (t.fields.IMPORTO ?? 0), 0);
  const totale = titoli.reduce((sum, t) => sum + (t.fields.IMPORTO ?? 0), 0);
  const daPagare = totale - incassato;

  if (titoli.length === 0) {
    return (
      <div className="max-w-2xl text-center py-10 bg-white border border-line rounded-[var(--radius-xl)]">
        <p className="text-ink-muted">Nessun titolo di pagamento generato.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] divide-y divide-line">
        {titoli.map((t) => {
          const f = t.fields;
          const stato = statoTitoloBadge(f.STATO_TITOLO);
          const tipoLabel = TITOLO_LABEL[f.TIPO_TITOLO ?? "rata"] ?? "Rata";
          const titolo = f.NUMERO_RATA === 1 ? "Prima rata" : `${tipoLabel} ${f.NUMERO_RATA ?? ""}`.trim();
          const pagato = f.STATO_TITOLO === "pagato";

          return (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">
                  {titolo}
                  {typeof f.IMPORTO === "number" && (
                    <span className="ml-2 text-ink-muted font-normal">{formatEUR(f.IMPORTO)}</span>
                  )}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant={stato.variant} size="sm">{stato.label}</Badge>
                  {f.DATA_SCADENZA_PAGAMENTO && !pagato && (
                    <span className="text-xs text-ink-muted">
                      Scade il {formatDateIT(f.DATA_SCADENZA_PAGAMENTO)}
                    </span>
                  )}
                  {pagato && f.DATA_PAGAMENTO && (
                    <span className="text-xs text-ink-muted">
                      Pagato il {formatDateIT(f.DATA_PAGAMENTO)}
                      {f.METODO_PAGAMENTO ? ` via ${f.METODO_PAGAMENTO}` : ""}
                    </span>
                  )}
                </div>
              </div>
              {!pagato && (
                <Button asChild variant="primary" size="sm">
                  <Link href={`/portale/iscrizioni/${iscrizione.id}/checkout?titolo=${t.id}`}>
                    Paga ora
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-ink-muted">Incassato: <span className="font-semibold text-ink">{formatEUR(incassato)}</span></span>
        <span className="text-ink-muted">Da pagare: <span className="font-semibold text-ink">{formatEUR(daPagare)}</span></span>
      </div>
    </div>
  );
}
