import {
  getAllMaestriAttivi,
  getBambiniAttiviPerDisciplina,
} from "@/lib/airtable-portale";
import { requireAdmin } from "@/lib/auth-admin";
import FormLezione from "@/components/portale/lezioni/FormLezione";
import BackLink from "@/components/portale/BackLink";
import { actionCreateLezioneAdmin } from "../actions";

export const metadata = {
  title: "Registra lezione · Admin · Portale Triono Racing",
};

export default async function NuovaLezioneAdminPage() {
  await requireAdmin();

  const [maestri, bambini] = await Promise.all([
    getAllMaestriAttivi(),
    getBambiniAttiviPerDisciplina(),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <BackLink href="/portale/admin/lezioni" label="Torna alle lezioni" />
      <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
        Area Admin
      </p>
      <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1 mb-2">
        Registra una lezione
      </h1>
      <p className="text-ink-muted text-sm mb-8 max-w-[640px]">
        Registra una lezione tenuta dai maestri. Seleziona i maestri presenti:
        le presenze maestro verranno generate automaticamente.
      </p>

      <FormLezione
        action={actionCreateLezioneAdmin}
        maestri={maestri}
        bambini={bambini}
        currentMaestroId=""
        admin
        submitLabel="Salva lezione"
        cancelHref="/portale/admin/lezioni"
      />
    </div>
  );
}
