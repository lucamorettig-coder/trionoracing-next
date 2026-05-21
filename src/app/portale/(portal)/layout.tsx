import PortaleNavBar from "@/components/portale/PortaleNavBar";

export default function PortaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-bg-soft">
      <PortaleNavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
