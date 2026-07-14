import { ApexNavBar } from "@/components/apex/ApexNavBar";
import { ApexFooter } from "@/components/apex/ApexFooter";

const publicLinks = [
  { label: "Scuola", href: "/la-scuola" },
  { label: "Amatori", href: "/gli-amatori-triono" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Marathon 209", href: "/marathon-209", badge: "2026" },
  { label: "Diventa Maestro", href: "/diventa-maestro" },
  { label: "Contatti", href: "/contatti" },
];

/**
 * Layout pubblico — palco APEX (EVO-038).
 * `data-stage` attiva i token del DS v2 (scoped: il portale non li vede).
 * Chrome (NavBar/Footer) SEMPRE in livrea Racing su tutte le pagine
 * pubbliche; le pagine non ancora migrate restano chiare sotto il chrome
 * dark (data-stage fornisce i token ma NON setta il background — il fondo
 * stage lo applica ogni pagina migrata sul proprio wrapper).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-stage className="flex-1 flex flex-col">
      <ApexNavBar links={publicLinks} />
      <main className="flex-1">{children}</main>
      <ApexFooter />
    </div>
  );
}
