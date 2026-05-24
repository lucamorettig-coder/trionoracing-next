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

### Pattern appresi in EVO-010 (2026-05-23)

- **Asset condiviso cross-deliverable**: quando un'evolutiva produce contenuti riusati in più punti (sito pubblico + portale, sezione + tab, ecc.), creare un modulo `src/lib/{feature}.ts` con tipo TypeScript + array `as const readonly` + helper di trasformazione URL. Mappa esplicita ai campi backend (es. `CampoTagliaAirtable`). Single source of truth, niente duplicazione tra sezioni. Esempio: `src/lib/kit-scuola.ts` consumato da `SezioneKitScuola` (pubblico) e — in EVO-011 — da `TabTaglie` (portale).
- **`next/image` per immagini prodotto scontornate**: usare `fill` + `object-contain` con padding interno generoso (`p-8 lg:p-10`). NON `object-cover` (è per foto in contesto come `SezioneGalleria`). I capi/prodotti vanno mostrati interi con respiro attorno, non croppati.
- **`images.remotePatterns` scope ristretto**: dichiarare `pathname` specifico al cloud-name del provider (es. `/duezeronove/**` per Cloudinary), non `/**`. Riduce superficie attaccabile e impedisce hot-linking accidentale di asset altrui sullo stesso CDN.
- **Cloudinary trasformazioni inline via helper**: invece di trasformazioni in build, applica `q_auto,f_auto,w_*,c_limit` direttamente nella URL via helper puro (`cloudinaryOptimized(url, width)`). Permette di scegliere width diversi per breakpoint diversi senza ricostruire l'asset.
- **Easter egg da Claude Design vanno puliti**: i mockup Claude Design possono contenere meta-info (es. `EVO-XXX · TITOLO`) come decorazione del canvas. Documentarli in `visual/README.md` come "NON portare in produzione" e verificare la pulizia in fase di verify-implementation.
- **`verify-implementation` skill non sempre disponibile in Claude Code**: la skill citata nei prompt può non essere caricata nella sessione corrente. I prompt devono dire: "se disponibile invoca, altrimenti produci report manuale con la stessa struttura per dimensione". Pattern applicato con successo in EVO-010.
- **Sezioni pagina pubblica: stacco di sfondo**: alternare i background tra sezioni adiacenti per dare ritmo visivo. Pattern usato in `/la-scuola`: Filosofia (`bg-bg-soft pattern-light`) → **Kit Scuola** (bianco pulito, no pattern) → Maestri (default) → Galleria (`bg-bg-soft pattern-light`). Una sezione "pulita" tra due con pattern dà respiro.
- **Lighthouse non in CI**: il progetto oggi non ha Lighthouse automatico. Le metriche restano manuali post-deploy. Eventuale future-task: integrare Lighthouse CI o Vercel Speed Insights.

### Pattern appresi in EVO-012 (2026-05-23)

- **Utility `.photo-bg-{color}` per card decorative grandi**: bg-color + bitmap pattern (`footer-bg.jpg` per navy, `footer-bg-white.jpg` per gli altri) + overlay linear-gradient verticale del colore al 82-90-96% (88-94-98% per sun/ember chiari per evitare desaturazione). `> *` ha `z-index: 1` automatico per portare children sopra l'overlay. Colori disponibili: `navy`, `sun`, `sky`, `grass`, `flag`, `ember`.
- **Quando usare `.photo-bg-{color}` vs `.pattern-{navy,light}`**:
  - **`.photo-bg-{color}`** → card decorative grandi (CTA, manifesto, hero, header dashboard, sidebar contatti). Look "premium" con texture bitmap visibile attraverso l'overlay forte.
  - **`.pattern-navy`** / **`.pattern-light`** → full-section background con SVG geometrico nitido + overlay sfumato (Filosofia UNESCO, PhotoPlaceholder, sezioni testuali). Look "ariosioso" con pattern tile.
- **Override theme-209**: `.theme-209 .photo-bg-navy` cambia bg a red `#7F1D1D` e overlay a red 82-96%. Le utility non-navy (sun/sky/grass/flag/ember) **non hanno override theme** — se in futuro servirà una card colorata sotto theme-209, valutare caso per caso.
- **Migrazione `bg-navy-700 pattern-navy` → `photo-bg-navy`**: la classe `.photo-bg-navy` ha `background-color: #050E3F` (navy-900) hardcoded. Sezioni che usavano `bg-navy-700` cambieranno tonalità (diventano navy-900). Decisione di EVO-012: accettabile per coerenza totale.
- **Scaffold preventivo**: le utility `photo-bg-{sun,sky,grass,flag,ember}` sono aggiunte al DS anche se nessuna card le usa al momento. Pattern: introdurre utility coerenti nel DS quando ne arriva la prima istanza, così le successive non devono pensarci.

### Pattern appresi in EVO-004 — hotfix 2026-05-24

- **`return_url` SumUp = notification URL per-checkout, non redirect del browser**: il campo `return_url` del payload `POST /v0.1/checkouts` (SumUp API v0.1) è l'URL che SumUp chiama in async quando il checkout cambia stato. Va passato ad **ogni** creazione di checkout, e punta al webhook Make.com (env `MAKE_SUMUP_RETURN_URL`) che fa GET su SumUp e aggiorna Airtable (`PAGATO=true`) in modo indipendente dal browser. È il meccanismo di fallback per il caso "utente paga ma chiude il tab prima del `/verify`" — senza, il pagamento resta `PENDING` su Airtable finché qualcuno non riapre la pagina. Pattern ereditato dal legacy Astro (`area-riservata-triono/src/pages/api/pagamenti/sumup/checkout.ts`).
- **Quando si tocca il payload SumUp, includere sempre `return_url`**: già successo — omesso in EVO-004 (PR #13, commit `b37c8e2`) con regressione del fallback Make.com. Spread condizionale `...(returnUrl ? { return_url: returnUrl } : {})` + `console.warn` se la env è assente: degrado, non errore bloccante.
- **Il merchant-level webhook in dashboard SumUp NON è usato**: la notifica è sempre per-checkout via `return_url` nel payload. Non configurare webhook globali in dashboard SumUp pensando che coprano il caso — non lo fanno.
- **Recovery 409 `DUPLICATED_CHECKOUT` non rifà il payload**: il ramo che riusa un checkout esistente (via `GET /v0.1/checkouts?checkout_reference=...`) non deve aggiungere `return_url` — il checkout già esiste lato SumUp con i parametri originali. Modifiche al payload vanno applicate solo al ramo "create".
