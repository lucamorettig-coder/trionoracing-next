import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permette di testare il dev server da dispositivi sulla LAN
  // (es. iPhone su 192.168.x.x). Senza questo, HMR + chunk React
  // vengono bloccati cross-origin → la pagina renderizza ma non si idrata.
  allowedDevOrigins: ["192.168.1.228", "192.168.*.*", "10.*.*.*"],
  images: {
    // Attachment Airtable (URL temporanee con scadenza ~poche ore)
    // usate dalla pagina /marathon-209 con ISR 60s per ottenere URL fresche.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/duezeronove/**",
      },
    ],
  },
};

export default nextConfig;
