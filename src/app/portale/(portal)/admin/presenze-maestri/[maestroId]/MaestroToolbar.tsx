"use client";

import * as React from "react";
import { Euro, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModificaTariffaMaestroModal } from "@/components/admin/presenze-maestri/ModificaTariffaMaestroModal";
import { AggiungiPresenzaManualeModal } from "@/components/admin/presenze-maestri/AggiungiPresenzaManualeModal";

interface MaestroOption {
  id: string;
  nome: string;
  cognome: string;
  tariffaLezione: number | undefined;
  tariffaGara: number | undefined;
}

interface EventoOption {
  id: string;
  label: string;
  data: string;
}

interface Props {
  maestroId: string;
  maestroNome: string;
  maestroCognome: string;
  tariffaLezione: number | undefined;
  tariffaGara: number | undefined;
  maestriOptions: MaestroOption[];
  lezioniOptions: EventoOption[];
  gareOptions: EventoOption[];
}

export function MaestroToolbar(props: Props) {
  const [tariffaOpen, setTariffaOpen] = React.useState(false);
  const [manualeOpen, setManualeOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => setManualeOpen(true)}
        >
          <Plus size={16} />
          Aggiungi presenza
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setTariffaOpen(true)}
        >
          <Euro size={16} />
          Modifica tariffa
        </Button>
      </div>

      <ModificaTariffaMaestroModal
        open={tariffaOpen}
        onOpenChange={setTariffaOpen}
        maestroId={props.maestroId}
        maestroNome={props.maestroNome}
        maestroCognome={props.maestroCognome}
        tariffaLezione={props.tariffaLezione}
        tariffaGara={props.tariffaGara}
        onSuccess={() => setTariffaOpen(false)}
      />

      <AggiungiPresenzaManualeModal
        open={manualeOpen}
        onOpenChange={setManualeOpen}
        maestri={props.maestriOptions}
        lezioniRecenti={props.lezioniOptions}
        garePassate={props.gareOptions}
        maestroPrefill={{
          id: props.maestroId,
          tariffaLezione: props.tariffaLezione,
          tariffaGara: props.tariffaGara,
        }}
        onSuccess={() => setManualeOpen(false)}
      />
    </>
  );
}
