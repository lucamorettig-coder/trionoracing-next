import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

export default async function PagamentiAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") redirect("/portale");

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader eyebrow="Area Admin" title="Pagamenti" subtitle="Disponibile a breve." />
      <div className="mt-6">
        <Badge variant="warning">In costruzione (EVO-018)</Badge>
      </div>
    </div>
  );
}
