"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form primitives — Triono Racing
 *
 * Esporta: FormField, Label, Input, Textarea, Select, Checkbox, Radio,
 * FormHelper, FormError. Composabili in pieno shadcn style.
 */

/* -------------------- FormField wrapper -------------------- */
export const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
));
FormField.displayName = "FormField";

/* -------------------- Label -------------------- */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[13px] font-semibold text-ink",
      "peer-disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-flag-500 ml-0.5">*</span>}
  </label>
));
Label.displayName = "Label";

/* -------------------- Input -------------------- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "w-full h-11 px-3.5 rounded-[var(--radius-md)] bg-white",
        "border-[1.5px] border-line text-ink placeholder:text-ink-muted",
        "text-[15px] leading-none",
        "transition-[border-color,box-shadow] duration-150",
        "focus:outline-none focus:border-navy-700 focus:ring-4 focus:ring-navy-700/15",
        "disabled:bg-bg-muted disabled:text-ink-muted disabled:cursor-not-allowed",
        error && "border-flag-500 focus:border-flag-500 focus:ring-flag-500/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

/* -------------------- Textarea -------------------- */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "w-full min-h-[96px] px-3.5 py-3 rounded-[var(--radius-md)] bg-white",
        "border-[1.5px] border-line text-ink placeholder:text-ink-muted",
        "text-[15px] leading-relaxed resize-y",
        "transition-[border-color,box-shadow] duration-150",
        "focus:outline-none focus:border-navy-700 focus:ring-4 focus:ring-navy-700/15",
        "disabled:bg-bg-muted disabled:text-ink-muted disabled:cursor-not-allowed",
        error && "border-flag-500 focus:border-flag-500 focus:ring-flag-500/15",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

/* -------------------- Select (nativo, stylato) -------------------- */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "w-full h-11 pl-3.5 pr-10 rounded-[var(--radius-md)] bg-white appearance-none",
          "border-[1.5px] border-line text-ink",
          "text-[15px] leading-none",
          "transition-[border-color,box-shadow] duration-150",
          "focus:outline-none focus:border-navy-700 focus:ring-4 focus:ring-navy-700/15",
          "disabled:bg-bg-muted disabled:text-ink-muted disabled:cursor-not-allowed",
          error && "border-flag-500 focus:border-flag-500 focus:ring-flag-500/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
);
Select.displayName = "Select";

/* -------------------- Checkbox -------------------- */
export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "w-4 h-4 rounded-[var(--radius-xs)] accent-navy-700 cursor-pointer",
      "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-700/40",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

/* -------------------- Radio -------------------- */
export const Radio = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="radio"
    className={cn(
      "w-4 h-4 accent-navy-700 cursor-pointer",
      "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-700/40",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Radio.displayName = "Radio";

/* -------------------- Helpers -------------------- */
export function FormHelper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs text-ink-muted", className)}>{children}</p>;
}

export function FormError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn("text-xs text-flag-500 flex items-center gap-1.5", className)}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* Example usage

<FormField>
  <Label htmlFor="email" required>Email genitore</Label>
  <Input id="email" type="email" error={!!errors.email} />
  {errors.email
    ? <FormError>{errors.email}</FormError>
    : <FormHelper>La useremo solo per comunicazioni iscrizione.</FormHelper>}
</FormField>

*/
