// Shim di `@clerk/nextjs`: nelle preview l'utente è sempre anonimo, così la
// NavBar mostra la CTA "Iscrivi tuo figlio" (lo stato che vede un visitatore).
export function useAuth() {
  return { isLoaded: true, isSignedIn: false, userId: null, sessionId: null, orgId: null };
}
export function useUser() { return { isLoaded: true, isSignedIn: false, user: null }; }
