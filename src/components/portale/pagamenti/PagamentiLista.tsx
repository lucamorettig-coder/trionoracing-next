import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TitoloLabel from "@/components/portale/pagamenti/TitoloLabel";
import type { Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";
import { formatEUR, formatDateIT, statoTitoloBadge } from "@/lib/portale-utils";

interface Props {
  titoli: TitoloPagamento[];
  iscrizioniById: Record<string, Iscrizione>;
}

const STATO_ORDER: Record<string, number> = {
  scaduto: 0,
  da_pagare: 1,
  pagato: 2,
};

export default function PagamentiLista({ titoli, iscrizioniById }: Props) {
  const sorted = [...titoli].sort((a, b) => {
    const sa = STATO_ORDER[(a.fields.STATO_TITOLO ?? "da_pagare").toLowerCase()] ?? 3;
    const sb = STATO_ORDER[(b.fields.STATO_TITOLO ?? "da_pagare").toLowerCase()] ?? 3;
    if (sa !== sb) return sa - sb;
    if (sa === 2) {
      return (b.fields.DATA_PAGAMENTO ?? "").localeCompare(a.fields.DATA_PAGAMENTO ?? "");
    }
    return (a.fields.DATA_SCADENZA_PAGAMENTO ?? "").localeCompare(
      b.fields.DATA_SCADENZA_PAGAMENTO ?? "",
    );
  });

  return (
    <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] divide-y divide-line">
      {sorted.map((t) => {
        const f = t.fields;
        const iscrizioneId = f.ISCRIZIONE?.[0];
        const iscrizione = iscrizioneId ? iscrizioniById[iscrizioneId] : undefined;
        const stato = statoTitoloBadge(f.STATO_TITOLO);
        const pagato = f.STATO_TITOLO === "pagato";

        const nome = iscrizione?.fields["NOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? "";
        const cognome = iscrizione?.fields["COGNOME_BAMBINO (from TABELLA_BAMBINI)"]?.[0] ?? "";
        const fotoUrl =
          iscrizione?.fields["FOTO_BAMBINO (from TABELLA_BAMBINI)"]?.[0]?.thumbnails?.small?.url;
        const annoIsc = iscrizione?.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];

        return (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
            {fotoUrl ? (
              <Image
                src={fotoUrl}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover bg-navy-50 shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 font-bold shrink-0">
                {(nome || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TitoloLabel titolo={t} />
                {typeof f.IMPORTO === "number" && (
                  <span className="ml-1 text-ink-muted font-normal">{formatEUR(f.IMPORTO)}</span>
                )}
              </div>
              {(nome || annoIsc) && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {nome} {cognome}
                  {nome && annoIsc && " · "}
                  {annoIsc && <>Anno {annoIsc}</>}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant={stato.variant} size="sm">
                  {stato.label}
                </Badge>
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
            {!pagato && iscrizioneId && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/portale/iscrizioni/${iscrizioneId}/checkout?titolo=${t.id}`}>
                  Paga ora
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
