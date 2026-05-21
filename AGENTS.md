<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Portale — Pattern e convenzioni (F3)

### Client Airtable portale
- File: `src/lib/airtable-portale.ts` (separato da `airtable-209.ts`)
- Pattern: fetch REST API Airtable, nessun SDK. Env: `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN`.
- Tabella principale: `TABELLA_GENITORI` (field names in MAIUSCOLO_UNDERSCORE).
- Usa sempre `stripReadOnlyFields()` prima di ogni write Airtable (evita 422 su campi formula/lookup).
- Espandi questo file in future EVO aggiungendo funzioni per nuove tabelle.

### Webhook Clerk
- File: `src/app/api/clerk/webhook/route.ts`
- Runtime: nodejs (non Edge) — richiesto da svix.
- Pattern verifica: `new Webhook(secret).verify(rawBody, headers)`
- `user.created`: crea/aggiorna record TABELLA_GENITORI + setta `publicMetadata.role` via clerkClient.

### Middleware (proxy.ts)
- Protegge `/portale/*` eccetto `/portale/login` e `/portale/registrati`.
- RUOLO letto da `auth.sessionClaims?.role` (configurato nel JWT template Clerk Dashboard).
- Fallback se role undefined: tratta come 'GENITORE'.
- Guard admin: `/portale/admin/*` → solo ADMIN. Guard istruttore: `/portale/lezioni/*`, `/portale/gare-assegnate/*` → ISTRUTTORE + ADMIN.

### NavBar portale
- Componente: `src/components/portale/PortaleNavBar.tsx` (Server Component)
- NavLinks: `src/components/portale/NavLinks.tsx` (Client Component — usePathname per active state)
- MobileMenu: `src/components/portale/MobileMenu.tsx` (Client Component — hamburger + dropdown fixed)
- Ruolo letto da `auth()` server-side — mai dal client.
- Link mostrati variano per GENITORE / ISTRUTTORE / ADMIN.

### Struttura route portale
- `src/app/portale/(portal)/` — route group con layout NavBar (protette da auth)
- `src/app/portale/login/` e `src/app/portale/registrati/` — fuori dal gruppo, nessuna NavBar
- `src/app/portale/dashboard/page.tsx` — permanentRedirect a `/portale`
- Il route group `(portal)` non crea segmento URL — `/portale/(portal)/page.tsx` → URL `/portale`

### Deploy
- Vercel collegato a GitHub (lucamorettig-coder/trionoracing-next).
- Branch principale: main. Pattern: branch dedicato → PR → merge → deploy automatico.
