import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardBody } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const user = await currentUser();

  return (
    <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <SectionHeader
          eyebrow="Portale Genitori"
          title={`Ciao, ${user?.firstName ?? "benvenuto"}!`}
          subtitle="Da qui gestirai i tuoi bambini, le iscrizioni e i pagamenti."
        />
        <UserButton />
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        <Card>
          <CardContent>
            <Badge variant="info">In arrivo</Badge>
            <CardTitle className="mt-3">I tuoi bambini</CardTitle>
            <CardBody>Aggiungi i profili dei tuoi figli e gestisci le iscrizioni alla Scuola.</CardBody>
            <Button variant="outline" className="mt-5" disabled>
              Vai ai bambini
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Badge variant="info">In arrivo</Badge>
            <CardTitle className="mt-3">Iscrizioni</CardTitle>
            <CardBody>Controlla lo stato delle iscrizioni e le quote da pagare.</CardBody>
            <Button variant="outline" className="mt-5" disabled>
              Vai alle iscrizioni
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Badge variant="info">In arrivo</Badge>
            <CardTitle className="mt-3">Pagamenti</CardTitle>
            <CardBody>Storico pagamenti e ricevute scaricabili.</CardBody>
            <Button variant="outline" className="mt-5" disabled>
              Vai ai pagamenti
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-12 text-sm text-ink-muted">
        Placeholder F0.4 — le funzionalità reali arrivano in Fase 3.
      </p>
    </main>
  );
}
