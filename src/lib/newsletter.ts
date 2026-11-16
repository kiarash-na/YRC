import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Newsletter operations on Resend — server-only (never import from client
 * components). Shared by the admin Newsletter tab (server actions) and the
 * admin Agent's tools. Callers are responsible for requireAdmin().
 *
 * Model:
 *  - `newsletter_subscribers` (Supabase) is where sign-ups land (website
 *    form, RSVPs). It is the source of truth for WHO signed up.
 *  - Resend keeps the sending list: contacts in one segment (default
 *    "YRC Newsletter"), plus each contact's `unsubscribed` flag — Resend
 *    manages unsubscribes via {{{RESEND_UNSUBSCRIBE_URL}}} in broadcasts.
 *  - syncSubscribers() pushes DB sign-ups into that segment.
 *
 * Every function returns plain JSON-safe data and throws NewsletterError
 * with a readable message on failure.
 */

export class NewsletterError extends Error {}

const DEFAULT_FROM = "Yas Rise <news@mail.yasrise.run>";
const DEFAULT_SEGMENT_NAME = "YRC Newsletter";

export function newsletterConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function newsletterFrom(): string {
  return process.env.RESEND_NEWSLETTER_FROM || DEFAULT_FROM;
}

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new NewsletterError("RESEND_API_KEY is not set on the server.");
  return new Resend(key);
}

/** Unwrap Resend's { data, error } envelope. */
function unwrap<T>(
  res: { data: T | null; error: { message: string } | null },
  what: string,
): T {
  if (res.error || res.data == null) {
    throw new NewsletterError(`${what} failed: ${res.error?.message ?? "no data"}`);
  }
  return res.data;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function normalizeEmail(email: string): string {
  const value = email.trim().toLowerCase();
  if (!EMAIL_RE.test(value)) throw new NewsletterError(`Invalid email: ${email}`);
  return value;
}

/** Resend's default rate limit is a few requests/second — pace bulk loops. */
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Segment (the sending list)
// ---------------------------------------------------------------------------

let cachedSegmentId: string | null = null;

/**
 * The newsletter segment id: RESEND_SEGMENT_ID if set, else the segment
 * named "YRC Newsletter" — created on first use when `create` is true.
 */
export async function getSegmentId(create = false): Promise<string | null> {
  if (process.env.RESEND_SEGMENT_ID) return process.env.RESEND_SEGMENT_ID;
  if (cachedSegmentId) return cachedSegmentId;
  const resend = client();
  const list = unwrap(await resend.segments.list({ limit: 100 }), "List segments");
  const found = list.data.find((s) => s.name === DEFAULT_SEGMENT_NAME);
  if (found) return (cachedSegmentId = found.id);
  if (!create) return null;
  const created = unwrap(
    await resend.segments.create({ name: DEFAULT_SEGMENT_NAME }),
    "Create segment",
  );
  return (cachedSegmentId = created.id);
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export async function getOverview() {
  const resend = client();
  const admin = createAdminClient();
  const [domains, segmentId, dbCount, metrics] = await Promise.all([
    resend.domains.list(),
    getSegmentId(false),
    admin.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    resend.emails.metrics({}),
  ]);

  let contacts: { total: number; unsubscribed: number; more: boolean } | null = null;
  if (segmentId) {
    const page = unwrap(
      await resend.contacts.list({ segmentId, limit: 100 }),
      "List contacts",
    );
    contacts = {
      total: page.data.length,
      unsubscribed: page.data.filter((c) => c.unsubscribed).length,
      more: page.has_more,
    };
  }

  return {
    from: newsletterFrom(),
    domains: unwrap(domains, "List domains").data.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
    })),
    segment: segmentId ? { id: segmentId, name: DEFAULT_SEGMENT_NAME } : null,
    subscribersInDatabase: dbCount.count ?? 0,
    contacts,
    last7Days: metrics.error ? null : metrics.data?.totals ?? null,
  };
}

export async function verifyDomain(domainId: string) {
  unwrap(await client().domains.verify(domainId), "Verify domain");
  return { verifying: domainId };
}

// ---------------------------------------------------------------------------
// Subscribers / contacts
// ---------------------------------------------------------------------------

export async function listSubscribers() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("email, first_name, source, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new NewsletterError(`List subscribers failed: ${error.message}`);

  const segmentId = await getSegmentId(false);
  const contacts = new Map<string, { unsubscribed: boolean }>();
  if (segmentId) {
    const resend = client();
    let after: string | undefined;
    for (let i = 0; i < 20; i++) {
      const page = unwrap(
        await resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) }),
        "List contacts",
      );
      for (const c of page.data) contacts.set(c.email.toLowerCase(), { unsubscribed: c.unsubscribed });
      if (!page.has_more || page.data.length === 0) break;
      after = page.data[page.data.length - 1].id;
    }
  }

  const rows = (data ?? []).map((s) => {
    const contact = contacts.get(s.email.toLowerCase());
    return {
      email: s.email,
      firstName: s.first_name,
      source: s.source,
      createdAt: s.created_at,
      inResend: Boolean(contact),
      unsubscribed: contact?.unsubscribed ?? false,
    };
  });
  return { subscribers: rows, notSynced: rows.filter((r) => !r.inResend).length };
}

/** Add a contact to the segment (create, or attach an existing contact). */
async function upsertContact(resend: Resend, segmentId: string, email: string, firstName: string) {
  const created = await resend.contacts.create({
    email,
    ...(firstName ? { firstName } : {}),
    segments: [{ id: segmentId }],
  });
  if (!created.error) return;
  // Already a contact (in another segment or previously removed from ours):
  // attach it to the newsletter segment instead.
  const added = await resend.contacts.segments.add({ email, segmentId });
  if (added.error) {
    throw new NewsletterError(`Add ${email} failed: ${created.error.message}; ${added.error.message}`);
  }
}

/** Push every DB subscriber that isn't in the Resend segment yet. */
export async function syncSubscribers() {
  const { subscribers } = await listSubscribers();
  const missing = subscribers.filter((s) => !s.inResend);
  if (missing.length === 0) return { added: 0, failed: [] as string[] };

  const resend = client();
  const segmentId = (await getSegmentId(true))!;
  let added = 0;
  const failed: string[] = [];
  for (const s of missing.slice(0, 200)) {
    try {
      await upsertContact(resend, segmentId, s.email, s.firstName);
      added++;
    } catch (error) {
      failed.push(`${s.email}: ${(error as Error).message}`);
    }
    await pause(300);
  }
  return { added, failed, remaining: Math.max(0, missing.length - 200) };
}

/** Admin-added subscriber: saved in the DB and added to Resend. */
export async function addSubscriber(emailInput: string, firstName = "") {
  const email = normalizeEmail(emailInput);
  const name = firstName.trim().slice(0, 100);
  const admin = createAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .insert({ email, first_name: name, source: "admin" });
  if (error && error.code !== "23505") {
    throw new NewsletterError(`Save subscriber failed: ${error.message}`);
  }
  const segmentId = (await getSegmentId(true))!;
  await upsertContact(client(), segmentId, email, name);
  return { email, added: true };
}

/** Mark a contact unsubscribed (or resubscribe). Keeps the DB row. */
export async function setUnsubscribed(emailInput: string, unsubscribed: boolean) {
  const email = normalizeEmail(emailInput);
  unwrap(await client().contacts.update({ email, unsubscribed }), "Update contact");
  return { email, unsubscribed };
}

/** Remove completely: DB row + Resend contact. */
export async function removeSubscriber(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const admin = createAdminClient();
  const { error } = await admin.from("newsletter_subscribers").delete().eq("email", email);
  if (error) throw new NewsletterError(`Delete subscriber failed: ${error.message}`);
  const removed = await client().contacts.remove({ email });
  // A subscriber that was never synced has no Resend contact — that's fine.
  return { email, removedFromResend: !removed.error };
}

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export async function listBroadcasts() {
  const page = unwrap(await client().broadcasts.list({ limit: 50 }), "List broadcasts");
  return page.data.map((b) => ({
    id: b.id,
    name: b.name,
    status: b.status,
    createdAt: b.created_at,
    scheduledAt: b.scheduled_at,
    sentAt: b.sent_at,
  }));
}

export async function getBroadcast(id: string) {
  const resend = client();
  const broadcast = unwrap(await resend.broadcasts.get(id), "Get broadcast");
  let stats = null;
  if (broadcast.status === "sent") {
    const metrics = await resend.emails.metrics({ broadcastId: [id], startDate: broadcast.sent_at?.slice(0, 10) });
    stats = metrics.error ? null : metrics.data?.totals ?? null;
  }
  return {
    id: broadcast.id,
    name: broadcast.name,
    status: broadcast.status,
    subject: broadcast.subject,
    previewText: broadcast.preview_text,
    from: broadcast.from,
    html: broadcast.html,
    scheduledAt: broadcast.scheduled_at,
    sentAt: broadcast.sent_at,
    stats,
  };
}

export interface BroadcastDraft {
  name?: string;
  subject: string;
  previewText?: string;
  /** HTML body. {{{RESEND_UNSUBSCRIBE_URL}}} is appended if missing. */
  html: string;
}

/** Every broadcast must carry an unsubscribe link (law + deliverability). */
function withUnsubscribe(html: string): string {
  if (html.includes("RESEND_UNSUBSCRIBE_URL")) return html;
  return `${html}
<p style="margin-top:32px;font-size:12px;color:#737373">
  You're receiving this because you joined the Yas Rise Community newsletter.
  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#737373">Unsubscribe</a>
</p>`;
}

function validateDraft(draft: BroadcastDraft) {
  if (!draft.subject?.trim()) throw new NewsletterError("Subject is required.");
  if (!draft.html?.trim()) throw new NewsletterError("Body is required.");
}

export async function createBroadcast(draft: BroadcastDraft) {
  validateDraft(draft);
  const segmentId = (await getSegmentId(true))!;
  const created = unwrap(
    await client().broadcasts.create({
      segmentId,
      from: newsletterFrom(),
      subject: draft.subject.trim(),
      name: draft.name?.trim() || draft.subject.trim(),
      ...(draft.previewText?.trim() ? { previewText: draft.previewText.trim() } : {}),
      html: withUnsubscribe(draft.html),
    }),
    "Create broadcast",
  );
  return { id: created.id, status: "draft" as const };
}

export async function updateBroadcast(id: string, draft: Partial<BroadcastDraft>) {
  const payload: Record<string, string> = {};
  if (draft.subject?.trim()) payload.subject = draft.subject.trim();
  if (draft.name?.trim()) payload.name = draft.name.trim();
  if (draft.previewText !== undefined) payload.previewText = draft.previewText.trim();
  if (draft.html?.trim()) payload.html = withUnsubscribe(draft.html);
  unwrap(await client().broadcasts.update(id, payload), "Update broadcast");
  return { id, updated: Object.keys(payload) };
}

/** Send now, or schedule (ISO 8601 or natural language, e.g. "in 1 hour"). */
export async function sendBroadcast(id: string, scheduledAt?: string) {
  unwrap(
    await client().broadcasts.send(id, scheduledAt ? { scheduledAt } : undefined),
    "Send broadcast",
  );
  return { id, status: scheduledAt ? `scheduled (${scheduledAt})` : "sending" };
}

export async function cancelBroadcast(id: string) {
  unwrap(await client().broadcasts.cancel(id), "Cancel broadcast");
  return { id, status: "draft" };
}

export async function duplicateBroadcast(id: string) {
  const copy = unwrap(await client().broadcasts.duplicate(id), "Duplicate broadcast");
  return { id: copy.id, status: "draft" };
}

export async function deleteBroadcast(id: string) {
  unwrap(await client().broadcasts.remove(id), "Delete broadcast");
  return { id, deleted: true };
}

// ---------------------------------------------------------------------------
// Individual emails, metrics, suppressions
// ---------------------------------------------------------------------------

export async function listEmails(limit = 25) {
  const page = unwrap(await client().emails.list({ limit }), "List emails");
  return page.data.map((e) => ({
    id: e.id,
    to: e.to,
    subject: e.subject,
    lastEvent: e.last_event,
    createdAt: e.created_at,
    scheduledAt: e.scheduled_at,
  }));
}

/** One-off email (also used for "send test" of a draft). */
export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const to = normalizeEmail(input.to);
  if (!input.subject?.trim() || !input.html?.trim()) {
    throw new NewsletterError("Subject and body are required.");
  }
  const sent = unwrap(
    await client().emails.send({
      from: newsletterFrom(),
      to,
      subject: input.subject.trim(),
      html: input.html,
    }),
    "Send email",
  );
  return { id: sent.id, to };
}

export async function cancelEmail(id: string) {
  unwrap(await client().emails.cancel(id), "Cancel email");
  return { id, canceled: true };
}

export async function getMetrics(startDate?: string, endDate?: string) {
  const metrics = unwrap(
    await client().emails.metrics({
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    "Get metrics",
  );
  return { from: metrics.start_date, to: metrics.end_date, totals: metrics.totals };
}

export async function listSuppressions() {
  const page = unwrap(await client().suppressions.list({ limit: 100 }), "List suppressions");
  return page.data.map((s) => ({
    email: s.email,
    origin: s.origin,
    createdAt: s.created_at,
  }));
}

export async function removeSuppression(emailInput: string) {
  const email = normalizeEmail(emailInput);
  unwrap(await client().suppressions.remove(email), "Remove suppression");
  return { email, removed: true };
}
