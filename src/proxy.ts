/**
 * Next.js 16 proxy (ex-middleware.ts pre-Next 16).
 * Convenzione `middleware.<ext>` deprecata: rinominata in `proxy.<ext>`.
 *
 * Il nome funzione `clerkMiddleware` esportato da @clerk/nextjs/server resta
 * invariato — Clerk non ha (ancora) un alias `clerkProxy`. Il fatto che la
 * funzione si chiami "Middleware" è solo nome storico Clerk, non c'entra con
 * la convenzione Next.
 *
 * RUOLO: letto da sessionClaims?.role (richiede JWT template configurato
 * in Clerk Dashboard → Configure → Sessions → Customize session token).
 * Fallback se role undefined: tratta come 'GENITORE' (sicuro).
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

// Host canonico del sito (derivato da SITE_URL → single source of truth, EVO-031).
const CANONICAL_HOST = new URL(SITE_URL).host;

// Route portale pubbliche (no auth richiesta)
const isPortalePublic = createRouteMatcher([
  "/portale/login(.*)",
  "/portale/registrati(.*)",
  "/portale/recupero-password(.*)",
]);

// Tutte le route portale (incluse quelle pubbliche — filtro sopra)
const isPortaleProtected = createRouteMatcher(["/portale(.*)"]);

// Route solo per ADMIN
const isAdminOnly = createRouteMatcher(["/portale/admin(.*)"]);

// Route per ISTRUTTORE o ADMIN
const isIstruttoreOrAdmin = createRouteMatcher([
  "/portale/lezioni(.*)",
  "/portale/gare-assegnate(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // EVO-031 (D-27): de-indicizzazione *.vercel.app. Tutti gli host di PRODUZIONE
  // che finiscono in .vercel.app (alias principale + alias progetto/team +
  // *-git-main-*) fanno 308 → dominio canonico, preservando path e query, così
  // escono dall'indice Google e consolidano la SEO sul dominio.
  // Solo in production (VERCEL_ENV === "production"): i deploy di PREVIEW
  // (VERCEL_ENV === "preview") restano navigabili per i test, non redirezionati.
  const host = req.headers.get("host") ?? "";
  if (
    process.env.VERCEL_ENV === "production" &&
    host.endsWith(".vercel.app") &&
    host !== CANONICAL_HOST
  ) {
    const url = new URL(req.url);
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // Pagine auth: lascia passare senza protezione
  if (isPortalePublic(req)) return;

  if (isPortaleProtected(req)) {
    // Redirect a sign-in se non autenticato
    await auth.protect();

    // Leggi il ruolo dal JWT (richiede JWT template configurato)
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.role as string) ?? "GENITORE";

    // Guard admin: solo ADMIN può accedere a /portale/admin/*
    if (isAdminOnly(req) && role !== "ADMIN") {
      return Response.redirect(new URL("/portale", req.url));
    }

    // Guard istruttore: solo ISTRUTTORE o ADMIN per lezioni/gare-assegnate
    if (
      isIstruttoreOrAdmin(req) &&
      role !== "ISTRUTTORE" &&
      role !== "ADMIN"
    ) {
      return Response.redirect(new URL("/portale", req.url));
    }
  }
});

export const config = {
  matcher: [
    /*
     * Match tutte le route ECCETTO:
     * - _next (asset Next)
     * - file con estensioni statiche (html, css, js, immagini, font, document,
     *   archivi, manifest, xml, txt)
     *   xml e txt aggiunti per non intercettare /sitemap.xml e /robots.txt
     *   (D-23: bot detection Clerk funziona per UA, ma evitare overhead inutile)
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
