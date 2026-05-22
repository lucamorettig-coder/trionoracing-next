import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AggiungiFiglioForm from "@/components/portale/figli/AggiungiFiglioForm";

export default function NuovoFiglioPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="mb-6">
        <Link
          href="/portale/figli"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          I miei figli
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-ink mb-8">Aggiungi figlio</h1>
      <AggiungiFiglioForm mode="create" />
    </div>
  );
}
