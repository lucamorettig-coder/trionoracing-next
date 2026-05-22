"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type TabId = "anagrafica" | "certificato" | "foto" | "iscrizioni" | "gare" | "diario";

const TABS: { id: TabId; label: string }[] = [
  { id: "anagrafica", label: "Anagrafica" },
  { id: "certificato", label: "Certificato" },
  { id: "foto", label: "Foto" },
  { id: "iscrizioni", label: "Iscrizioni" },
  { id: "gare", label: "Gare" },
  { id: "diario", label: "Diario" },
];

function readHashTab(): TabId {
  if (typeof window === "undefined") return "anagrafica";
  const hash = window.location.hash.replace("#", "") as TabId;
  return TABS.some((t) => t.id === hash) ? hash : "anagrafica";
}

interface Props {
  tabs: Record<TabId, React.ReactNode>;
}

export default function ProfiloFiglioTabs({ tabs }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(readHashTab);

  function handleTab(id: TabId) {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="bg-white border-b border-line sticky top-[88px] z-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex overflow-x-auto scrollbar-none -mb-px gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className={cn(
                  "shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-navy-700 text-navy-700"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-line",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        {tabs[activeTab]}
      </div>
    </div>
  );
}
