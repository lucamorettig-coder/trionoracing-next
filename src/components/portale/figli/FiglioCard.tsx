import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calcCategoriaFCI, type Bambino } from "@/lib/airtable-portale";
import { diffInYears, certBadgeVariant, type StatoIscrizione } from "@/lib/portale-utils";

interface FiglioCardProps {
  bambino: Bambino;
  statoIscrizione?: StatoIscrizione;
  iscrizioneId?: string;
}

export default function FiglioCard({ bambino, statoIscrizione, iscrizioneId }: FiglioCardProps) {
  const { fields } = bambino;
  const nome = fields.NOME_BAMBINO ?? "";
  const cognome = fields.COGNOME_BAMBINO ?? "";
  const eta = fields.DATA_NASCITA_BAMBINO ? diffInYears(fields.DATA_NASCITA_BAMBINO) : null;
  const categoria = fields.DATA_NASCITA_BAMBINO ? calcCategoriaFCI(fields.DATA_NASCITA_BAMBINO) : null;
  const fotoUrl = fields.FOTO_BAMBINO?.[0]?.thumbnails?.large?.url ?? fields.FOTO_BAMBINO?.[0]?.url;
  const certStato = fields.CERTIFICATO_MEDICO_STATO;
  const certScadenza = fields.CERTIFICATO_MEDICO_SCADENZA;
  const { variant: certVariant, label: certLabel } = certBadgeVariant(certStato, certScadenza);
  const anno = new Date().getFullYear();

  const initials = `${nome[0] ?? ""}${cognome[0] ?? ""}`.toUpperCase();

  return (
    <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col overflow-hidden">
      {/* Card body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-4">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto di ${nome}`}
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-ink text-base leading-tight truncate">
              {nome} {cognome}
            </p>
            {eta !== null && (
              <p className="text-ink-muted text-sm mt-0.5">
                {eta} {eta === 1 ? "anno" : "anni"}
                {categoria && <span className="ml-1.5">· {categoria}</span>}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={certVariant} size="sm">{certLabel}</Badge>
        </div>

        {/* Bottone "Apri scheda" solo se non c'è tile stato iscrizione */}
        {!statoIscrizione && (
          <Button asChild variant="outline" size="sm" className="mt-auto w-full">
            <Link href={`/portale/figli/${bambino.id}`}>Apri scheda</Link>
          </Button>
        )}
      </div>

      {/* Tile stato iscrizione */}
      {statoIscrizione === 'iscritto' && (
        <div className="bg-grass-500 px-[18px] py-4 flex flex-col gap-3">
          <p className="text-white text-sm font-bold">Iscritto {anno}</p>
          <Link
            href={iscrizioneId ? `/portale/iscrizioni/${iscrizioneId}` : "/portale/iscrizioni"}
            className="self-start text-sm font-semibold text-white underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            Vedi iscrizione →
          </Link>
        </div>
      )}

      {statoIscrizione === 'da_completare' && (
        <div className="bg-ember-500 px-[18px] py-4 flex flex-col gap-3">
          <p className="text-navy-900 text-sm font-bold">Iscrizione da completare</p>
          <Link
            href={iscrizioneId ? `/portale/iscrizioni/nuova?iscrizione=${iscrizioneId}` : "/portale/iscrizioni/nuova"}
            className="self-start inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white text-navy-900 hover:bg-white/90 transition-colors"
          >
            Completa iscrizione →
          </Link>
        </div>
      )}

      {statoIscrizione === 'non_iscritto' && (
        <div className="bg-sky-500 px-[18px] py-4 flex flex-col gap-3">
          <p className="text-white text-sm font-bold">Non iscritto al {anno}</p>
          <Link
            href={`/portale/iscrizioni/nuova?bambino=${bambino.id}`}
            className="self-start inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-sun-500 text-navy-900 hover:bg-sun-400 transition-colors shadow-sm"
          >
            Iscrivi ora →
          </Link>
        </div>
      )}
    </div>
  );
}
