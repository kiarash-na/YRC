"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";

/**
 * Admin server actions. Every action re-verifies the caller via
 * requireAdmin() before using the service-role client. Actions return void
 * so they can be bound directly to plain <form action={…}> elements;
 * failures are logged server-side and surface as a no-op.
 */

function str(formData: FormData, key: string, max = 500): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function revalidateEventPaths(slug?: string) {
  revalidatePath("/events");
  revalidatePath("/events/all");
  if (slug) revalidatePath(`/events/${slug}`);
  revalidatePath("/admin/events");
}

// --------------------------------------------------------------------------
// Events
// --------------------------------------------------------------------------

function eventPayload(formData: FormData) {
  const endDate = str(formData, "end_date");
  const recurrence = str(formData, "recurrence", 20);
  return {
    slug: str(formData, "slug", 200),
    title: str(formData, "title", 200),
    excerpt: str(formData, "excerpt", 500),
    cover: str(formData, "cover", 500),
    event_date: str(formData, "event_date", 10),
    end_date: endDate || null,
    location: str(formData, "location", 200),
    city: str(formData, "city", 100),
    category: str(formData, "category", 20),
    registration_url: str(formData, "registration_url", 500) || null,
    recurrence: recurrence === "weekly" ? "weekly" : null,
    body: str(formData, "body", 100_000),
  };
}

export async function createEvent(formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const payload = eventPayload(formData);
  const { error } = await admin.from("events").insert(payload);
  if (error) {
    console.error("createEvent failed:", error.message);
    return;
  }

  // every event gets a QR check-in token
  const { data: event } = await admin
    .from("events")
    .select("id")
    .eq("slug", payload.slug)
    .single();
  if (event) await admin.from("event_checkin_tokens").insert({ event_id: event.id });

  revalidateEventPaths(payload.slug);
  redirect("/admin/events");
}

export async function updateEvent(eventId: string, formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const payload = eventPayload(formData);
  const { error } = await admin.from("events").update(payload).eq("id", eventId);
  if (error) {
    console.error("updateEvent failed:", error.message);
    return;
  }
  revalidateEventPaths(payload.slug);
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { admin } = await requireAdmin();
  const { data: event } = await admin.from("events").select("slug").eq("id", eventId).single();
  const { error } = await admin.from("events").delete().eq("id", eventId);
  if (error) {
    console.error("deleteEvent failed:", error.message);
    return;
  }
  revalidateEventPaths(event?.slug);
  redirect("/admin/events");
}

/**
 * Clone an event row (all content fields; NOT QR tokens or attendance).
 * The copy gets a "-copy" slug suffix (numbered if taken) and one fresh QR
 * check-in token, matching createEvent behaviour. Dates are copied as-is —
 * the admin edits them afterwards.
 */
export async function duplicateEvent(eventId: string): Promise<void> {
  const { admin } = await requireAdmin();
  const { data: source, error: readError } = await admin
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (readError || !source) {
    console.error("duplicateEvent failed:", readError?.message ?? "event not found");
    return;
  }

  // find a free slug: <slug>-copy, <slug>-copy-2, …
  const baseSlug = `${source.slug}-copy`.slice(0, 190);
  let slug = baseSlug;
  for (let i = 2; ; i += 1) {
    const { data: clash } = await admin.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  const rest: Record<string, unknown> = { ...source };
  delete rest.id;
  delete rest.created_at;
  delete rest.updated_at;
  const { data: created, error } = await admin
    .from("events")
    .insert({ ...rest, slug, title: `${source.title} (copy)`.slice(0, 200), is_past: false })
    .select("id, slug")
    .single();
  if (error || !created) {
    console.error("duplicateEvent failed:", error?.message);
    return;
  }

  await admin.from("event_checkin_tokens").insert({ event_id: created.id });
  revalidateEventPaths(created.slug);
  redirect(`/admin/events/${created.id}`);
}

// --------------------------------------------------------------------------
// QR check-in tokens
// --------------------------------------------------------------------------

export async function setCheckinTokenActive(tokenId: string, isActive: boolean): Promise<void> {
  const { admin } = await requireAdmin();
  await admin.from("event_checkin_tokens").update({ is_active: isActive }).eq("id", tokenId);
  revalidatePath("/admin/events");
}

export async function createCheckinToken(eventId: string): Promise<void> {
  const { admin } = await requireAdmin();
  await admin.from("event_checkin_tokens").insert({ event_id: eventId });
  revalidatePath("/admin/events");
}

// --------------------------------------------------------------------------
// Scoring
// --------------------------------------------------------------------------

export async function updateScoreAction(key: string, formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const points = Number(formData.get("points"));
  if (!Number.isInteger(points) || points < 0) return;

  const { error } = await admin
    .from("score_actions")
    .update({ points })
    .eq("key", key);
  if (error) console.error("updateScoreAction failed:", error.message);
  revalidatePath("/admin/scoring");
}

export async function createScoreAction(formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const key = str(formData, "key", 50).toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const points = Number(formData.get("points"));
  const description = str(formData, "description", 300);
  if (!key || !Number.isInteger(points) || points < 0) return;

  const { error } = await admin
    .from("score_actions")
    .insert({ key, points, description });
  if (error) console.error("createScoreAction failed:", error.message);
  revalidatePath("/admin/scoring");
}

// --------------------------------------------------------------------------
// Admin seats (the DB trigger enforces max 3)
// --------------------------------------------------------------------------

export async function addAdminSeat(formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const email = str(formData, "email", 200).toLowerCase();
  if (!email || !email.includes("@")) return;

  const { error } = await admin.from("admins").insert({ email });
  if (error) console.error("addAdminSeat failed:", error.message);
  revalidatePath("/admin/admins");
}

export async function linkAdminSeat(seatId: string, formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const athleteId = Number(str(formData, "strava_athlete_id", 20));
  if (!Number.isInteger(athleteId) || athleteId <= 0) return;

  const { error } = await admin
    .from("admins")
    .update({ strava_athlete_id: athleteId })
    .eq("id", seatId);
  if (error) console.error("linkAdminSeat failed:", error.message);
  revalidatePath("/admin/admins");
}

export async function removeAdminSeat(seatId: string): Promise<void> {
  const { admin, seat: mySeat } = await requireAdmin();

  // never let an admin remove the seat they are currently using
  if (seatId === mySeat.id) return;

  const { error } = await admin.from("admins").delete().eq("id", seatId);
  if (error) console.error("removeAdminSeat failed:", error.message);
  revalidatePath("/admin/admins");
}
