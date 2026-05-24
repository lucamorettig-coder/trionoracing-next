# Prompt Claude Code — EVO-006 Area maestro (F3.5)

> **Per Claude Code** (`/Users/luca/Developer/trionoracing-next`).
> Esegui l'intero ciclo end-to-end: implementazione → quality gate → smoke dev → branch/PR → attesa OK utente → merge → verifica post-deploy → auto-verifica `verify-implementation`. **Non mergiare senza OK esplicito dell'utente**.

---

## Contesto

Stai implementando **EVO-006 "Area maestro (F3.5)"** della Fase 3 del portale Triono Racing. È la 5a evolutiva del portale dopo EVO-002 (infra), EVO-003 (genitore core), EVO-004 (iscrizioni+SumUp), EVO-005 (gare genitore), EVO-013/014/015 (varie). L'evolutiva è la naturale continuazione del portale: i 9 maestri della scuola registrano lezioni e vedono le gare a cui sono assegnati.

**Scheda evolutiva (fonte di verità)**: `evolutive/EVO-006-portale-maestro.md`. Leggila integralmente prima di iniziare — contiene requisiti, ambito, analisi as-is con tutti i campi Airtable verificati, WBS dettagliata 11 macro-task / ~35 sub-task, verifica coerenza, rischi.

**Visual di riferimento**: `evolutive/EVO-006-portale-maestro/visual/` — 5 mockup HTML + `README.md` con 8 scostamenti vs mockup **obbligatori da applicare**. NON riprodurre i mockup pedissequamente: i mockup precedono l'analisi as-is e contengono ipotesi da adattare al modello dati reale (vedi sotto).

**Pattern AGENTS.md applicabili** (leggi `AGENTS.md` per i dettagli):
- EVO-002: lazy sync in layout (da estendere per maestri)
- EVO-003: portale-utils helpers, R2 client già pronto
- EVO-005: vocabolari `as const`, tile colorato palette DS, Server Action multi-write con redirect `?success=N`, mockup ricchi su schema povero (adattare al dato), env table parametrizzata
- EVO-013: pattern aggregator `get{X}ByGenitore` → analogo `get{X}ByMaestro`
- EVO-014: dashboard ruolo-aware, helper getStatoIscrizioneAnnoCorrente, banner reassurance
- EVO-015: campo Airtable additivo low-risk, helper centralizzato per label

---

## Prerequisiti — verifica prima di iniziare

1. **Branch corrente**: assicurati di essere su `main` pulito e sincronizzato con `origin/main` (`git fetch && git status`).
2. **Tool MCP disponibili**: `mcp__37f1e8ce-…__create_field`, `mcp__37f1e8ce-…__get_table_schema`, `mcp__37f1e8ce-…__list_records_for_table`, `mcp__37f1e8ce-…__update_field`. Base Airtable PROD: `appszpkU1aXb3xrFM`. Tabelle: TABELLA_LEZIONI = `tblZcBzamh5ASweNa`, TABELLA_MAESTRI = `tbllvUh6yh0S93gy0`, TABELLA_GENITORI = `tblconpn0wt65SEg3`, Gare = `tblDlFOIjAhbT0QHD`.
3. **Skill `verify-implementation`**: verifica se è disponibile nella tua sessione. Se sì, la chiamerai alla fine. Se no, produci un report manuale equivalente (pattern EVO-010).
4. **Env vars Vercel**: `AIRTABLE_BASE_ID`, `AIRTABLE_TOKEN`, Clerk keys, `MAKE_SUMUP_RETURN_URL` — tutte già configurate (EVO precedenti).

---

## Step 0 — Setup branch

```bash
cd /Users/luca/Developer/trionoracing-next
git checkout main && git pull
git checkout -b feat/portale-maestro
```

Tieni la convenzione di commit incrementali per macro-task della WBS (un commit per blocco logico, no monster commit).

---

## Step 1 — Schema Airtable via MCP (WBS 1.x)

**Prima del codice**, aggiungi i 2 campi via MCP:

1.1. `TABELLA_LEZIONI.NOTE_INTERNE` (multilineText):
- `create_field` su tableId `tblZcBzamh5ASweNa`
- Type: `multilineText`
- Name: `NOTE_INTERNE`
- Description: "Note interne maestro/admin (NON visibili ai genitori). Pattern: continuità di team, osservazioni private."

1.2. `TABELLA_MAESTRI.DISCIPLINE` (multipleSelects):
- `create_field` su tableId `tbllvUh6yh0S93gy0`
- Type: `multipleSelects`
- Name: `DISCIPLINE`
- Choices: `[{name: "MTB"}, {name: "BDC"}]`
- Description: "Discipline insegnate dal maestro. Allineato a TIPO_SESSIONE (MTB / BDC). Backfill manuale post-EVO-006 dei 9 maestri esistenti."

**Verifica subito** con `get_table_schema` che entrambi i campi siano creati con il tipo corretto e annota i fieldId restituiti.

**Commit**: `chore(airtable): EVO-006 aggiunti campi NOTE_INTERNE + DISCIPLINE via MCP (no codice)` — è solo una linea nel `evolutive/EVO-006-portale-maestro.md` log fase 7 + appunto dei fieldId.

---

## Step 2 — Tipi TypeScript + costanti (WBS 2.x)

In `src/lib/airtable-portale.ts`, aggiungi alla fine del file una nuova sezione `// ─── TABELLA_LEZIONI + TABELLA_MAESTRI (EVO-006) ─────────────────`:

2.1. Espandi interface `Lezione` (oggi minimale, riga ~794) con TUTTI i campi reali — vedi §3 della scheda per la lista completa. Aggiungi anche `NOTE_INTERNE`.

2.2. Nuova interface `Maestro`:
```ts
export interface Maestro {
  id: string;
  fields: {
    NOME_MAESTRO: string;
    COGNOME_MAESTRO: string;
    EMAIL: string;
    TELEFONO?: string;
    CODICE_FCI?: string;
    QUALIFICA?: string; // singleSelect: "TI2 - Tecnico Istruttore" | "AT1 - Assistente Tecnico"
    DISCIPLINE?: string[]; // multipleSelects: "MTB" | "BDC"
    FOTO?: string;
    ATTIVO?: boolean;
    PUBLISHED?: boolean;
    NOTE?: string;
    UTENTE?: string[]; // linked records → TABELLA_GENITORI
    AUTH_USER_ID?: string[]; // lookup da UTENTE
    LEZIONI_COME_MAESTRO?: string[];
    LEZIONI_COME_COMPILATORE?: string[];
  };
}
```

2.3. Costanti `as const readonly`:
```ts
export const TIPO_SESSIONE_VALUES = [
  "Lezione MTB Ciclodromo",
  "Lezione BDC Ciclodromo",
  "Gara Giovanissimi",
] as const;
export type TipoSessione = (typeof TIPO_SESSIONE_VALUES)[number];

export const ATTIVITA_SVOLTE_VALUES = [
  "Tecnica di base",
  "Gestione curve",
  "Frenata e discesa",
  "Equilibrio e coordinazione",
  "Lavoro in salita",
  "Resistenza e condizionamento",
  "Tattica di gara",
  "Uscita su strada",
  "Simulazione dinamiche di gara",
  "Abilità fuori strada",
] as const;
export type AttivitaSvolta = (typeof ATTIVITA_SVOLTE_VALUES)[number];

export const MAESTRO_QUALIFICHE = [
  "TI2 - Tecnico Istruttore",
  "AT1 - Assistente Tecnico",
] as const;

export const DISCIPLINE_VALUES = ["MTB", "BDC"] as const;
export type Disciplina = (typeof DISCIPLINE_VALUES)[number];
```

2.4. `WRITABLE_FIELDS_LEZIONI` e `WRITABLE_FIELDS_MAESTRI` Sets (escludi formule e lookup):
- LEZIONI writable: `DATA`, `TIPO_SESSIONE`, `ATTIVITA_SVOLTE`, `NOTE_ATTIVITA`, `NOTE_INTERNE`, `BAMBINI_PRESENTI`, `MAESTRI_PRESENTI`, `MAESTRO_COMPILATORE`, `GARA`, `PUBLISHED`, `DATA_COMPILAZIONE`.
- MAESTRI writable: `UTENTE` (per linking).

Helper `stripReadOnlyFieldsLezioni(fields)` e `stripReadOnlyFieldsMaestri(fields)` analoghi a quello esistente per GENITORE.

**Commit**: `feat(airtable-portale): EVO-006 tipi Lezione + Maestro + costanti as const`.

---

## Step 3 — Funzioni Airtable client (WBS 3.x)

Aggiungi le 9 funzioni descritte nella WBS:

```ts
// 3.1
export async function getMaestroByEmail(email: string): Promise<Maestro | null> { ... }
export async function getMaestroByGenitoreId(genitoreRecordId: string): Promise<Maestro | null> { ... }

// 3.2
export async function linkMaestroToGenitore(maestroId: string, genitoreId: string): Promise<void> { ... }

// 3.3
export async function getAllMaestriAttivi(): Promise<Maestro[]> { ... }
// Filtro: ATTIVO=true. Sort: COGNOME_MAESTRO asc.

// 3.4
export async function getLezioniByMaestro(
  maestroId: string,
  anno?: number,
  mese?: number,
): Promise<Lezione[]> { ... }
// Filtro: SEARCH("{maestroId}", ARRAYJOIN(MAESTRO_COMPILATORE)) > 0
//      OR SEARCH("{maestroId}", ARRAYJOIN(MAESTRI_PRESENTI)) > 0
// + filtro YEAR/MONTH se presenti. Sort: DATA desc.
// Se il filtro Airtable nativo su linked records risulta lento o instabile,
// fallback al pattern aggregator: fetch tutte le lezioni dell'anno + filter in memoria.

// 3.5
export async function getLezioneById(id: string): Promise<Lezione | null> { ... }

// 3.6
export async function createLezione(
  input: Partial<Lezione["fields"]>,
  maestroCompilatoreId: string,
): Promise<Lezione> { ... }
// Set automatici:
//   MAESTRO_COMPILATORE = [maestroCompilatoreId]
//   DATA_COMPILAZIONE = new Date().toISOString()
//   PUBLISHED = true
// Validazioni server:
//   - DATA <= oggi → throw "Non puoi registrare una lezione futura."
//   - se duplicata (stesso giorno + stesso compilatore) → tornare warning soft via campo metadata?
//     Più semplice: NON bloccare (l'utente conferma in UI), solo log warn server.
// Usa stripReadOnlyFieldsLezioni() prima del POST.

// 3.7
export async function updateLezione(
  id: string,
  patch: Partial<Lezione["fields"]>,
  currentMaestroId: string,
  isAdmin: boolean,
): Promise<Lezione> { ... }
// Guard:
//   - fetch lezione esistente
//   - ownership: currentMaestroId IN MAESTRO_COMPILATORE OR currentMaestroId IN MAESTRI_PRESENTI OR isAdmin → ok
//   - se non isAdmin: lezionePuoEssereModificata(lezione.DATA, false) deve essere canEdit=true
//   - altrimenti throw error specifico ("Non sei autorizzato" o "Lezione di oltre 30gg, contatta admin")
// Usa stripReadOnlyFieldsLezioni().

// 3.8
export async function getBambiniAttiviPerDisciplina(
  disciplina?: Disciplina,
): Promise<Bambino[]> { ... }
// Strategia:
//   - fetch tutte le iscrizioni anno corrente (TABELLA_ISCRIZIONI)
//   - filter per CORSO compatibile: BDC ↔ "Strada", MTB ↔ "MTB"
//   - estrai bambinoId univoci → fetch BAMBINI corrispondenti
// Privacy view: NON includere campi genitore o pagamento nel payload — già rispettato perché il
// caller passa solo i bambini al componente UI; verifica esplicita nel render.
// Verifica in implementazione i valori esatti del singleSelect CORSO (probabilmente "MTB" | "Strada").

// 3.9
export async function getGareAssegnateAlMaestro(
  maestroId: string,
  scope: "future" | "past",
): Promise<Gara[]> { ... }
// Filtro doppio: campo "TABELLA_MAESTRI" OR "Maestro Accompagnatore" contiene maestroId
//                + Data >= TODAY() (scope=future) o Data < TODAY() (scope=past)
// Verifica empirica in smoke test quale dei due campi è popolato dal flusso admin reale.
// Fallback safe: UNION dei risultati di entrambi i campi.
```

**Commit**: `feat(airtable-portale): EVO-006 9 funzioni client lezioni + maestri + gare`.

---

## Step 4 — Helper `portale-utils.ts` (WBS 6.x)

```ts
// 6.1
export function lezionePuoEssereModificata(
  dataLezione: string,
  isAdmin: boolean,
): { canEdit: boolean; reason?: string } {
  if (isAdmin) return { canEdit: true };
  const days = daysUntil(dataLezione); // negativo = nel passato
  const giorniDallaLezione = Math.abs(days);
  if (giorniDallaLezione <= 30) return { canEdit: true };
  return {
    canEdit: false,
    reason: "Le lezioni di oltre 30 giorni si modificano solo dall'admin.",
  };
}

// 6.2 (palette DS coerente, fallback navy)
export function tipoSessioneStyle(tipo?: string): {
  bg: string;
  text: string;
  shortLabel: string;
} {
  switch (tipo) {
    case "Lezione MTB Ciclodromo":
      return { bg: "bg-grass-500", text: "text-white", shortLabel: "MTB" };
    case "Lezione BDC Ciclodromo":
      return { bg: "bg-sky-500", text: "text-white", shortLabel: "BDC" };
    case "Gara Giovanissimi":
      return { bg: "bg-ember-500", text: "text-white", shortLabel: "Gara" };
    default:
      return { bg: "bg-navy-700", text: "text-white", shortLabel: tipo ?? "—" };
  }
}

// 6.3
export function groupLezioniByMese(
  lezioni: Lezione[],
): Map<string, Lezione[]> {
  const map = new Map<string, Lezione[]>();
  // chiave: "YYYY-MM" → array. Sort interno DATA desc (già sortate dalla query).
  // ...
}
```

**Commit**: `feat(portale-utils): EVO-006 helper lezione (guard 30gg, tipoSessioneStyle, groupBy mese)`.

---

## Step 5 — Lazy sync maestro nel layout (WBS 5.x)

Modifica `src/app/portale/(portal)/layout.tsx`:

```ts
// In syncGenitore, dopo aver determinato il ruolo (riga ~66):
if (ruolo === "ISTRUTTORE") {
  try {
    await syncMaestroLinkedToGenitore(genitoreRecordId, email);
  } catch (err) {
    console.warn("[portale-layout] maestro sync failed (non-blocking):", err);
  }
}

// Nuova funzione:
async function syncMaestroLinkedToGenitore(
  genitoreRecordId: string,
  email: string,
): Promise<void> {
  const existing = await getMaestroByGenitoreId(genitoreRecordId);
  if (existing) return; // già linkato

  const byEmail = await getMaestroByEmail(email);
  if (!byEmail) {
    console.warn(
      `[portale-layout] ISTRUTTORE ${email} non trovato in TABELLA_MAESTRI — contattare admin`,
    );
    return;
  }
  await linkMaestroToGenitore(byEmail.id, genitoreRecordId);
  console.log("[portale-layout] maestro linked:", email, "→", byEmail.id);
}
```

**Pattern non-bloccante**: se il sync fallisce, l'utente accede comunque al portale. La dashboard maestro mostrerà un banner "Account maestro non collegato — contattare admin" (Step 9). L'admin può manualmente popolare `UTENTE` su Airtable.

**Commit**: `feat(portale): EVO-006 lazy sync maestro al primo login (pattern EVO-002 esteso)`.

---

## Step 6 — Server Actions (WBS 4.x)

In `src/app/portale/(portal)/lezioni/actions.ts`:

```ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createLezione,
  updateLezione,
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
} from "@/lib/airtable-portale";

async function getCurrentMaestroId(): Promise<{ maestroId: string; isAdmin: boolean }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Non autenticato");
  const isAdmin = sessionClaims?.role === "ADMIN";
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) throw new Error("Profilo utente non trovato");
  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro) throw new Error("Profilo maestro non trovato — contattare admin");
  return { maestroId: maestro.id, isAdmin };
}

export async function actionCreateLezione(formData: FormData) {
  const { maestroId } = await getCurrentMaestroId();
  // estrai campi da formData (DATA, TIPO_SESSIONE, ATTIVITA_SVOLTE[], NOTE_ATTIVITA,
  // NOTE_INTERNE, BAMBINI_PRESENTI[], MAESTRI_PRESENTI[], GARA opt)
  // valida con Zod (schema in actions/schema.ts)
  await createLezione({...input}, maestroId);
  revalidatePath("/portale/lezioni");
  revalidatePath("/portale");
  redirect("/portale/lezioni?success=1");
}

export async function actionUpdateLezione(formData: FormData) {
  const lezioneId = formData.get("id") as string;
  const { maestroId, isAdmin } = await getCurrentMaestroId();
  // ... estrai patch
  await updateLezione(lezioneId, patch, maestroId, isAdmin);
  revalidatePath(`/portale/lezioni/${lezioneId}`);
  revalidatePath("/portale/lezioni");
  redirect(`/portale/lezioni/${lezioneId}?success=1`);
}
```

**Commit**: `feat(portale/lezioni): EVO-006 Server Actions create + update con guard ownership/30gg`.

---

## Step 7 — Componenti UI maestro (WBS 7.x)

Crea cartella `src/components/portale/lezioni/`:

7.1 `CardLezione.tsx` (Server) — riga lista mese: data + tile colorato `tipoSessioneStyle()` + co-maestri avatar (limita a 3 + "+N") + conteggio bambini + preview note pubbliche (max 1 riga truncate). CTA "Apri".

7.2 `FormLezione.tsx` (Client `"use client"`) — form 5 sezioni:
- Sezione 1 "Quando": DATA (default oggi, max oggi), ORARIO_INIZIO (default 17:00, nota: NON esiste campo Airtable separato per orario — è solo per UX, l'orario va incluso in DATA come timestamp se serve; se non serve, ometti), TIPO_SESSIONE (segmented control 3 opzioni)
- Sezione 2 "Chi ha tenuto": `MaestriSelector` (multi-select chips, default: io)
- Sezione 3 "Argomento": `AttivitaChips` (multi-select 10 tag)
- Sezione 4 "Bambini presenti": `BambiniSelector` (filtro disciplina + ricerca testo + checkbox)
- Sezione 5 "Note": textarea NOTE_ATTIVITA (label "Note pubbliche (visibili ai genitori)") + textarea NOTE_INTERNE (label "Note interne (solo maestri e admin)")
- CTA: "Salva lezione" (primary) + "Annulla" (ghost) + (solo in M-4) banner read-only se `!canEdit`

7.3 `AttivitaChips.tsx` (Client) — multi-select sui 10 valori di `ATTIVITA_SVOLTE_VALUES`. `aria-checked` su ogni chip.

7.4 `BambiniSelector.tsx` (Client) — riceve `bambini: Bambino[]` da parent Server Component (già filtrati per disciplina). Mostra search box + lista con avatar + checkbox. Stat "{n} bambini selezionati".

7.5 `MaestriSelector.tsx` (Client) — riceve `maestri: Maestro[]` + `currentMaestroId`. Mostra chips con `currentMaestroId` pre-selezionato.

7.6 `CardGaraAssegnata.tsx` (Server) — riusa pattern `CardGara` di EVO-005 con badge "In programma"/"Conclusa".

7.7 `BannerLezioneNonModificabile.tsx` (Server) — banner ember (`bg-ember-50 border-ember-100 text-ember-800`) con icona + testo "Le lezioni di oltre 30gg si modificano solo dall'admin. Contatta admin@trionoracing.it".

7.8 (nuovo, post-Step 5) `SezioneMaestroNonCollegato.tsx` (Server) — banner flag con CTA "Contatta admin" mostrato se il sync maestro è fallito (utente ISTRUTTORE senza record MAESTRI linkato).

**Commit**: `feat(portale/lezioni): EVO-006 7 componenti UI maestro (Card, Form, chips, selectors, banner)`.

---

## Step 8 — Pagine route (WBS 8.x)

8.1 `src/app/portale/(portal)/lezioni/page.tsx` (M-2) — Server Component. Estrai `searchParams.mese`, `searchParams.anno`, default mese+anno correnti. Fetch lezioni → group by mese → render lista con sezioni mese.

8.2 `src/app/portale/(portal)/lezioni/nuova/page.tsx` (M-3) — Server Component. Fetch dati form (maestri attivi, bambini per disciplina selezionata via searchParams o default tutti) → render `FormLezione` con `actionCreateLezione`.

8.3 `src/app/portale/(portal)/lezioni/[id]/page.tsx` (M-4) — Server Component. Fetch lezione + check ownership/30gg → branch: editable → `FormLezione` pre-compilato con `actionUpdateLezione`; non editable → `BannerLezioneNonModificabile` + `FormLezione` in modalità read-only.

8.4 `src/app/portale/(portal)/gare-assegnate/page.tsx` (M-5) — Server Component. Estrai `searchParams.scope` (`future` default | `past`). Fetch gare → render lista `CardGaraAssegnata` con toggle tab.

**Commit**: `feat(portale/lezioni): EVO-006 4 pagine route (lista + nuova + dettaglio + gare-assegnate)`.

---

## Step 9 — Dashboard ruolo-aware + NavBar (WBS 9.x + 10.x)

9.1 `src/components/portale/dashboard/SezioneMaestro.tsx` (Server Component) — blocco "Come Maestro":
- Hero: card `.photo-bg-navy` con "Ciao {NOME}, {QUALIFICA}" + sub-line "{n} lezioni questo mese · {n} gare in programma"
- (Opzionale, MVP-): Card "Oggi" se ci sono lezioni fisse oggi (mar/gio 17:00) — può essere skippata in MVP e aggiunta in iterazione successiva
- "Le mie prossime gare" (max 3) — render `CardGaraAssegnata`
- "Storico recente" — ultime 5 lezioni → render `CardLezione` compatta
- Quick actions: "Nuova lezione" (primary), "Le mie lezioni" (outline), "Gare assegnate" (outline)
- Se utente ISTRUTTORE ma sync maestro fallito → `SezioneMaestroNonCollegato` invece di tutto il blocco

9.2 Modifica `src/app/portale/(portal)/page.tsx`:
```ts
const { sessionClaims, userId } = await auth();
const role = (sessionClaims?.role as string) ?? "GENITORE";

if (role === "ADMIN") permanentRedirect("/portale/admin");

const genitore = await getGenitoreByClerkId(userId!);
const hasFigli = (genitore?.fields.TABELLA_BAMBINI?.length ?? 0) > 0;

if (role === "ISTRUTTORE") {
  return (
    <>
      <SezioneMaestro maestroId={...} />
      {hasFigli && (
        <>
          <hr className="my-12 border-line" />
          <h2 className="text-eyebrow uppercase text-ink-muted">I miei figli</h2>
          <DashboardGenitore /> {/* componente EVO-014 esistente */}
        </>
      )}
    </>
  );
}

// role === GENITORE → render DashboardGenitore solo (no cambiamento)
return <DashboardGenitore />;
```

10.1 Modifica `src/components/portale/PortaleNavBar.tsx`:
```ts
// Server-side: leggi hasFigli per il caso ISTRUTTORE dual
const genitore = userId ? await getGenitoreByClerkId(userId) : null;
const hasFigli = (genitore?.fields.TABELLA_BAMBINI?.length ?? 0) > 0;

function getLinksForRole(role: string, hasFigli: boolean): NavLink[] {
  if (role === "ADMIN") return [...]; // esistente
  if (role === "ISTRUTTORE") {
    const maestroLinks = [
      { label: "Home", href: "/portale" },
      { label: "Le mie lezioni", href: "/portale/lezioni" },
      { label: "Gare assegnate", href: "/portale/gare-assegnate" },
    ];
    if (hasFigli) {
      // dual ruolo: prepend genitore links (eccetto Home già presente)
      return [
        { label: "Home", href: "/portale" },
        { label: "I miei figli", href: "/portale/figli" },
        { label: "Iscrizioni", href: "/portale/iscrizioni" },
        { label: "Pagamenti", href: "/portale/pagamenti" },
        { label: "Le mie lezioni", href: "/portale/lezioni" },
        { label: "Gare assegnate", href: "/portale/gare-assegnate" },
        { label: "Profilo", href: "/portale/profilo" },
      ];
    }
    return [...maestroLinks, { label: "Profilo", href: "/portale/profilo" }];
  }
  return [...]; // esistente GENITORE
}
```

**Commit**: `feat(portale): EVO-006 dashboard ruolo-aware + NavBar dual ruolo ISTRUTTORE+genitore`.

---

## Step 10 — Quality gate

Esegui in sequenza:
```bash
npm run lint       # eslint
npx tsc --noEmit   # typecheck
npm run build      # build production
```

Tutti devono passare a zero errori (warning accettabili se preesistenti). Se uno fallisce, fixa prima di proseguire — non lasciare debito tecnico in PR.

---

## Step 11 — Smoke test guidato in dev

Avvia `npm run dev` e guida l'utente attraverso questi smoke test mostrando i comandi/URL nel canale chat:

**Setup test maestro**: Luca deve avere un account Clerk con `publicMetadata.role = "ISTRUTTORE"` E un record corrispondente in `TABELLA_MAESTRI` con `EMAIL` match. Se non esiste, chiedi a Luca di:
1. Andare in Clerk Dashboard → Users → trovare l'account test → Public metadata → settare `{"role": "ISTRUTTORE"}`.
2. Verificare che `TABELLA_MAESTRI` PROD abbia un record con `EMAIL` corrispondente all'account Clerk. Se no, chiedere a Luca di crearlo o usare uno dei 9 maestri esistenti.

**Smoke test (esegui tutti e riporta esito)**:
1. **Sync iniziale**: login su `http://localhost:3000/portale/login` con account maestro → verifica nei log `[portale-layout] maestro linked: ... → ...`. Su Airtable verifica `TABELLA_MAESTRI.UTENTE` popolato.
2. **Dashboard M-1**: verifica blocco "Come Maestro" con hero + counters + quick actions. Se anche dual ruolo, verifica "I miei figli" sotto.
3. **NavBar**: verifica i link "Le mie lezioni" e "Gare assegnate". In dual ruolo verifica anche genitore links.
4. **M-3 Nuova lezione**: vai a `/portale/lezioni/nuova` → compila tutti i campi (data oggi, TIPO Lezione MTB, 2 ATTIVITA chips, 1 co-maestro, 3 bambini, note pubbliche+interne) → salva. Verifica redirect `/portale/lezioni?success=1` + toast.
5. **M-2 Lista**: vai a `/portale/lezioni` → verifica card lezione appena creata in cima al mese corrente, con tile MTB verde.
6. **M-4 Modifica entro 30gg**: clicca "Apri" → modifica `NOTE_INTERNE` → salva. Verifica update.
7. **Test guard 30gg**: crea (manualmente da Airtable se serve) una lezione con `DATA = oggi - 35gg` → riapri `/portale/lezioni/[id]` → verifica `BannerLezioneNonModificabile` visibile, form read-only.
8. **Test ownership**: crea lezione con un altro maestro come MAESTRO_COMPILATORE (e tu non in MAESTRI_PRESENTI) → verifica che `/portale/lezioni/[id]` mostri banner non-owner OR 403/redirect.
9. **M-5 Gare assegnate**: vai a `/portale/gare-assegnate` → verifica toggle future/passate, lista gare a cui il maestro è assegnato (se ce ne sono).
10. **Privacy bambini**: nella lista M-3 BambiniSelector verifica che i bambini mostrati abbiano SOLO nome+cognome+foto+categoria FCI (no email genitore, no certificato, no pagamenti).

**Riporta risultati in chat** in tabella ✅/❌ per ogni voce. Se ci sono fail, fixa e ripeti.

---

## Step 12 — Branch + PR

```bash
git push -u origin feat/portale-maestro
```

Apri PR con titolo `EVO-006: F3.5 Area maestro (lezioni + gare assegnate)` e body strutturato:

```markdown
## EVO-006 — F3.5 Area maestro

Riferimenti:
- Scheda: `evolutive/EVO-006-portale-maestro.md`
- Visual: `evolutive/EVO-006-portale-maestro/visual/`

### Scope
- M-1 Dashboard maestro ruolo-aware (con caso dual GENITORE+ISTRUTTORE derivato dai dati)
- M-2 Lista lezioni raggruppate per mese
- M-3 Nuova lezione (form 5 sezioni con chips ATTIVITA_SVOLTE)
- M-4 Modifica/dettaglio con guard 30gg + ownership
- M-5 Gare assegnate con toggle future/passate

### Schema Airtable
- ✅ `TABELLA_LEZIONI.NOTE_INTERNE` (multilineText) — via MCP
- ✅ `TABELLA_MAESTRI.DISCIPLINE` (multipleSelects MTB|BDC) — via MCP

### Pattern applicati
- Lazy sync maestro al primo login (estensione pattern EVO-002)
- Helper aggregator `getLezioniByMaestro`/`getGareAssegnateAlMaestro` (pattern EVO-013/015)
- Server Action multi-write con redirect `?success=N` (pattern EVO-005)
- Tile colorato `tipoSessioneStyle` (pattern EVO-005 `tipoXStyle`)
- Vocabolari `as const readonly` verificati via MCP prima del codice (pattern EVO-005)
- Pulizia easter egg dai mockup (pattern EVO-010)

### Quality gate
- ✅ lint
- ✅ typecheck
- ✅ build

### Smoke test
Vedi sezione "Smoke test" in commit message dell'ultimo commit.

### Azioni manuali post-merge (Luca)
1. **Backfill DISCIPLINE** sui 9 record TABELLA_MAESTRI esistenti (MTB/BDC/entrambi)
2. **Verifica linking maestri**: se al primo login di un maestro il sync fallisce (`UTENTE` non popolato), verificare che `TABELLA_MAESTRI.EMAIL` coincida con l'email Clerk.

### Risks tracked
R1 (Gare.TABELLA_MAESTRI vs Maestro Accompagnatore), R2 (mapping CORSO↔DISCIPLINE), R3 (ownership co-maestro), R4 (admin+maestro dual), R5 (DISCIPLINE backfill). Dettagli nella scheda §4.
```

**STOP** — aspetta l'OK esplicito dell'utente in chat: _"approvo il merge di EVO-006"_ o equivalente.

---

## Step 13 — Merge + verifica post-deploy

Quando ricevi OK utente:
```bash
# Merge tramite GitHub UI (squash merge — convenzione progetto)
# OPPURE da CLI:
gh pr merge --squash --delete-branch
```

Aspetta il deploy automatico Vercel (~2-3 minuti).

**Smoke test produzione** (su `https://trionoracing-next.vercel.app`):
1. Login maestro reale → dashboard `/portale` mostra blocco "Come Maestro"
2. `/portale/lezioni` apre senza errori
3. `/portale/lezioni/nuova` apre form completo
4. `/portale/gare-assegnate` apre (anche se lista vuota)
5. NavBar mostra i link corretti
6. Tail dei logs Vercel runtime: nessun errore 500

Riporta esito smoke produzione in chat.

---

## Step 14 — Auto-verifica con `verify-implementation`

Se la skill `verify-implementation` è disponibile nella tua sessione, invocala:
- Input: scheda evolutiva `evolutive/EVO-006-portale-maestro.md`, branch mergeato, visual reference
- Dimensioni richieste: DS coerence, fedeltà visual (con scostamenti README), pattern AGENTS.md, privacy bambini, accessibility (chips ARIA, form labels), nessuna regressione su pagine genitore esistenti

Se NON disponibile, produci un report manuale equivalente in `evolutive/EVO-006-portale-maestro/verifica.md` con la stessa struttura, e segnalalo all'utente.

---

## Step 15 — Report finale all'utente

Chiudi con un messaggio strutturato:
```
✅ EVO-006 completata e live

URL produzione: https://trionoracing-next.vercel.app/portale/lezioni
PR: #{N} (commit di merge: {hash})
Branch eliminato.

Smoke test produzione: ✅
Verifica implementation: {esito}

Azioni manuali residue per Luca:
1. Backfill DISCIPLINE su 9 maestri TABELLA_MAESTRI
2. Test login con i 9 maestri reali per validare il lazy sync

Pronto per "chiudi EVO-006" in Cowork per la Fase 8.
```

---

## Note operative

- **Non saltare smoke test**: il portale è in produzione, la regressione su dashboard genitore (EVO-014) o su NavBar è facilmente introdotta. Verifica esplicita.
- **Non mergiare senza OK utente**: anche se tutto verde, attendi conferma.
- **Commit incrementali, non monster commit**: facilita review.
- **Log ogni decisione operativa significativa** in `evolutive/EVO-006-portale-maestro.md` log fasi.
- **Pattern degrado graduale**: se uno step opzionale (es. card "Oggi" di M-1) è oltre il budget di tempo, parcheggia in TODO e segnala in PR. Non rompere il flusso principale.
