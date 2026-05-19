"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — Triono Racing
 *
 * Variants: default | neutral | success | warning | error | info | sun
 * Sizes:    sm | md
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold leading-tight rounded-[var(--radius-sm)] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-navy-50 text-navy-700",
        neutral: "bg-bg-muted text-ink",
        success: "bg-grass-100 text-grass-700",
        warning: "bg-ember-100 text-ember-700",
        error: "bg-flag-100 text-flag-700",
        info: "bg-sky-100 text-sky-700",
        sun: "bg-sun-100 text-sun-700",
      },
      size: {
        sm: "px-2.5 py-1 text-[12px] [&_svg]:w-3 [&_svg]:h-3",
        md: "px-3 py-1.5 text-[13px] [&_svg]:w-3.5 [&_svg]:h-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { badgeVariants };

/* Esempio
<Badge variant="success" size="md">Certificato OK</Badge>
<Badge variant="warning"><AlertTriangle/> In scadenza</Badge>
*/
