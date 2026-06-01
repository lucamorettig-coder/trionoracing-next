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
  // Redirect dai vecchi URL dell'area riservata legacy (Astro su Cloudflare,
  // path /area-riservata) ai nuovi del portale (/portale). Al cutover il dominio
  // punterà a questa app Vercel: senza questi redirect i link salvati dai genitori
  // (es. /area-riservata/dashboard) farebbero 404. Girano nel routing layer PRIMA
  // del middleware Clerk → la destinazione /portale/* passa poi dalla normale auth.
  // L'ORDINE conta: in Next.js vince la prima regola che matcha, quindi i path
  // rinominati/speciali vanno PRIMA del catch-all finale.
  async redirects() {
    return [
      // --- Path rinominati / speciali (DEVONO precedere il catch-all) ---
      // bambini → figli: :id/modifica prima di aggiungi (letterale) prima di :id,
      // così "aggiungi" non viene catturato dal segmento dinamico :id.
      {
        source: "/area-riservata/bambini/:id/modifica",
        destination: "/portale/figli/:id/modifica",
        permanent: true,
      },
      {
        source: "/area-riservata/bambini/aggiungi",
        destination: "/portale/figli/nuovo",
        permanent: true,
      },
      {
        source: "/area-riservata/bambini/:id",
        destination: "/portale/figli/:id",
        permanent: true,
      },
      {
        source: "/area-riservata/registrazione",
        destination: "/portale/registrati",
        permanent: true,
      },
      {
        source: "/area-riservata/modifica-profilo",
        destination: "/portale/profilo",
        permanent: true,
      },
      {
        source: "/area-riservata/dashboard",
        destination: "/portale",
        permanent: true,
      },
      {
        source: "/area-riservata/checkout",
        destination: "/portale/pagamenti",
        permanent: true,
      },
      // Reset password ora è gestito dal flow Clerk (nessuna pagina dedicata).
      {
        source: "/area-riservata/reset-password",
        destination: "/portale/login",
        permanent: true,
      },
      // Presenze maestro: semantica cambiata → landing sul portale (instradato per ruolo).
      {
        source: "/area-riservata/presenze/:path*",
        destination: "/portale",
        permanent: true,
      },
      {
        source: "/area-riservata",
        destination: "/portale",
        permanent: true,
      },
      // --- Catch-all: tutti i path con nome invariato (login, iscrizioni/*, admin*, ...) ---
      {
        source: "/area-riservata/:path*",
        destination: "/portale/:path*",
        permanent: true,
      },
      // --- Rete di sicurezza per la generazione ancora precedente (/area-riservata-triono).
      // I path di quella versione possono differire da quelli attuali, quindi non li mappiamo
      // 1:1: atterriamo tutto sulla home del portale (instradata per ruolo). Prefisso distinto
      // → nessuna collisione con le regole /area-riservata sopra. ---
      {
        source: "/area-riservata-triono/:path*",
        destination: "/portale",
        permanent: true,
      },
      {
        source: "/area-riservata-triono",
        destination: "/portale",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
