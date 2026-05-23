import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

export default async function AdminPage() {
  // Defense in depth: il middleware controlla sessionClaims.role dal JWT
  // (può essere stantio dopo che il sync layout aggiorna publicMetadata).
  // Qui verifichiamo il RUOLO autoritativo da Airtable.
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") {
    redirect("/portale");
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <SectionHeader
        eyebrow="Area Admin"
        title="Dashboard Admin"
        subtitle="In costruzione — EVO-007."
      />
      <div className="mt-6">
        <Badge variant="warning">In costruzione (EVO-007)</Badge>
      </div>
    </div>
  );
}
