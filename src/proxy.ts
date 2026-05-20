/**
 * Next.js 16 proxy (ex-middleware.ts pre-Next 16).
 * Convenzione `middleware.<ext>` deprecata: rinominata in `proxy.<ext>`.
 *
 * Il nome funzione `clerkMiddleware` esportato da @clerk/nextjs/server resta
 * invariato — Clerk non ha (ancora) un alias `clerkProxy`. Il fatto che la
 * funzione si chiami "Middleware" è solo nome storico Clerk, non c'entra con
 * la convenzione Next.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/portale/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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
