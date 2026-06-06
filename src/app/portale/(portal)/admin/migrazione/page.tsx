import { Users, UserCheck, UserX } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KPICard } from "@/components/admin/KPICard";
import {
  getKPIMigrazione,
  getUtentiMigrati,
  parseMigrazioneFilters,
} from "@/lib/airtable-admin";
import { MigrazioneTable } from "./MigrazioneTable";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/migrazione] fetch failed:", err);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MigrazioneAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else if (v !== undefined) params.set(k, v);
  }
  const filters = parseMigrazioneFilters(params);

  const kpi = await safe(() => getKPIMigrazione());
  const utenti = (await safe(() => getUtentiMigrati(filters))) ?? [];

  const dash = (v: number | undefined) => (v == null ? "—" : v);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Migrazione utenti"
        subtitle="Stato della migrazione degli account dal portale legacy Supabase a Clerk."
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Migrati totali"
          value={dash(kpi?.migratiTotali)}
          icon={<Users size={20} />}
          subline="Account taggati con LEGACY_SUPABASE_ID dallo script di import."
        />
        <KPICard
          label="Con utente Clerk creato"
          value={dash(kpi?.conLogin)}
          valueTone="success"
          icon={<UserCheck size={20} />}
          subline="AUTH_USER_ID collegato dal webhook in cascade all'import (proxy, non login reale)."
        />
        <KPICard
          label="Mai loggati post-migrazione"
          value={dash(kpi?.maiLoggati)}
          valueTone="warning"
          icon={<UserX size={20} />}
          subline="Migrati senza AUTH_USER_ID — record Clerk non ancora collegato."
        />
      </div>

      <div className="mt-8">
        <MigrazioneTable
          utenti={utenti}
          initial={filters}
          total={utenti.length}
        />
      </div>
    </div>
  );
}
