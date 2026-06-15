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
import { Button } from "@/components/ui/button";

/**
 * SezioneComeIscriversi — /la-scuola (EVO-022)
 *
 * Sezione informativa statica "Cosa occorre per iscriversi": funnel in 4 step
 * (prova → registrati → iscrivi → paga) con mockup illustrati delle schermate
 * del portale + banda CTA finale verso l'area riservata genitori.
 *
 * Variante A del design-handoff (DirectionA/MobileA). Server Component:
 * entrata via `.reveal` (scroll-driven, reduced-motion safe), nessuno stato.
 * I mockup sono decorativi (`aria-hidden`) — disegni della UI, non screenshot.
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

// Foto reale: allievi in maglia Triono in sella alle bici, di spalle, al tramonto.
const FOTO_PROVA_SRC = "/photos/scuola/sezione-come-iscriversi.jpg";
const FOTO_PROVA_ALT =
  "Giovani allievi in maglia Triono in sella alle bici su un sentiero al tramonto, durante una lezione della scuola di ciclismo.";

/* ============================================================
   Mockup illustrati — "disegno della UI, non screenshot"
   Frame finestra + barre al posto dei campi + 1 pulsante pieno.
   Tutto decorativo: il contenitore mock è marcato aria-hidden.
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
   Link "prova" (step 01) — azione soft, non un bottone pieno
   ============================================================ */
function LinkProva({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/contatti?motivo=scuola"
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-700 transition-colors hover:text-navy-900 ${className}`}
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
    <div className="reveal reveal-delay-5 relative mt-12 overflow-hidden rounded-[var(--radius-2xl)] bg-navy-900 p-7 lg:mt-16 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-11">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/assets/pattern.svg')] bg-repeat opacity-[0.32]"
        style={{
          backgroundSize: "240px 240px",
          WebkitMaskImage:
            "linear-gradient(105deg,#000 0%,#000 28%,rgba(0,0,0,.45) 70%,transparent 100%)",
          maskImage:
            "linear-gradient(105deg,#000 0%,#000 28%,rgba(0,0,0,.45) 70%,transparent 100%)",
        }}
      />
      <div className="relative max-w-[560px]">
        <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-sun-500 before:inline-block before:h-[2px] before:w-7 before:bg-current before:content-['']">
          Pronti a partire
        </span>
        <h3 className="mt-3.5 text-[22px] font-bold leading-[1.15] tracking-[-0.015em] text-white lg:text-[30px] lg:leading-[1.12]">
          Bastano una foto e il certificato medico.
        </h3>
        <p className="mt-2.5 max-w-[470px] text-[14px] leading-[1.55] text-white/70 lg:text-[14.5px]">
          Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non
          agonistica.
        </p>
      </div>
      <div className="relative mt-6 flex flex-col items-start gap-3 lg:mt-0">
        <Button
          asChild
          size="lg"
          className="w-full border-sun-500 bg-sun-500 text-navy-900 hover:border-sun-600 hover:bg-sun-600 lg:w-auto"
        >
          <Link href="/portale/iscrizioni">
            {"Inizia l'iscrizione"}
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </Link>
        </Button>
        <span className="pl-0.5 font-mono text-[11px] tracking-[0.04em] text-white/55">
          → area riservata genitori
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Foto step 01 (placeholder finché non arriva quella reale)
   ============================================================ */
function FotoProva({ heightClass }: { heightClass: string }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-[14px] shadow-[var(--shadow-sm)] ${heightClass}`}>
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
   ============================================================ */
function StepCard({ step }: { step: Step }) {
  const invito = step.kind === "invito";
  const Icon = step.icon;
  return (
    <div
      className={`group flex h-full flex-col rounded-[var(--radius-xl)] p-[22px] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)] ${
        invito ? "border-[1.5px] border-[#F2E89A] bg-sun-50" : "border border-line bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
            invito ? "bg-sun-500 text-navy-900" : "bg-navy-50 text-navy-700"
          }`}
        >
          <Icon size={23} strokeWidth={1.9} />
        </span>
        {invito && (
          <span className="rounded-full bg-sun-100 px-2.5 py-[5px] font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-sun-700">
            Gratis
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink transition-colors group-hover:text-navy-600">
        {step.title}
      </h3>
      <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">{step.text}</p>
      {invito && <LinkProva className="mt-3" />}
      <div className="mt-[18px] flex flex-1 items-end">
        {invito ? (
          <FotoProva heightClass="h-[188px]" />
        ) : (
          <div
            aria-hidden="true"
            className="w-full rounded-[var(--radius-lg)] bg-bg-muted p-4 transition-transform duration-300 [transform-origin:center_bottom] group-hover:scale-[1.03]"
          >
            <StepMock mock={step.mock!} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Riga step — mobile (rail numerato verticale)
   ============================================================ */
function StepRow({ step, last }: { step: Step; last: boolean }) {
  const invito = step.kind === "invito";
  const Icon = step.icon;
  return (
    <div className="grid grid-cols-[46px_1fr] gap-[14px]">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full font-mono text-[15px] font-bold tracking-[0.04em] ${
            invito ? "bg-sun-500 text-navy-900" : "bg-navy-700 text-white"
          }`}
        >
          {step.n}
        </span>
        {!last && <span className="mt-1 min-h-[24px] w-0.5 flex-1 bg-line" />}
      </div>
      <div
        className={`mb-[14px] rounded-[var(--radius-xl)] p-[18px] shadow-[var(--shadow-sm)] ${
          invito ? "border-[1.5px] border-[#F2E89A] bg-sun-50" : "border border-line bg-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
              invito ? "bg-sun-500 text-navy-900" : "bg-navy-50 text-navy-700"
            }`}
          >
            <Icon size={20} strokeWidth={1.9} />
          </span>
          <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">{step.title}</h3>
        </div>
        <p className="mt-[11px] text-[13.5px] leading-[1.5] text-ink-muted">{step.text}</p>
        {invito && <LinkProva className="mt-3" />}
        <div className="mt-3.5">
          {invito ? (
            <FotoProva heightClass="h-[150px]" />
          ) : (
            <div aria-hidden="true" className="rounded-[var(--radius-lg)] bg-bg-muted p-[13px]">
              <StepMock mock={step.mock!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SezioneComeIscriversi() {
  return (
    <section className="bg-bg-soft py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div className="reveal max-w-[760px]">
          <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-sky-600 before:inline-block before:h-[2px] before:w-7 before:bg-current before:content-['']">
            Iscrizione
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-ink text-balance lg:text-[48px]">
            Iscrivere tuo figlio è semplice.{" "}
            <span className="text-navy-500">Ecco come.</span>
          </h2>
          <p className="mt-5 max-w-[540px] text-[16px] leading-[1.55] text-ink-muted lg:text-[18px]">
            Quattro passi, dal primo &ldquo;proviamo&rdquo; fino al via. Tutto online, dall&apos;area
            riservata genitori.
          </p>
        </div>

        {/* Desktop — connettore numerato + griglia 4 colonne */}
        <div className="hidden lg:block">
          <div className="reveal reveal-delay-1 relative mb-[26px] mt-14">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-[22px] z-0 h-[2px] opacity-50 bg-[linear-gradient(90deg,var(--color-grass-500),var(--color-sky-500),var(--color-ember-500),var(--color-navy-700))]"
            />
            <div className="relative z-[1] grid grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex justify-center">
                  <span
                    className={`flex h-[46px] w-[46px] items-center justify-center rounded-full font-mono text-[15px] font-bold tracking-[0.04em] shadow-[0_0_0_6px_var(--color-bg-soft),var(--shadow-sm)] ${
                      i === 0 ? "bg-sun-500 text-navy-900" : "bg-navy-700 text-white"
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
              <div key={s.n} className={`reveal reveal-delay-${i + 1}`}>
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
    </section>
  );
}
