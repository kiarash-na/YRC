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
