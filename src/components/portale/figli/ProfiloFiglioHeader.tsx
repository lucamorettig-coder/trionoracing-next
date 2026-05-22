import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calcCategoriaFCI, type Bambino } from "@/lib/airtable-portale";
import { diffInYears, certBadgeVariant } from "@/lib/portale-utils";

interface Props {
  bambino: Bambino;
  hasCert: boolean;
  hasFoto: boolean;
}

export default function ProfiloFiglioHeader({ bambino, hasCert, hasFoto }: Props) {
  const { fields } = bambino;
  const nome = fields.NOME_BAMBINO ?? "";
  const cognome = fields.COGNOME_BAMBINO ?? "";
  const eta = fields.DATA_NASCITA_BAMBINO ? diffInYears(fields.DATA_NASCITA_BAMBINO) : null;
  const categoria = fields.DATA_NASCITA_BAMBINO ? calcCategoriaFCI(fields.DATA_NASCITA_BAMBINO) : null;
  const fotoUrl = fields.FOTO_BAMBINO?.[0]?.thumbnails?.large?.url ?? fields.FOTO_BAMBINO?.[0]?.url;
  const { variant: certVariant, label: certLabel } = certBadgeVariant(
    fields.CERTIFICATO_MEDICO_STATO,
    fields.CERTIFICATO_MEDICO_SCADENZA,
  );
  const initials = `${nome[0] ?? ""}${cognome[0] ?? ""}`.toUpperCase();
  const canIscrivi = hasCert && hasFoto;

  return (
    <div className="bg-white border-b border-line sticky top-0 z-30 shadow-[var(--shadow-xs)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto di ${nome}`}
              className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-line"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center shrink-0 border-2 border-line">
              <span className="text-white font-bold text-xl">{initials}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-ink leading-tight truncate">
              {nome} {cognome}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {eta !== null && (
                <span className="text-sm text-ink-muted">{eta} {eta === 1 ? "anno" : "anni"}</span>
              )}
              {categoria && (
                <Badge variant="sun" size="sm">{categoria}</Badge>
              )}
              <Badge variant={certVariant} size="sm">{certLabel}</Badge>
            </div>
          </div>

          {/* CTA desktop */}
          <div className="hidden sm:block shrink-0">
            {canIscrivi ? (
              <Button asChild variant="primary" size="sm">
                <Link href={`/portale/iscrizioni/nuova?bambino=${bambino.id}`}>
                  Iscrivi ai corsi
                </Link>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled
                title="Per iscriverlo serve certificato medico valido e foto"
              >
                Iscrivi ai corsi
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
