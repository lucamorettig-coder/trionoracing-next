import Image from "next/image";
import Link from "next/link";
import {
  Bike,
  UserPlus,
  ClipboardList,
  CreditCard,
  Image as ImageIcon,
  HeartPulse,
  ArrowRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import { SectionLap } from "@/components/apex/SectionLap";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageScene } from "@/components/apex/StageScene";

/**
 * SezioneComeIscriversi — /la-scuola (EVO-022, restyle APEX EVO-039)
 *
 * Sezione informativa statica "Cosa occorre per iscriversi": funnel in 4 step
 * (prova → registrati → iscrivi → paga) con mockup illustrati delle schermate
 * del portale + banda CTA finale verso l'area riservata genitori.
 *
 * DS v2 APEX, livrea Scuola (giallo elettrico #F4E718 + arancio #FF8A3D) sul
 * proprio <StageScene>. I mockup "schermo" (BrowserFrame e derivati) restano
 * intenzionalmente in stile DS v0.1 chiaro: rappresentano uno screenshot del
 * vero portale genitori (che resta un'app chiara), incorniciato da un "bezel"
 * navy scuro — solo l'inquadratura esterna adotta i token del palco.
 *
 * Variante A del design-handoff (DirectionA/MobileA), meccanica invariata.
 * Server Component: entrata via `.reveal` (scroll-driven, reduced-motion
 * safe), nessuno stato. I mockup sono decorativi (`aria-hidden`) — disegni
 * della UI, non screenshot.
 */

type StepKind = "invito" | "mock";
type MockKind = "register" | "iscrizione" | "checkout";

interface Step {
  n: string;
  kind: StepKind;
  icon: LucideIcon;
  title: string;
  text: string;
  mock?: MockKind;
}

const STEPS: readonly Step[] = [
  {
    n: "01",
    kind: "invito",
    icon: Bike,
    title: "Vieni a provare",
    text: "Fino a 2 lezioni di prova gratuite, per capire se la scuola fa per voi. Nessun impegno.",
  },
  {
    n: "02",
    kind: "mock",
    icon: UserPlus,
    mock: "register",
    title: "Registrati",
    text: "Crea il tuo account nell'area riservata genitori, bastano pochi minuti.",
  },
  {
    n: "03",
    kind: "mock",
    icon: ClipboardList,
    mock: "iscrizione",
    title: "Crea l'iscrizione",
    text: "Inserisci i dati di tuo figlio, scegli la formula di corso, carica una foto e il certificato medico valido.",
  },
  {
    n: "04",
    kind: "mock",
    icon: CreditCard,
    mock: "checkout",
    title: "Conferma e paga",
    text: "Leggi il regolamento, salda la quota d'iscrizione e la prima rata. Sei dentro!",
  },
] as const;

// Foto reale di bambini in bici al ciclodromo durante una lezione di prova.
// TODO EVO-022: sostituire con la foto definitiva fornita dall'utente.
const FOTO_PROVA_SRC = "/photos/scuola/lezione-ciclodromo.jpg";
const FOTO_PROVA_ALT =
  "Bambini in bici al ciclodromo durante una lezione di prova della scuola di ciclismo Triono.";

/* ============================================================
   Mockup illustrati — "disegno della UI, non screenshot"
   Frame finestra + barre al posto dei campi + 1 pulsante pieno.
   Restano in DS v0.1 chiaro (rappresentano il vero portale genitori,
   che è un'app chiara indipendente dal palco APEX) — SOLO il tray/bezel
   esterno che li ospita nella card usa i token del palco. Decorativo:
   il contenitore mock è marcato aria-hidden.
   ============================================================ */

function Bar({ w = "100%", h = 9, navy = false }: { w?: string; h?: number; navy?: boolean }) {
  return (
    <span
      className={`block shrink-0 rounded-[5px] ${navy ? "bg-navy-600" : "bg-navy-100"}`}
      style={{ width: w, height: h }}
    />
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <span className="text-[11.5px] font-semibold text-ink-muted">{label}</span>
      <div className="flex h-[34px] items-center rounded-[9px] border-[1.5px] border-line bg-bg-soft px-3">
        <Bar w={value} h={7} />
      </div>
    </div>
  );
}

function MockButton({ children, icon: Icon }: { children: React.ReactNode; icon: LucideIcon }) {
  return (
    <div className="flex h-[38px] w-full items-center justify-center gap-2 rounded-[11px] bg-navy-700 text-[13.5px] font-semibold text-white">
      {children}
      <Icon className="h-[15px] w-[15px]" strokeWidth={2.1} />
    </div>
  );
}

function UploadTile({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex h-[78px] min-w-0 flex-1 flex-col items-center justify-center gap-[7px] rounded-[11px] border-[1.5px] border-dashed border-navy-200 bg-bg-soft">
      <Icon className="h-5 w-5 text-navy-500" strokeWidth={1.8} />
      <span className="text-center text-[10.5px] font-semibold text-ink-muted">{label}</span>
      <span className="-mt-px flex h-[14px] w-[14px] items-center justify-center rounded-full bg-navy-700 text-[11px] font-bold leading-none text-white">
        +
      </span>
    </div>
  );
}

function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border-[1.5px] border-navy-100 bg-white shadow-[0_18px_40px_-18px_rgba(31,45,90,0.30),0_2px_6px_-2px_rgba(31,45,90,0.08)]">
      <div className="flex h-[30px] items-center gap-1.5 border-b border-line bg-bg-muted px-3">
        <span className="h-2 w-2 rounded-full bg-[#E0817E]" />
        <span className="h-2 w-2 rounded-full bg-[#E3B765]" />
        <span className="h-2 w-2 rounded-full bg-[#8FC07A]" />
        <div className="ml-2 flex h-4 flex-1 items-center overflow-hidden rounded-[5px] border border-line bg-white px-2">
          <span className="truncate font-mono text-[9px] tracking-[0.02em] text-ink-muted">
            area-genitori.triono.it
          </span>
        </div>
      </div>
      <div className="p-[18px]">
        <div className="mb-4 flex items-center gap-[9px]">
          <span className="block h-[18px] w-[6px] rounded-[3px] bg-sun-500" />
          <span className="text-sm font-bold tracking-[-0.01em] text-ink">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function MockRegister() {
  return (
    <BrowserFrame title="Crea account">
      <div className="flex flex-col gap-[13px]">
        <MockField label="Email" value="62%" />
        <MockField label="Password" value="44%" />
        <div className="mt-[3px]">
          <MockButton icon={ArrowRight}>Crea account</MockButton>
        </div>
      </div>
    </BrowserFrame>
  );
}

function MockIscrizione() {
  return (
    <BrowserFrame title="Dati del bambino">
      <div className="flex flex-col gap-[13px]">
        <div className="flex gap-[11px]">
          <div className="flex-1">
            <MockField label="Nome" value="70%" />
          </div>
          <div className="flex-1">
            <MockField label="Nascita" value="60%" />
          </div>
        </div>
        <div className="mt-0.5 flex gap-[11px]">
          <UploadTile icon={ImageIcon} label="Foto" />
          <UploadTile icon={HeartPulse} label="Certificato medico" />
        </div>
      </div>
    </BrowserFrame>
  );
}

function CheckoutLine({ w, amount, strong = false }: { w: string; amount: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-[14px]">
      <Bar w={w} h={strong ? 9 : 7} navy={strong} />
      <span
        className={`font-mono ${strong ? "text-[13px] font-bold text-ink" : "text-[11.5px] font-medium text-ink-muted"}`}
      >
        {amount}
      </span>
    </div>
  );
}

function MockCheckout() {
  return (
    <BrowserFrame title="Riepilogo e pagamento">
      <div className="flex flex-col gap-[13px]">
        <CheckoutLine w="46%" amount="€ —" />
        <CheckoutLine w="38%" amount="€ —" />
        <div className="my-0.5 h-px bg-line" />
        <CheckoutLine w="30%" amount="€ ——" strong />
        <div className="mt-1">
          <MockButton icon={Check}>Paga</MockButton>
        </div>
      </div>
    </BrowserFrame>
  );
}

function StepMock({ mock }: { mock: MockKind }) {
  if (mock === "register") return <MockRegister />;
  if (mock === "iscrizione") return <MockIscrizione />;
  return <MockCheckout />;
}

/* ============================================================
   Bezel/tray scuro che incornicia il mockup "schermo" chiaro
   dentro le card del palco (device mockup: bezel navy + schermo).
   ============================================================ */
function MockTray({ mock, padClass }: { mock: MockKind; padClass: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full border border-stage-line-soft bg-stage-navy transition-transform duration-300 [transform-origin:center_bottom] group-hover:scale-[1.03] ${padClass}`}
    >
      <StepMock mock={mock} />
    </div>
  );
}

/* ============================================================
   Link "prova" (step 01) — azione soft, non un bottone pieno.
   Vive sempre dentro la card calda (apex-card--warm, avorio/ink
   scuro): colore esplicito ink scuro per restare leggibile lì.
   ============================================================ */
function LinkProva({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/contatti?motivo=scuola"
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#04091c] underline decoration-[#04091c]/25 underline-offset-2 transition-opacity hover:opacity-70 ${className}`}
    >
      Contattaci e prenota subito una prova
      <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
    </Link>
  );
}

/* ============================================================
   Banda CTA finale (navy) — condivisa desktop/mobile
   ============================================================ */
function CtaBand() {
  return (
    <div className="reveal reveal-delay-5 relative mt-12 overflow-hidden border border-stage-line bg-stage-navy p-7 lg:mt-16 lg:px-12 lg:py-10">
      {/* Niente pattern geometrico (rimosso dal design, EVO-041): superficie
          navy pulita con solo un floodlight accento discreto, coerente col
          fondale APEX del resto della pagina. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 130% at 10% 20%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 55%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:gap-10 lg:text-left">
        {/* Duo mascotte: Nino col certificato medico, Vittoria con la foto tessera — decorativo */}
        <div
          aria-hidden="true"
          className="relative aspect-[101/120] w-[150px] shrink-0 self-end lg:w-[210px]"
        >
          <Image
            src="/scuola/duo-iscrizione.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 150px, 210px"
            className="object-contain object-bottom drop-shadow-[0_16px_22px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div className="max-w-[520px] lg:flex-1">
          <span className="inline-flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent before:inline-block before:h-[2px] before:w-7 before:bg-current before:content-['']">
            Pronti a partire
          </span>
          <h3 className="apex-display mt-3.5 text-[26px] leading-[1.05] tracking-[-0.02em] text-stage-ink lg:text-[36px]">
            Bastano una foto e il certificato medico.
          </h3>
          <p className="mx-auto mt-2.5 max-w-[470px] text-[14px] leading-[1.55] text-stage-ink-dim lg:mx-0 lg:text-[14.5px]">
            Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non
            agonistica.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 lg:w-auto lg:shrink-0 lg:items-start">
          <ApexCta href="/portale/iscrizioni">{"Inizia l'iscrizione"}</ApexCta>
          <span className="pl-0.5 font-mono text-[11px] tracking-[0.04em] text-stage-faint">
            → area riservata genitori
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Foto step 01 (placeholder finché non arriva quella reale)
   In duotone ambra di livrea (Scuola: arancio) — coerente col
   trattamento fotografico del resto del palco (EVO-038).
   ============================================================ */
function FotoProva({ heightClass }: { heightClass: string }) {
  return (
    <div className={`apex-duotone relative w-full overflow-hidden border border-stage-line ${heightClass}`}>
      <Image
        src={FOTO_PROVA_SRC}
        alt={FOTO_PROVA_ALT}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 25vw"
      />
    </div>
  );
}

/* ============================================================
   Card step — desktop (griglia 4 colonne)
   Nota: dentro .apex-card, h3/p sono governati dalla regola CSS
   unlayered `.apex-card h3/p` (apex.css, EVO-038) — vince sempre
   sulle utility Tailwind (lezione EVO-029: unlayered batte le
   utility). Niente classi di spaziatura/colore in conflitto su
   quei due elementi: font-size/peso/margini/colore arrivano dal
   componente DS.
   ============================================================ */
function StepCard({ step }: { step: Step }) {
  const invito = step.kind === "invito";
  const Icon = step.icon;
  return (
    <div className={`group flex h-full flex-col apex-card ${invito ? "apex-card--warm" : ""}`}>
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
            invito ? "bg-accent text-[#04091c]" : "bg-stage-navy text-accent"
          }`}
        >
          <Icon size={23} strokeWidth={1.9} />
        </span>
        {invito && (
          <span className="rounded-full bg-accent px-2.5 py-[5px] font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#04091c]">
            Gratis
          </span>
        )}
      </div>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
      {invito && <LinkProva className="mt-3" />}
      <div className="mt-[18px] flex flex-1 items-end">
        {invito ? <FotoProva heightClass="h-[188px]" /> : <MockTray mock={step.mock!} padClass="p-4" />}
      </div>
    </div>
  );
}

/* ============================================================
   Riga step — mobile (rail numerato verticale)
   Stessa struttura interna della StepCard desktop (icona → h3 →
   p → link/mock), per restare coerente col sistema tipografico
   di .apex-card senza dover forzare override via !important.
   ============================================================ */
function StepRow({ step, last }: { step: Step; last: boolean }) {
  const invito = step.kind === "invito";
  const Icon = step.icon;
  return (
    <div className="grid grid-cols-[46px_1fr] gap-[14px]">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full font-mono text-[15px] font-bold tracking-[0.04em] ${
            invito ? "bg-accent text-[#04091c]" : "border border-stage-line bg-stage-navy text-accent"
          }`}
        >
          {step.n}
        </span>
        {!last && <span className="mt-1 min-h-[24px] w-0.5 flex-1 bg-stage-line" />}
      </div>
      <div className={`group mb-[14px] apex-card ${invito ? "apex-card--warm" : ""}`}>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center ${
            invito ? "bg-accent text-[#04091c]" : "bg-stage-navy text-accent"
          }`}
        >
          <Icon size={20} strokeWidth={1.9} />
        </span>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
        {invito && <LinkProva className="mt-3" />}
        <div className="mt-3.5">
          {invito ? <FotoProva heightClass="h-[150px]" /> : <MockTray mock={step.mock!} padClass="p-[13px]" />}
        </div>
      </div>
    </div>
  );
}

export function SezioneComeIscriversi() {
  return (
    <StageScene data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        {/* Header */}
        <div className="reveal">
          <SectionLap
            numero="08"
            label="ISCRIZIONE"
            title={
              <>
                Iscrivere tuo figlio è semplice.{" "}
                <span className="accent-word">Ecco come.</span>
              </>
            }
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          Quattro passi, dal primo &ldquo;proviamo&rdquo; fino al via. Tutto online, dall&apos;area
          riservata genitori.
        </p>

        {/* Desktop — connettore numerato + griglia 4 colonne */}
        <div className="hidden lg:block">
          <div className="reveal reveal-delay-1 relative mb-[26px] mt-14">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-[22px] z-0 h-[2px] opacity-70 bg-[linear-gradient(90deg,var(--stage-line),var(--accent),var(--accent-2),var(--stage-line))]"
            />
            <div className="relative z-[1] grid grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex justify-center">
                  <span
                    className={`flex h-[46px] w-[46px] items-center justify-center rounded-full font-mono text-[15px] font-bold tracking-[0.04em] shadow-[0_0_0_6px_var(--stage-bg),var(--shadow-oggetti)] ${
                      i === 0 ? "bg-accent text-[#04091c]" : "border border-stage-line bg-stage-navy text-accent"
                    }`}
                  >
                    {s.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-stretch gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal-slide reveal-delay-${i + 1}`}>
                <StepCard step={s} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile — rail numerato verticale */}
        <div className="mt-8 lg:hidden">
          {STEPS.map((s, i) => (
            <StepRow key={s.n} step={s} last={i === STEPS.length - 1} />
          ))}
        </div>

        <CtaBand />
      </div>
    </StageScene>
  );
}
