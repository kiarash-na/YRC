import { revalidatePath } from "next/cache";

import { EVENT_CATEGORIES } from "@/lib/content-shared";
import * as newsletter from "@/lib/newsletter";
import { renderNewsletterHtml, withoutUnsubscribePlaceholder } from "@/lib/newsletter-template";
import type { LoopTool } from "@/lib/agent/loop";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Tools for the admin Agent. Server-only — executors use the service-role
 * client, so they may only run inside an action that passed requireAdmin().
 *
 * `mutates: true` tools never run on the model's say-so alone: the agent
 * loop pauses and the admin confirms each call in the UI (see agent action).
 * Read-only tools run immediately.
 */

type Input = Record<string, unknown>;

/** JSON-schema tool declaration (provider-neutral). */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface AgentTool {
  definition: ToolDefinition;
  mutates: boolean;
  /** One line shown on the approval card. */
  summarize: (input: Input) => string;
  run: (input: Input, ctx: ToolContext) => Promise<unknown>;
}

export interface ToolContext {
  /** The calling admin's seat (for "don't remove yourself"). */
  seatId: string;
}

export class ToolInputError extends Error {}

// ---------------------------------------------------------------------------
// input helpers
// ---------------------------------------------------------------------------

function str(input: Input, key: string, max = 500, required = false): string | undefined {
  const value = input[key];
  if (value == null || value === "") {
    if (required) throw new ToolInputError(`"${key}" is required.`);
    return undefined;
  }
  if (typeof value !== "string") throw new ToolInputError(`"${key}" must be a string.`);
  return value.trim().slice(0, max);
}

function num(input: Input, key: string): number | undefined {
  const value = input[key];
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new ToolInputError(`"${key}" must be a number.`);
  return n;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_RE = /^[a-z0-9-]+$/;

function revalidateEventPaths(slug?: string) {
  for (const path of ["/", "/events", "/events/all", "/events/past", "/admin/events"]) {
    revalidatePath(path);
  }
  if (slug) revalidatePath(`/events/${slug}`);
}

async function eventIdBySlug(slug: string): Promise<{ id: string; slug: string }> {
  const { data, error } = await createAdminClient()
    .from("events")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new ToolInputError(`No event with slug "${slug}". Use list_events to find it.`);
  return data;
}

/** Event fields shared by create/update; only keys present in input. */
const EVENT_FIELD_SCHEMA = {
  title: { type: "string" },
  slug: { type: "string", description: "URL slug, lowercase a-z 0-9 and dashes" },
  excerpt: { type: "string", description: "One or two sentence summary" },
  cover: { type: "string", description: "ImageKit path, e.g. /YRC/Community/IMG_2469.JPG" },
  event_date: { type: "string", description: "YYYY-MM-DD" },
  end_date: { type: ["string", "null"], description: "YYYY-MM-DD for multi-day events" },
  location: { type: "string" },
  city: { type: "string" },
  category: { type: "string", enum: [...EVENT_CATEGORIES] },
  registration_url: { type: ["string", "null"], description: "External sign-up link, if any" },
  recurrence: { type: ["string", "null"], enum: ["weekly", null] },
  start_time: { type: ["string", "null"], description: "HH:MM, local time" },
  duration_minutes: { type: ["integer", "null"] },
  meeting_point: { type: ["string", "null"] },
  finish_point: { type: ["string", "null"] },
  distance_km: { type: ["number", "null"] },
  elevation_gain_m: { type: ["integer", "null"] },
  route_notes: { type: ["string", "null"] },
  what_to_bring: { type: ["string", "null"] },
  coach_tips: { type: ["string", "null"] },
  body: { type: "string", description: "Event description in Markdown/MDX" },
} as const;

function eventFields(input: Input): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(input, k);
  for (const key of ["title", "excerpt", "cover", "location", "city"]) {
    if (has(key)) out[key] = str(input, key, key === "excerpt" ? 500 : 200, true);
  }
  if (has("slug")) {
    const slug = str(input, "slug", 200, true)!;
    if (!SLUG_RE.test(slug)) throw new ToolInputError("slug may only contain a-z, 0-9 and dashes.");
    out.slug = slug;
  }
  for (const key of ["event_date", "end_date"]) {
    if (!has(key)) continue;
    const value = str(input, key, 10, key === "event_date") ?? null;
    if (value && !DATE_RE.test(value)) throw new ToolInputError(`${key} must be YYYY-MM-DD.`);
    out[key] = value;
  }
  if (has("category")) {
    const category = str(input, "category", 20, true)!;
    if (!(EVENT_CATEGORIES as readonly string[]).includes(category)) {
      throw new ToolInputError(`category must be one of: ${EVENT_CATEGORIES.join(", ")}.`);
    }
    out.category = category;
  }
  if (has("recurrence")) out.recurrence = input.recurrence === "weekly" ? "weekly" : null;
  if (has("start_time")) {
    const t = str(input, "start_time", 5) ?? null;
    if (t && !TIME_RE.test(t)) throw new ToolInputError("start_time must be HH:MM.");
    out.start_time = t;
  }
  for (const key of ["duration_minutes", "elevation_gain_m"]) {
    if (has(key)) {
      const n = num(input, key);
      out[key] = n == null ? null : Math.round(n);
    }
  }
  if (has("distance_km")) {
    const n = num(input, "distance_km");
    if (n != null && n <= 0) throw new ToolInputError("distance_km must be > 0.");
    out.distance_km = n ?? null;
  }
  for (const key of ["registration_url", "meeting_point", "finish_point", "route_notes", "what_to_bring", "coach_tips"]) {
    if (has(key)) out[key] = str(input, key, 500) ?? null;
  }
  if (has("body")) out.body = str(input, "body", 100_000) ?? "";
  return out;
}

const obj = (
  properties: Record<string, unknown>,
  required: string[] = [],
): Record<string, unknown> => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

// ---------------------------------------------------------------------------
// tools
// ---------------------------------------------------------------------------

const tools: AgentTool[] = [
  // ----- events (read) -----
  {
    mutates: false,
    definition: {
      name: "list_events",
      description: "List events (newest first for past, soonest first otherwise) with slug, title, dates, city, category and recurrence.",
      input_schema: obj({
        scope: { type: "string", enum: ["upcoming", "past", "all"], description: "Default upcoming" },
        limit: { type: "integer", description: "Max rows, default 25" },
      }),
    },
    summarize: () => "List events",
    run: async (input) => {
      const scope = input.scope === "past" || input.scope === "all" ? input.scope : "upcoming";
      let query = createAdminClient()
        .from("events")
        .select("slug, title, event_date, end_date, start_time, city, category, is_past, recurrence, registration_url")
        .order("event_date", { ascending: scope !== "past" })
        .limit(Math.min(Number(input.limit) || 25, 100));
      if (scope !== "all") query = query.eq("is_past", scope === "past");
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
  },
  {
    mutates: false,
    definition: {
      name: "get_event",
      description: "Full details of one event (all fields incl. body), plus whether it has a GPX route and its check-in token count.",
      input_schema: obj({ slug: { type: "string" } }, ["slug"]),
    },
    summarize: (i) => `Read event ${i.slug}`,
    run: async (input) => {
      const { id } = await eventIdBySlug(str(input, "slug", 200, true)!);
      const { data, error } = await createAdminClient().from("events").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      const { route_line, ...rest } = data as Record<string, unknown>;
      return { ...rest, has_route: Array.isArray(route_line) && route_line.length > 1 };
    },
  },
  {
    mutates: false,
    definition: {
      name: "list_event_people",
      description: "Who registered for an event and who checked in (first/last names), with counts.",
      input_schema: obj({ slug: { type: "string" } }, ["slug"]),
    },
    summarize: (i) => `List people for ${i.slug}`,
    run: async (input) => {
      const { id } = await eventIdBySlug(str(input, "slug", 200, true)!);
      const admin = createAdminClient();
      const [reg, att] = await Promise.all([
        admin.from("event_registrations").select("created_at, profiles(first_name, last_name)").eq("event_id", id),
        admin.from("event_attendance").select("checked_in_at, profiles(first_name, last_name)").eq("event_id", id),
      ]);
      if (reg.error) throw new Error(reg.error.message);
      if (att.error) throw new Error(att.error.message);
      const name = (p: unknown) => {
        const profile = (Array.isArray(p) ? p[0] : p) as { first_name?: string; last_name?: string } | null;
        return [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "(no name)";
      };
      return {
        registered: reg.data.map((r) => ({ name: name(r.profiles), at: r.created_at })),
        checked_in: att.data.map((a) => ({ name: name(a.profiles), at: a.checked_in_at })),
      };
    },
  },

  // ----- events (write) -----
  {
    mutates: true,
    definition: {
      name: "create_event",
      description:
        "Create a new event (also creates its QR check-in token). Required: title, slug, excerpt, cover, event_date, location, city, category. Ask the admin for anything missing rather than inventing it.",
      input_schema: obj(EVENT_FIELD_SCHEMA, ["title", "slug", "excerpt", "cover", "event_date", "location", "city", "category"]),
    },
    summarize: (i) => `Create event "${i.title}" on ${i.event_date} (${i.slug})`,
    run: async (input) => {
      const fields = eventFields(input);
      const admin = createAdminClient();
      const { data, error } = await admin.from("events").insert({ body: "", ...fields }).select("id, slug").single();
      if (error) throw new Error(error.message);
      await admin.from("event_checkin_tokens").insert({ event_id: data.id });
      revalidateEventPaths(data.slug);
      return { created: data.slug, url: `/events/${data.slug}` };
    },
  },
  {
    mutates: true,
    definition: {
      name: "update_event",
      description: "Change fields of an existing event. Pass only the fields to change (`changes`). Use get_event first to see current values.",
      input_schema: obj(
        {
          slug: { type: "string", description: "Current slug of the event" },
          changes: { type: "object", properties: EVENT_FIELD_SCHEMA, additionalProperties: false },
        },
        ["slug", "changes"],
      ),
    },
    summarize: (i) => `Update event ${i.slug}: ${Object.keys((i.changes as Input) ?? {}).join(", ")}`,
    run: async (input) => {
      const { id, slug } = await eventIdBySlug(str(input, "slug", 200, true)!);
      const fields = eventFields((input.changes as Input) ?? {});
      if (Object.keys(fields).length === 0) throw new ToolInputError("No changes given.");
      const { error } = await createAdminClient()
        .from("events")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
      revalidateEventPaths(slug);
      if (fields.slug && fields.slug !== slug) revalidateEventPaths(fields.slug as string);
      return { updated: (fields.slug as string) ?? slug, fields: Object.keys(fields) };
    },
  },
  {
    mutates: true,
    definition: {
      name: "duplicate_event",
      description: "Copy an event (all content, incl. route) to a new slug and date — e.g. to repeat an event. Also creates a fresh QR token.",
      input_schema: obj(
        {
          slug: { type: "string", description: "Event to copy" },
          new_slug: { type: "string" },
          new_event_date: { type: "string", description: "YYYY-MM-DD" },
          new_title: { type: "string", description: "Optional; defaults to the original title" },
        },
        ["slug", "new_slug", "new_event_date"],
      ),
    },
    summarize: (i) => `Duplicate ${i.slug} → ${i.new_slug} on ${i.new_event_date}`,
    run: async (input) => {
      const { id } = await eventIdBySlug(str(input, "slug", 200, true)!);
      const newSlug = str(input, "new_slug", 200, true)!;
      const newDate = str(input, "new_event_date", 10, true)!;
      if (!SLUG_RE.test(newSlug)) throw new ToolInputError("new_slug may only contain a-z, 0-9 and dashes.");
      if (!DATE_RE.test(newDate)) throw new ToolInputError("new_event_date must be YYYY-MM-DD.");
      const admin = createAdminClient();
      const { data: source, error } = await admin.from("events").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      const rest: Record<string, unknown> = { ...source };
      for (const key of ["id", "created_at", "updated_at"]) delete rest[key];
      const shift = source.end_date
        ? Math.round((Date.parse(source.end_date) - Date.parse(source.event_date)) / 86_400_000)
        : null;
      const endDate =
        shift == null ? null : new Date(Date.parse(newDate) + shift * 86_400_000).toISOString().slice(0, 10);
      const { data: created, error: insertError } = await admin
        .from("events")
        .insert({
          ...rest,
          slug: newSlug,
          event_date: newDate,
          end_date: endDate,
          title: str(input, "new_title", 200) ?? source.title,
          is_past: false,
        })
        .select("id, slug")
        .single();
      if (insertError) throw new Error(insertError.message);
      await admin.from("event_checkin_tokens").insert({ event_id: created.id });
      revalidateEventPaths(created.slug);
      return { created: created.slug, url: `/events/${created.slug}` };
    },
  },
  {
    mutates: true,
    definition: {
      name: "delete_event",
      description: "Permanently delete an event with its registrations, check-ins and QR tokens. Irreversible.",
      input_schema: obj({ slug: { type: "string" } }, ["slug"]),
    },
    summarize: (i) => `DELETE event ${i.slug} (irreversible)`,
    run: async (input) => {
      const { id, slug } = await eventIdBySlug(str(input, "slug", 200, true)!);
      const { error } = await createAdminClient().from("events").delete().eq("id", id);
      if (error) throw new Error(error.message);
      revalidateEventPaths(slug);
      return { deleted: slug };
    },
  },

  // ----- members & scoring -----
  {
    mutates: false,
    definition: {
      name: "list_members",
      description: "Members with name, city, Strava link status, total points and leaderboard opt-out. Optional name search.",
      input_schema: obj({
        search: { type: "string", description: "Matches first or last name" },
        limit: { type: "integer", description: "Default 50" },
      }),
    },
    summarize: () => "List members",
    run: async (input) => {
      const admin = createAdminClient();
      let query = admin
        .from("profiles")
        .select("id, first_name, last_name, city, country, strava_athlete_id, leaderboard_opt_out, created_at")
        .order("created_at", { ascending: false })
        .limit(Math.min(Number(input.limit) || 50, 200));
      const search = str(input, "search", 60)?.replace(/[%,()]/g, "");
      if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      const [{ data, error }, scores] = await Promise.all([
        query,
        admin.from("profile_scores").select("profile_id, total_points"),
      ]);
      if (error) throw new Error(error.message);
      const points = new Map((scores.data ?? []).map((s) => [s.profile_id, s.total_points]));
      return data.map((p) => ({
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "(no name)",
        city: p.city,
        country: p.country,
        strava_linked: p.strava_athlete_id != null,
        points: points.get(p.id) ?? 0,
        hidden_from_leaderboard: p.leaderboard_opt_out,
        joined: p.created_at,
      }));
    },
  },
  {
    mutates: false,
    definition: {
      name: "get_community_stats",
      description: "Community totals (members, strides, check-ins) and the public leaderboard top 10.",
      input_schema: obj({}),
    },
    summarize: () => "Read community stats",
    run: async () => {
      const admin = createAdminClient();
      const [stats, board] = await Promise.all([
        admin.rpc("get_community_stats"),
        admin.rpc("get_leaderboard", { limit_count: 10 }),
      ]);
      return { stats: stats.data, leaderboard: board.data };
    },
  },
  {
    mutates: false,
    definition: {
      name: "list_score_actions",
      description: "The points menu: each action key, points, description, active flag.",
      input_schema: obj({}),
    },
    summarize: () => "List score actions",
    run: async () => {
      const { data, error } = await createAdminClient().from("score_actions").select("*").order("key");
      if (error) throw new Error(error.message);
      return data;
    },
  },
  {
    mutates: true,
    definition: {
      name: "set_score_action",
      description: "Create a score action or change its points/description/active flag. Affects future awards only.",
      input_schema: obj(
        {
          key: { type: "string", description: "snake_case action key" },
          points: { type: "integer" },
          description: { type: "string" },
          is_active: { type: "boolean" },
        },
        ["key"],
      ),
    },
    summarize: (i) =>
      `Score action ${i.key}: ${[
        i.points != null && `${i.points} pts`,
        i.is_active != null && (i.is_active ? "active" : "inactive"),
        i.description != null && "description",
      ]
        .filter(Boolean)
        .join(", ")}`,
    run: async (input) => {
      const key = str(input, "key", 60, true)!;
      if (!/^[a-z0-9_]+$/.test(key)) throw new ToolInputError("key must be snake_case.");
      const row: Record<string, unknown> = { key, updated_at: new Date().toISOString() };
      const points = num(input, "points");
      if (points != null) {
        if (points < 0) throw new ToolInputError("points must be ≥ 0.");
        row.points = Math.round(points);
      }
      if (input.description != null) row.description = str(input, "description", 300) ?? "";
      if (typeof input.is_active === "boolean") row.is_active = input.is_active;
      const admin = createAdminClient();
      const { data: existing } = await admin.from("score_actions").select("key").eq("key", key).maybeSingle();
      if (!existing && row.points == null) throw new ToolInputError("New actions need points.");
      const { error } = existing
        ? await admin.from("score_actions").update(row).eq("key", key)
        : await admin.from("score_actions").insert(row);
      if (error) throw new Error(error.message);
      revalidatePath("/admin/scoring");
      return { key, saved: Object.keys(row).filter((k) => k !== "updated_at") };
    },
  },

  // ----- admins -----
  {
    mutates: false,
    definition: {
      name: "list_admins",
      description: "Admin seats (max 3): email label and whether a Strava athlete is linked.",
      input_schema: obj({}),
    },
    summarize: () => "List admin seats",
    run: async () => {
      const { data, error } = await createAdminClient().from("admins").select("email, strava_athlete_id, created_at");
      if (error) throw new Error(error.message);
      return data.map((a) => ({ email: a.email, strava_linked: a.strava_athlete_id != null, since: a.created_at }));
    },
  },
  {
    mutates: true,
    definition: {
      name: "add_admin",
      description: "Give someone an admin seat by email (max 3 seats). They become admin when they log in with that email.",
      input_schema: obj({ email: { type: "string" } }, ["email"]),
    },
    summarize: (i) => `Add admin seat for ${i.email}`,
    run: async (input) => {
      const email = str(input, "email", 200, true)!.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ToolInputError("Invalid email.");
      const { error } = await createAdminClient().from("admins").insert({ email });
      if (error) throw new Error(error.message);
      revalidatePath("/admin/admins");
      return { added: email };
    },
  },
  {
    mutates: true,
    definition: {
      name: "remove_admin",
      description: "Remove an admin seat by its email. You cannot remove your own seat.",
      input_schema: obj({ email: { type: "string" } }, ["email"]),
    },
    summarize: (i) => `Remove admin seat ${i.email}`,
    run: async (input, ctx) => {
      const email = str(input, "email", 200, true)!.toLowerCase();
      const admin = createAdminClient();
      const { data: seat } = await admin.from("admins").select("id").ilike("email", email).maybeSingle();
      if (!seat) throw new ToolInputError(`No admin seat for ${email}.`);
      if (seat.id === ctx.seatId) throw new ToolInputError("You can't remove your own seat.");
      const { error } = await admin.from("admins").delete().eq("id", seat.id);
      if (error) throw new Error(error.message);
      revalidatePath("/admin/admins");
      return { removed: email };
    },
  },

  // ----- newsletter (read) -----
  {
    mutates: false,
    definition: {
      name: "newsletter_overview",
      description: "Resend status: sending domain, sender, subscriber counts (site vs Resend list), last-7-day email totals.",
      input_schema: obj({}),
    },
    summarize: () => "Read newsletter overview",
    run: () => newsletter.getOverview(),
  },
  {
    mutates: false,
    definition: {
      name: "list_subscribers",
      description: "Newsletter subscribers with sync/unsubscribe status.",
      input_schema: obj({}),
    },
    summarize: () => "List subscribers",
    run: () => newsletter.listSubscribers(),
  },
  {
    mutates: false,
    definition: {
      name: "list_broadcasts",
      description: "Newsletter broadcasts (drafts, scheduled, sent) with ids.",
      input_schema: obj({}),
    },
    summarize: () => "List broadcasts",
    run: () => newsletter.listBroadcasts(),
  },
  {
    mutates: false,
    definition: {
      name: "get_broadcast",
      description: "One broadcast incl. subject and HTML; for sent ones, delivery/open/click stats.",
      input_schema: obj({ id: { type: "string" } }, ["id"]),
    },
    summarize: (i) => `Read broadcast ${i.id}`,
    run: (input) => newsletter.getBroadcast(str(input, "id", 100, true)!),
  },
  {
    mutates: false,
    definition: {
      name: "list_recent_emails",
      description: "Recently sent emails from the domain (login links, tests, one-offs) with delivery status.",
      input_schema: obj({ limit: { type: "integer", description: "Default 20" } }),
    },
    summarize: () => "List recent emails",
    run: (input) => newsletter.listEmails(Math.min(Number(input.limit) || 20, 100)),
  },
  {
    mutates: false,
    definition: {
      name: "get_email_metrics",
      description: "Email totals (delivered, opened, clicked, bounced, rates) for a date range. Defaults to the last 7 days.",
      input_schema: obj({
        start_date: { type: "string", description: "YYYY-MM-DD" },
        end_date: { type: "string", description: "YYYY-MM-DD" },
      }),
    },
    summarize: () => "Read email metrics",
    run: (input) => newsletter.getMetrics(str(input, "start_date", 10), str(input, "end_date", 10)),
  },

  // ----- newsletter (write) -----
  {
    mutates: true,
    definition: {
      name: "sync_subscribers",
      description: "Push website sign-ups that aren't in the Resend list yet into it.",
      input_schema: obj({}),
    },
    summarize: () => "Sync new subscribers to Resend",
    run: () => newsletter.syncSubscribers(),
  },
  {
    mutates: true,
    definition: {
      name: "add_subscriber",
      description: "Add an email to the newsletter (database + Resend list).",
      input_schema: obj({ email: { type: "string" }, first_name: { type: "string" } }, ["email"]),
    },
    summarize: (i) => `Add subscriber ${i.email}`,
    run: (input) => newsletter.addSubscriber(str(input, "email", 200, true)!, str(input, "first_name", 100) ?? ""),
  },
  {
    mutates: true,
    definition: {
      name: "set_subscriber_unsubscribed",
      description: "Unsubscribe (true) or resubscribe (false) an email in Resend.",
      input_schema: obj({ email: { type: "string" }, unsubscribed: { type: "boolean" } }, ["email", "unsubscribed"]),
    },
    summarize: (i) => `${i.unsubscribed ? "Unsubscribe" : "Resubscribe"} ${i.email}`,
    run: (input) => newsletter.setUnsubscribed(str(input, "email", 200, true)!, input.unsubscribed === true),
  },
  {
    mutates: true,
    definition: {
      name: "remove_subscriber",
      description: "Remove an email from the newsletter entirely (database + Resend).",
      input_schema: obj({ email: { type: "string" } }, ["email"]),
    },
    summarize: (i) => `Remove subscriber ${i.email}`,
    run: (input) => newsletter.removeSubscriber(str(input, "email", 200, true)!),
  },
  {
    mutates: true,
    definition: {
      name: "create_broadcast_draft",
      description:
        "Create a newsletter DRAFT (not sent). body is plain text: blank line = paragraph, '# Heading', '- bullet', **bold**, [text](url). The YRC layout and unsubscribe link are added automatically. Show the admin the full text before calling.",
      input_schema: obj(
        {
          subject: { type: "string" },
          preview_text: { type: "string", description: "Inbox preview line" },
          body: { type: "string" },
          name: { type: "string", description: "Internal name; defaults to subject" },
        },
        ["subject", "body"],
      ),
    },
    summarize: (i) => `Create newsletter draft "${i.subject}"`,
    run: (input) => {
      const previewText = str(input, "preview_text", 200) ?? "";
      return newsletter.createBroadcast({
        subject: str(input, "subject", 200, true)!,
        name: str(input, "name", 200),
        previewText,
        html: renderNewsletterHtml(str(input, "body", 50_000, true)!, previewText),
      });
    },
  },
  {
    mutates: true,
    definition: {
      name: "send_broadcast",
      description: "Send a broadcast draft to the whole list now, or schedule it (scheduled_at: ISO 8601 or natural language like 'tomorrow at 9am CET').",
      input_schema: obj({ id: { type: "string" }, scheduled_at: { type: "string" } }, ["id"]),
    },
    summarize: (i) => `SEND broadcast ${i.id} to the whole list${i.scheduled_at ? ` at ${i.scheduled_at}` : " now"}`,
    run: (input) => newsletter.sendBroadcast(str(input, "id", 100, true)!, str(input, "scheduled_at", 100)),
  },
  {
    mutates: true,
    definition: {
      name: "send_email",
      description: "Send one email to one address (e.g. a test or a personal note), in the YRC layout. body uses the same plain-text format as broadcasts.",
      input_schema: obj(
        { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } },
        ["to", "subject", "body"],
      ),
    },
    summarize: (i) => `Send email "${i.subject}" to ${i.to}`,
    run: (input) =>
      newsletter.sendEmail({
        to: str(input, "to", 200, true)!,
        subject: str(input, "subject", 200, true)!,
        html: withoutUnsubscribePlaceholder(renderNewsletterHtml(str(input, "body", 50_000, true)!)),
      }),
  },
];

export const AGENT_TOOLS = new Map(tools.map((t) => [t.definition.name, t]));

/** The tools bound to one admin's request, in the agent loop's shape. */
export function agentLoopTools(ctx: ToolContext): Map<string, LoopTool> {
  return new Map(
    tools.map((t) => [
      t.definition.name,
      {
        name: t.definition.name,
        description: t.definition.description,
        inputSchema: t.definition.input_schema,
        mutates: t.mutates,
        summarize: t.summarize,
        run: (input: Record<string, unknown>) => t.run(input, ctx),
      },
    ]),
  );
}
