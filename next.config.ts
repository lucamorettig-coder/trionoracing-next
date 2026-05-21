import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Attachment Airtable (URL temporanee con scadenza ~poche ore)
    // usate dalla pagina /marathon-209 con ISR 60s per ottenere URL fresche.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
