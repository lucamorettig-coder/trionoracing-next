import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") redirect("/portale");
}

export async function getAdminEmail(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "unknown";
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses[0]?.emailAddress ?? "unknown";
}
