"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportCSVButtonProps {
  entity: string;
  filters?: Record<string, unknown>;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ExportCSVButton({
  entity,
  filters,
  label = "Esporta CSV",
  disabled,
  size = "md",
}: ExportCSVButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/csv/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: filters ?? {} }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        alert(errBody.error ?? `Export ${entity} non disponibile (${res.status}).`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `${entity}-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Errore di rete: ${err instanceof Error ? err.message : "sconosciuto"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleExport}
      loading={loading}
      disabled={disabled}
    >
      <Download size={16} aria-hidden />
      {label}
    </Button>
  );
}
