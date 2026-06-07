import {
  getAllMaestriAttivi,
  getBambiniAttiviPerDisciplina,
  getAllGareForSelector,
} from "@/lib/airtable-portale";
import { requireAdmin } from "@/lib/auth-admin";
import FormCaricaPresenza from "@/components/portale/presenze/FormCaricaPresenza";
import BackLink from "@/components/portale/BackLink";
import { actionCreateLezioneAdmin } from "../actions";

export const metadata = {
  title: "Carica presenza · Admin · Portale Triono Racing",
};

export default async function NuovaPresenzaAdminPage() {
  await requireAdmin();

  const [maestri, bambini, gare] = await Promise.all([
    getAllMaestriAttivi(),
    getBambiniAttiviPerDisciplina(),
    getAllGareForSelector(),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <BackLink href="/portale/admin/lezioni" label="Torna alle lezioni" />
      <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
        Area Admin
      </p>
      <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1 mb-2">
        Carica presenza
      </h1>
      <p className="text-ink-muted text-sm mb-8 max-w-[640px]">
        Registra una lezione o la presenza a una gara. Le presenze maestro
        vengono scritte sulla tabella presenze con il rimborso corretto.
      </p>

      <FormCaricaPresenza
        action={actionCreateLezioneAdmin}
        maestri={maestri}
        bambini={bambini}
        gare={gare}
        currentMaestroId=""
        admin
        cancelHref="/portale/admin/lezioni"
      />
    </div>
  );
}
