import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";

export default function AdminPage() {
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
