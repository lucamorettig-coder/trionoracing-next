"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card — Triono Racing
 *
 * Variants:
 *  - default : sfondo bianco, border line, shadow-sm, hover shadow-md
 *  - feature : con immagine in cima (passare prop `image` e `imageAlt`)
 *  - accent  : sfondo navy-900 con pattern di brand, testo bianco
 */
const cardVariants = cva(
  "rounded-[var(--radius-xl)] transition-[box-shadow,transform] duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-white border border-line shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        feature:
          "bg-white border border-line shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] overflow-hidden",
        accent:
          "relative overflow-hidden text-white border-0 bg-navy-900",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  image?: string;
  imageAlt?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, image, imageAlt = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
        {variant === "feature" && image && (
          <div className="photo-house aspect-[16/10] bg-bg-muted">
            <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
          </div>
        )}
        {variant === "accent" ? (
          <>
            <div className="absolute inset-0 pattern-navy" aria-hidden />
            <div className="relative">{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { color?: "navy" | "sky" | "sun" | "grass" }
>(({ className, color = "navy", children, ...props }, ref) => {
  const palette: Record<string, string> = {
    navy: "bg-navy-50 text-navy-700",
    sky: "bg-sky-50 text-sky-700",
    sun: "bg-sun-50 text-sun-700",
    grass: "bg-grass-50 text-grass-700",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center mb-4",
        palette[color],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardIcon.displayName = "CardIcon";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 sm:p-7 pb-3", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-bold leading-tight tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardBody = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("mt-2 text-ink-muted text-sm leading-relaxed", className)} {...props} />
));
CardBody.displayName = "CardBody";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 sm:p-7", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 sm:p-7 pt-0 flex items-center gap-3", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
