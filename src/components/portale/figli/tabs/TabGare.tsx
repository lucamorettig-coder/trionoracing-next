import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Props {
  bambinoNome: string;
}

export default function TabGare({ bambinoNome }: Props) {
  return (
    <div className="max-w-2xl">
      <div className="text-center py-16 bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-50 mb-4">
          <Trophy className="w-7 h-7 text-navy-700" />
        </div>
        <p className="text-ink font-semibold mb-1">Nessuna gara richiesta</p>
        <p className="text-ink-muted text-sm mb-5">
          Non ci sono gare richieste per {bambinoNome}. Vedi il calendario per i prossimi eventi.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/portale/gare">Vedi calendario gare</Link>
        </Button>
      </div>
    </div>
  );
}
