"use client";

import * as React from "react";
import { ShieldCheck, FileSignature, FileText, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModulisticaStatus = "ok" | "manca" | "pending";

export interface ModulisticaIconsProps {
  privacy: ModulisticaStatus;
  regolamento: ModulisticaStatus;
  moduloTriono: ModulisticaStatus;
  moduloFCI: ModulisticaStatus;
  size?: "xs" | "sm";
}

const TONE: Record<ModulisticaStatus, string> = {
  ok: "text-grass-500",
  manca: "text-flag-500",
  pending: "text-ember-500",
};

const LABEL: Record<ModulisticaStatus, string> = {
  ok: "firmato/approvato",
  manca: "mancante",
  pending: "in attesa",
};

const ICONS = [
  { key: "privacy", Icon: ShieldCheck, label: "Privacy minore" },
  { key: "regolamento", Icon: FileSignature, label: "Regolamento" },
  { key: "moduloTriono", Icon: FileText, label: "Modulo Triono" },
  { key: "moduloFCI", Icon: Award, label: "Modulo FCI" },
] as const;

export function ModulisticaIcons({
  privacy,
  regolamento,
  moduloTriono,
  moduloFCI,
  size = "xs",
}: ModulisticaIconsProps) {
  const values = { privacy, regolamento, moduloTriono, moduloFCI };
  const sizePx = size === "xs" ? 12 : 14;

  return (
    <div className="inline-flex gap-1" role="group" aria-label="Stato modulistica">
      {ICONS.map(({ key, Icon, label }) => {
        const status = values[key];
        const title = `${label}: ${LABEL[status]}`;
        return (
          <Icon
            key={key}
            size={sizePx}
            className={cn(TONE[status])}
            aria-label={title}
          />
        );
      })}
    </div>
  );
}

export function getModulisticaState(fields: {
  PRIVACY_MINORE?: boolean;
  FLAG_REGOLAMENTO?: boolean;
  MODULO_TRIONO_STATO?: string;
  MODULO_FCI_STATO?: string;
}): ModulisticaIconsProps {
  return {
    privacy: fields.PRIVACY_MINORE ? "ok" : "manca",
    regolamento: fields.FLAG_REGOLAMENTO ? "ok" : "manca",
    moduloTriono:
      fields.MODULO_TRIONO_STATO === "approvato"
        ? "ok"
        : fields.MODULO_TRIONO_STATO === "in_revisione"
          ? "pending"
          : "manca",
    moduloFCI:
      fields.MODULO_FCI_STATO === "approvato"
        ? "ok"
        : fields.MODULO_FCI_STATO === "in_revisione"
          ? "pending"
          : "manca",
  };
}
