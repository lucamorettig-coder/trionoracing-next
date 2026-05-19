"use client";

import * as React from "react";

/**
 * Icons custom Triono Racing
 *
 * 5 icone disegnate sulla stessa griglia 24×24 di Lucide, stroke 1.75, currentColor.
 * Il file re-esporta anche le icone Lucide più usate, così l'import resta unico.
 *
 *   import { WheelIcon, HelmetIcon, ArrowRight, MapPin } from "@/components/ui/icons";
 */

type IconProps = React.SVGProps<SVGSVGElement> & {
  /** size in px — applicato a width/height. Default: 24 */
  size?: number | string;
  /** stroke width (default 1.75) */
  strokeWidth?: number;
};

function withIcon(displayName: string, Body: React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 1.75, className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
        {...props}
      >
        {Body}
      </svg>
    )
  );
  Icon.displayName = displayName;
  return Icon;
}

/* Wheel — eventi MTB, percorsi */
export const WheelIcon = withIcon(
  "WheelIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 3v6 M12 15v6 M3 12h6 M15 12h6 M5.6 5.6l4.2 4.2 M14.2 14.2l4.2 4.2 M5.6 18.4l4.2-4.2 M14.2 9.8l4.2-4.2" />
  </>
);

/* Helmet — sicurezza, Scuola */
export const HelmetIcon = withIcon(
  "HelmetIcon",
  <>
    <path d="M3 13.5a9 9 0 0 1 18 0v2H3z" />
    <path d="M3 15.5h18" />
    <path d="M7 7l1.5 4 M12 5v5 M17 7l-1.5 4" />
  </>
);

/* Mountain — Marathon, off-road */
export const MountainIcon = withIcon(
  "MountainIcon",
  <>
    <path d="M2 19l6.5-10L13 16l3-4 6 7z" />
    <path d="M8.5 9l1 1.5" />
  </>
);

/* Bike — override Lucide bike con telaio MTB */
export const BikeIcon = withIcon(
  "BikeIcon",
  <>
    <circle cx="5" cy="17" r="3.2" />
    <circle cx="19" cy="17" r="3.2" />
    <path d="M5 17L10 9H14L17 14 M14 9L17 9 M10 9L8 6H6" />
  </>
);

/* Medal — risultati, podio, palmarès */
export const MedalIcon = withIcon(
  "MedalIcon",
  <>
    <path d="M8 2L12 9L16 2" />
    <circle cx="12" cy="15" r="6" />
    <path d="M10 13.5L11.5 15L14 12.5" />
  </>
);

/* Re-export selettivo di Lucide più usate (puoi importare le altre direttamente da "lucide-react") */
export {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  Mail,
  Download,
  Menu,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
