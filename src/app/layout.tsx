import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { SITE_URL } from "@/lib/seo";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
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
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/portale"
      signUpFallbackRedirectUrl="/portale"
      localization={itIT}
    >
      <html
        lang="it"
        className={`${inter.variable} ${anton.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          {/* Google Consent Mode v2 — default DENIED prima di qualsiasi script Google (EVO-024) */}
          <Script id="consent-mode-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent','default',{
                ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
                analytics_storage:'denied', functionality_storage:'granted',
                personalization_storage:'denied', security_storage:'granted', wait_for_update:500
              });
            `}
          </Script>
          <ConsentProvider>{children}</ConsentProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
