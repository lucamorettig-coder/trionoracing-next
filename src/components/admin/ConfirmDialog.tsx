"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "warning" | "destructive";
  motivoLabel?: string;
  motivoPlaceholder?: string;
  motivoRequired?: boolean;
  onConfirm: (motivo?: string) => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  variant = "default",
  motivoLabel,
  motivoPlaceholder,
  motivoRequired = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [motivo, setMotivo] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMotivo("");
      setLoading(false);
    }
    onOpenChange(next);
  };

  const canConfirm = !motivoRequired || motivo.trim().length > 0;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm(motivoLabel ? motivo.trim() : undefined);
      handleOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const buttonVariant =
    variant === "destructive" ? "destructive" : variant === "warning" ? "primary" : "primary";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent variant={variant}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {motivoLabel && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">
              {motivoLabel}
              {motivoRequired && <span className="text-flag-500"> *</span>}
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={motivoPlaceholder}
              rows={3}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-line bg-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 resize-y"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" size="md" disabled={loading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={(e) => e.preventDefault()}>
            <Button
              variant={buttonVariant}
              size="md"
              loading={loading}
              disabled={!canConfirm || loading}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
