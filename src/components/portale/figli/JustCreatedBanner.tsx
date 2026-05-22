"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
  nomeBambino: string;
  bambinoId: string;
}

export default function JustCreatedBanner({ nomeBambino, bambinoId }: Props) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-4">
      <div className="flex items-start gap-3 bg-grass-50 border border-grass-200 rounded-[var(--radius-lg)] px-4 py-3">
        <CheckCircle className="w-5 h-5 text-grass-600 shrink-0 mt-0.5" />
        <p className="text-sm text-grass-700">
          <span className="font-semibold">Hai aggiunto {nomeBambino}.</span>{" "}
          Ora carica{" "}
          <Link href={`/portale/figli/${bambinoId}#certificato`} className="underline font-semibold">
            certificato medico
          </Link>{" "}
          e{" "}
          <Link href={`/portale/figli/${bambinoId}#foto`} className="underline font-semibold">
            foto
          </Link>{" "}
          per poterlo iscrivere ai corsi.
        </p>
      </div>
    </div>
  );
}
