"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  anni: number[];
  annoCorrente: number;
}

export function TariffeYearSelector({ anni, annoCorrente }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setAnno = (anno: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("anno", String(anno));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-bg-soft border border-line rounded-[var(--radius-md)]">
      {anni.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => setAnno(a)}
          className={cn(
            "h-8 px-3 text-[13px] font-semibold font-mono rounded-[var(--radius-sm)] transition-colors",
            a === annoCorrente
              ? "bg-navy-700 text-white"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
