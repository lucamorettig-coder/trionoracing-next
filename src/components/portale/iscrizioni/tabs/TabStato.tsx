"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";

type TabKey = "stato" | "modulistica" | "taglie" | "pagamenti";

interface Props {
  iscrizione: Iscrizione;
  titoli: TitoloPagamento[];
  onJump: (tab: TabKey) => void;
}

interface ChecklistItem {
  label: string;
  done: boolean;
  cta?: { label: string; onClick: () => void } | { label: string; href: string };
}

export default function TabStato({ iscrizione, titoli, onJump }: Props) {
  const f = iscrizione.fields;
  const primaRata = titoli.find((t) => t.fields.NUMERO_RATA === 1);
  const primaRataPagata =
    primaRata?.fields.STATO_TITOLO === "pagato" || f.PRIMA_RATA_PAGATA === true;

  const items: ChecklistItem[] = [
    { label: "Dati del bambino confermati", done: true },
    {
      label: "Privacy minore firmata",
      done: !!f.PRIVACY_MINORE,
      cta: !f.PRIVACY_MINORE ? { label: "Firma", onClick: () => onJump("modulistica") } : undefined,
    },
    {
      label: "Regolamento firmato e caricato",
      done: !!f.FLAG_REGOLAMENTO && !!f.REGOLAMENTO_FIRMATO?.length,
      cta:
        !f.FLAG_REGOLAMENTO || !f.REGOLAMENTO_FIRMATO?.length
          ? { label: "Vai a modulistica", onClick: () => onJump("modulistica") }
          : undefined,
    },
    {
      label: "Taglie kit indicate (opzionale)",
      done: !!f.TAGLIE_KIT_CONFERMATE,
      cta: !f.TAGLIE_KIT_CONFERMATE
        ? { label: "Indica taglie", onClick: () => onJump("taglie") }
        : undefined,
    },
    {
      label: "Prima rata pagata",
      done: !!primaRataPagata,
      cta:
        !primaRataPagata && primaRata
          ? { label: "Paga ora", href: `/portale/iscrizioni/${iscrizione.id}/checkout?titolo=${primaRata.id}` }
          : undefined,
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const progress = Math.round((completed / items.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-ink">Completamento</span>
          <span className="text-sm font-bold text-navy-700">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3 p-4 bg-white border border-line rounded-[var(--radius-lg)]"
          >
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-grass-700 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-ink-muted shrink-0" />
            )}
            <span className={`flex-1 ${item.done ? "text-ink" : "text-ink"}`}>{item.label}</span>
            {item.cta && (
              "href" in item.cta ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={item.cta.href}>{item.cta.label}</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={item.cta.onClick}>
                  {item.cta.label}
                </Button>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
