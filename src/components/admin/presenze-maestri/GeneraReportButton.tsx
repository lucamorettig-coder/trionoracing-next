"use client";

import * as React from "react";
import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneraReportButtonProps {
  mese: number;
  anno: number;
  /** false se il periodo filtrato non ha presenze — disabilita le voci per evitare di scaricare un PNG con dentro un errore JSON. */
  hasDati?: boolean;
}

export function GeneraReportButton({ mese, anno, hasDati = true }: GeneraReportButtonProps) {
  const hrefFor = (variante: "amministrazione" | "maestri") =>
    `/api/admin/report-presenze-maestri?mese=${mese}&anno=${anno}&variante=${variante}`;

  const filenameFor = (variante: "amministrazione" | "maestri") =>
    `presenze-maestri-${variante}-${anno}-${mese}.png`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md" disabled={!hasDati}>
          <Download size={16} aria-hidden />
          Genera report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="flex items-center gap-2">
          <a
            href={hrefFor("amministrazione")}
            download={filenameFor("amministrazione")}
            aria-label="Scarica report Amministrazione (PNG)"
          >
            <FileImage size={14} />
            Amministrazione
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="flex items-center gap-2">
          <a
            href={hrefFor("maestri")}
            download={filenameFor("maestri")}
            aria-label="Scarica report Maestri (PNG)"
          >
            <FileImage size={14} />
            Maestri
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
