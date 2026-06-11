"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button — Triono Racing
 *
 * Variante A (default): rounded-lg, geometria coerente con card e input.
 *   Per l'energia "racing" usare variant="hero" che adotta il pill-style.
 *
 * Variants: primary | secondary | outline | ghost | link | destructive | hero
 * Sizes:    sm | md | lg | icon
 */
const buttonVariants = cva(
  // Base
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold leading-none select-none",
    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-700/20",
    "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-navy-700 text-white border-[1.5px] border-navy-700 hover:bg-navy-900 hover:border-navy-900 hover:shadow-[0_2px_6px_rgba(20,25,58,0.10)]",
        secondary:
          "bg-sky-500 text-white border-[1.5px] border-sky-500 hover:bg-sky-600 hover:border-sky-600",
        outline:
          "bg-transparent text-navy-700 border-[1.5px] border-navy-200 hover:border-navy-700 hover:bg-navy-50",
        ghost:
          "bg-transparent text-navy-700 border-[1.5px] border-transparent hover:bg-navy-50",
        link:
          "bg-transparent text-sky-600 border-0 rounded-none px-0 py-1 border-b-[1.5px] border-sky-600/60 hover:text-navy-700 hover:border-navy-700",
        destructive:
          "bg-flag-500 text-white border-[1.5px] border-flag-500 hover:bg-flag-600 hover:border-flag-600",
        // Variant B — pill / racing
        hero:
          "bg-navy-900 text-white border-[1.5px] border-navy-900 rounded-full font-bold tracking-[0.01em] hover:bg-navy-700 hover:border-navy-700 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(20,25,58,0.10)]",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] rounded-[var(--radius-md)]",
        md: "h-11 px-5 text-[15px] rounded-[var(--radius-lg)]",
        lg: "h-13 px-7 text-[17px] rounded-[var(--radius-lg)] py-4",
        icon: "h-11 w-11 p-0 rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
    compoundVariants: [
      // hero variant always uses pill rounding
      { variant: "hero", size: "sm", className: "rounded-full" },
      { variant: "hero", size: "md", className: "rounded-full" },
      { variant: "hero", size: "lg", className: "rounded-full" },
    ],
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
