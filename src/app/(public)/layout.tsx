import { NavBar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const publicLinks = [
  { label: "Scuola", href: "/la-scuola" },
  { label: "Amatori", href: "/gli-amatori-triono" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Marathon 209", href: "/marathon-209", badge: "2026" },
  { label: "News", href: "/archivio-news-scuola" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar links={publicLinks} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
