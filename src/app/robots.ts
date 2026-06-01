import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — permette crawl di tutto il sito pubblico, blocca esplicitamente
 * l'area riservata e le route interne di sviluppo.
 *
 * Nota: il dev playground /dev/components è bloccato perché non vogliamo che
 * Google indicizzi la pagina di showcase. Stesso per /portale/* che richiede auth.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portale/", "/area-riservata/", "/dev/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
