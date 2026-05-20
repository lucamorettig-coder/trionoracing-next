import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap statico delle pagine pubbliche.
 * Quando le news torneranno o si aggiungeranno route dinamiche, aggiungere qui.
 *
 * priority è relativo (max 1.0). Convenzione adottata:
 * - Home + La Scuola = 1.0 (conversion-critical)
 * - Marathon 209 = 0.9 (evento, alto interesse stagionale)
 * - Chi siamo / Amatori = 0.7
 * - Contatti = 0.6
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/la-scuola", priority: 1.0, changeFrequency: "monthly" },
    { path: "/marathon-209", priority: 0.9, changeFrequency: "weekly" },
    { path: "/chi-siamo", priority: 0.7, changeFrequency: "yearly" },
    { path: "/gli-amatori-triono", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contatti", priority: 0.6, changeFrequency: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
