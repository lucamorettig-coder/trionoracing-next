import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";
import ProfiloGenitoreForm from "@/components/portale/ProfiloGenitoreForm";

export default async function ProfiloPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Il tuo profilo</h1>
        <p className="text-ink-muted text-sm mt-1">Gestisci i tuoi dati e le impostazioni dell&apos;account.</p>
      </div>
      <ProfiloGenitoreForm genitore={genitore} />
    </div>
  );
}
