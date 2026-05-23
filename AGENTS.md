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

### Pattern appresi in EVO-002 (2026-05-21)

- **Lazy sync in layout**: il webhook `user.created` non copre Google OAuth né sessioni pre-esistenti. Il layout `(portal)/layout.tsx` esegue un sync Airtable al primo accesso di ogni utente non ancora collegato — questo è il fallback canonico. Replicare in EVO future se si aggiungono record da creare al primo accesso.
- **Hotfix NavBar pubblica**: quando si aggiunge o modifica il portale auth, verificare che i link "Accedi"/"Registrati" nella NavBar **pubblica** (`src/components/ui/navbar.tsx`) puntino a `/portale/login` e `/portale/registrati`. Aggiungere questo controllo allo smoke test post-deploy.
- **Admin iniziali**: gli account ADMIN esistenti devono avere `publicMetadata.role = "ADMIN"` settato manualmente in Clerk Dashboard → Users → edit user → Public metadata. Il webhook lo setta solo per nuove registrazioni.

### Pattern appresi in EVO-003 (2026-05-22)

- **R2 via AWS SDK S3 (non binding Cloudflare)**: su Vercel non si usano binding Cloudflare nativi. R2 si accede tramite `@aws-sdk/client-s3` con endpoint `https://{CF_ACCOUNT_ID}.r2.cloudflarestorage.com`. Env richieste: `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`. Client in `src/lib/r2.ts` — riusare in EVO future senza duplicare.
- **portale-utils.ts**: helper condivisi tra componenti portale (`diffInYears`, `formatDateIT`, `daysUntil`, `certBadgeVariant`). Aggiungere qui ogni utility riusabile cross-componente nel portale, non nei singoli file componente.
- **certBadgeVariant**: usa il campo formula Airtable `CERTIFICATO_MEDICO_STATO` se disponibile, altrimenti calcola da `DATA_SCADENZA_CERTIFICATO`. Pattern generale: preferire campi formula Airtable per stati computati — evita logica duplicata client/server.
- **fallbackRedirectUrl su Clerk SignIn/SignUp**: le pagine `login/` e `registrati/` devono avere `fallbackRedirectUrl="/portale"` sulle componenti Clerk, altrimenti dopo il login Clerk redireziona a un URL di default. Verificare allo smoke test post-deploy.
- **Mobile drawer fuori da sticky header**: il componente mobile drawer/menu deve essere montato **fuori** dall'elemento `<header>` con `position: sticky`, altrimenti si crea un conflitto di stacking context e il drawer non si sovrappone correttamente ai contenuti sotto.
- **suppressHydrationWarning su footer**: gli elementi che contengono data/ora o contenuto che differisce tra server e client render richiedono `suppressHydrationWarning` per evitare warning React. Aggiungerlo su `<footer>` e simili se necessario.
- **allowedDevOrigins per test LAN (iPhone)**: aggiungere `192.168.x.x` (o la subnet locale) a `allowedDevOrigins` in `next.config.ts` per poter aprire il dev server da iPhone sulla stessa rete WiFi. Utile per smoke test mobile.
- **FCI category mapping — verificare sempre**: il mapping anno nascita → categoria FCI aveva un bug nell'implementazione iniziale e ha richiesto un fix separato. Quando si implementa `calcCategoriaFCI`, verificare il mapping rispetto al regolamento FCI vigente e testare con anni limite (es. esatti confini di categoria).
