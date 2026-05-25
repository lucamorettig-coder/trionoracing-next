"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ICON_TONE = {
  navy: "bg-navy-50 text-navy-700",
  grass: "bg-grass-100 text-grass-700",
  ember: "bg-ember-100 text-ember-700",
  sky: "bg-sky-100 text-sky-700",
  flag: "bg-flag-50 text-flag-700",
} as const;

const SUBMIT_CLASS = {
  primary: undefined,
  destructive: "destructive" as const,
  success: "bg-grass-600 hover:bg-grass-700 border-grass-600 hover:border-grass-700 text-white border-[1.5px]",
} as const;

export interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: keyof typeof ICON_TONE;
  size?: "sm" | "md" | "lg";
  submitLabel?: string;
  submitVariant?: keyof typeof SUBMIT_CLASS;
  submitIcon?: React.ReactNode;
  cancelLabel?: string;
  footerHint?: React.ReactNode;
  loading?: boolean;
  onSubmit?: () => Promise<void>;
  children: React.ReactNode;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconTone = "navy",
  size = "md",
  submitLabel = "Conferma",
  submitVariant = "primary",
  submitIcon,
  cancelLabel = "Annulla",
  footerHint,
  loading = false,
  onSubmit,
  children,
}: AdminFormDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = loading || internalLoading;

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) return;
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSubmit) return;
    setInternalLoading(true);
    try {
      await onSubmit();
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  const submitBtnVariant = submitVariant === "destructive" ? "destructive" : "primary";
  const submitBtnClass =
    typeof SUBMIT_CLASS[submitVariant] === "string"
      ? (SUBMIT_CLASS[submitVariant] as string)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size={size} showClose={false} className="p-0 overflow-hidden flex flex-col max-h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-line">
          {icon && (
            <div
              className={cn(
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                ICON_TONE[iconTone],
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0 pr-6">
            <DialogTitle className="text-base font-bold text-ink leading-tight">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-[12.5px] text-ink-muted mt-0.5 leading-snug">
                {description}
              </DialogDescription>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="shrink-0 absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-ink-muted hover:text-ink hover:bg-bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700/30"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body + Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className={cn("flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4", isLoading && "pointer-events-none opacity-60")}>
            {children}
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-line bg-bg-soft">
            {footerHint ? (
              <p className="text-[11.5px] text-ink-muted leading-snug">{footerHint}</p>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                variant={submitBtnVariant}
                size="sm"
                className={submitBtnClass}
                loading={isLoading}
              >
                {submitIcon}
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
