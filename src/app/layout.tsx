import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Display font usato dal theme ospite Marathon 209 (.theme-209)
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Triono Racing",
    template: "%s · Triono Racing",
  },
  description:
    "ASD CIEMME · Triono Racing — Scuola di ciclismo, squadra amatori, eventi MTB.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/" localization={itIT}>
      <html
        lang="it"
        className={`${inter.variable} ${anton.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
