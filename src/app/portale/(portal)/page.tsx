import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";

export default async function PortalePage() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.role as string) ?? "GENITORE";

  if (role === "ADMIN") {
    redirect("/portale/admin");
  }

  const user = await currentUser();

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <SectionHeader
        eyebrow="Portale Triono Racing"
        title={
          user?.firstName
            ? `Ciao, ${user.firstName}! Il portale sta arrivando.`
            : "Il portale sta arrivando."
        }
        subtitle="Le funzionalità sono in costruzione. Torna presto."
      />
      <div className="mt-6">
        <Badge variant="warning">In costruzione</Badge>
      </div>
    </div>
  );
}
