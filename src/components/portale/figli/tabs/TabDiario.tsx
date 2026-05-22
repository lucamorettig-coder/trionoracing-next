"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateIT } from "@/lib/portale-utils";
import type { Lezione } from "@/lib/airtable-portale";

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

interface Props {
  bambinoId: string;
  bambinoNome: string;
  lezionInizialiMese: Lezione[];
  annoIniziale: number;
  meseIniziale: number;
}

export default function TabDiario({
  bambinoId,
  bambinoNome,
  lezionInizialiMese,
  annoIniziale,
  meseIniziale,
}: Props) {
  const [anno, setAnno] = useState(annoIniziale);
  const [mese, setMese] = useState(meseIniziale);
  const [lezioni, setLezioni] = useState<Lezione[]>(lezionInizialiMese);
  const [loading, setLoading] = useState(false);

  async function fetchLezioni(a: number, m: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/portale/bambini/${bambinoId}/diario?anno=${a}&mese=${m}`,
      );
      if (res.ok) {
        const data = await res.json();
        setLezioni(data.lezioni ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function prev() {
    let m = mese - 1;
    let a = anno;
    if (m < 1) { m = 12; a--; }
    setAnno(a); setMese(m);
    fetchLezioni(a, m);
  }

  function next() {
    let m = mese + 1;
    let a = anno;
    if (m > 12) { m = 1; a++; }
    const now = new Date();
    if (a > now.getFullYear() || (a === now.getFullYear() && m > now.getMonth() + 1)) return;
    setAnno(a); setMese(m);
    fetchLezioni(a, m);
  }

  const now = new Date();
  const isFuturo = anno > now.getFullYear() || (anno === now.getFullYear() && mese > now.getMonth() + 1);

  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-sm text-ink-muted">
        Qui trovi le lezioni a cui {bambinoNome} ha partecipato. Argomento e note sono scritti dal maestro.
      </p>

      {/* Selettore mese */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={prev} className="w-9 h-9 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-ink min-w-[140px] text-center">
          {MESI[mese - 1]} {anno}
        </span>
        <Button variant="ghost" size="sm" onClick={next} disabled={isFuturo} className="w-9 h-9 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista lezioni */}
      {loading ? (
        <div className="text-center py-10 text-ink-muted text-sm">Caricamento…</div>
      ) : lezioni.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-50 mb-4">
            <CalendarDays className="w-7 h-7 text-navy-700" />
          </div>
          <p className="text-ink font-semibold mb-1">Nessuna lezione</p>
          <p className="text-ink-muted text-sm">
            Nessuna lezione registrata in {MESI[mese - 1]} {anno}.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] divide-y divide-line">
          {lezioni.map((lz) => (
            <div key={lz.id} className="px-5 py-4 space-y-1">
              <p className="text-sm font-semibold text-ink">
                {lz.fields.DATA ? formatDateIT(lz.fields.DATA) : "Data sconosciuta"}
                {lz.fields.TIPO_SESSIONE && (
                  <span className="ml-2 text-xs font-normal text-ink-muted">{lz.fields.TIPO_SESSIONE}</span>
                )}
              </p>
              {lz.fields.ATTIVITA_SVOLTE && (
                <p className="text-sm text-ink">{lz.fields.ATTIVITA_SVOLTE}</p>
              )}
              {lz.fields.NOTE_ATTIVITA && (
                <details>
                  <summary className="text-xs text-ink-muted cursor-pointer hover:text-navy-700">
                    Note del maestro
                  </summary>
                  <p className="text-sm text-ink-muted mt-1">{lz.fields.NOTE_ATTIVITA}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
