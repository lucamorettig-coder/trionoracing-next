export const runtime = "nodejs";

import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  createGenitore,
  getGenitoreByEmail,
  updateGenitoreAuthUserId,
} from "@/lib/airtable-portale";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("[clerk-webhook] CLERK_WEBHOOK_SECRET non configurato");
  }

  const rawBody = await req.text();
  const svixId = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  let evt: ClerkUserCreatedEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type !== "user.created") {
    return Response.json({ ok: true });
  }

  const clerkUserId = evt.data.id;
  const email = evt.data.email_addresses[0]?.email_address ?? "";
  const firstName = evt.data.first_name ?? "";
  const lastName = evt.data.last_name ?? "";

  let ruolo: string = "GENITORE";

  const existing = await getGenitoreByEmail(email);
  if (existing) {
    await updateGenitoreAuthUserId(existing.id, clerkUserId);
    ruolo = existing.fields.RUOLO ?? "GENITORE";
  } else {
    await createGenitore({
      NOME_GENITORE: firstName,
      COGNOME_GENITORE: lastName,
      EMAIL_GENITORE: email,
      AUTH_USER_ID: clerkUserId,
      RUOLO: "GENITORE",
      FLAG_PRIVACY: false,
    });
  }

  console.log("[clerk-webhook] user.created:", email, "→ ruolo:", ruolo);

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: ruolo },
  });

  return Response.json({ ok: true });
}
