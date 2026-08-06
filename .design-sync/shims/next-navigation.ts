// Shim di `next/navigation`: nelle preview siamo sempre sulla home pubblica,
// mai su /portale — così i componenti theme-aware per path (es. CookieBanner)
// rendono nella livrea APEX scura, che è quella del sito pubblico.
export function usePathname() { return "/"; }
export function useSearchParams() { return new URLSearchParams(); }
export function useRouter() {
  const noop = () => {};
  return { push: noop, replace: noop, back: noop, forward: noop, refresh: noop, prefetch: noop };
}
export function useParams() { return {}; }
export function redirect(_u: string) {}
export function notFound() {}
