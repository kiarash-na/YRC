import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, routeGpxUrl } from "@/lib/content-shared";

interface EventFormProps {
  action: (formData: FormData) => void;
  event?: {
    slug: string;
    title: string;
    excerpt: string;
    cover: string;
    event_date: string;
    end_date: string | null;
    location: string;
    city: string;
    category: string;
    registration_url: string | null;
    recurrence?: string | null;
    start_time?: string | null;
    duration_minutes?: number | null;
    meeting_point?: string | null;
    finish_point?: string | null;
    /** PostgREST may serialize numeric as a string. */
    distance_km?: number | string | null;
    elevation_gain_m?: number | null;
    route_notes?: string | null;
    what_to_bring?: string | null;
    coach_tips?: string | null;
    route_gpx_path?: string | null;
    body: string;
  };
}

const labelClass = "text-caption font-medium";
const textareaClass =
  "border-input bg-background ring-ring/24 focus-visible:border-ring w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-2";

/** Shared create/edit form for events (plain server-action form, no JS needed). */
export function AdminEventForm({ action, event }: EventFormProps) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className={labelClass}>Title</label>
          <Input id="title" name="title" defaultValue={event?.title} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className={labelClass}>Slug (URL)</label>
          <Input id="slug" name="slug" defaultValue={event?.slug} required pattern="[a-z0-9\-]+" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className={labelClass}>Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={2} defaultValue={event?.excerpt} required className={textareaClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover" className={labelClass}>Cover (ImageKit path, e.g. /YRC/Events/…)</label>
        <Input id="cover" name="cover" defaultValue={event?.cover} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="event_date" className={labelClass}>Start date</label>
          <Input id="event_date" name="event_date" type="date" defaultValue={event?.event_date} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="end_date" className={labelClass}>End date (optional)</label>
          <Input id="end_date" name="end_date" type="date" defaultValue={event?.end_date ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="location" className={labelClass}>Location</label>
          <Input id="location" name="location" defaultValue={event?.location} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className={labelClass}>City</label>
          <Input id="city" name="city" defaultValue={event?.city} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className={labelClass}>Category</label>
          <select
            id="category"
            name="category"
            defaultValue={event?.category ?? "social"}
            className={textareaClass}
          >
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EVENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="registration_url" className={labelClass}>Registration URL (optional)</label>
          <Input id="registration_url" name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recurrence" className={labelClass}>Recurrence</label>
          <select
            id="recurrence"
            name="recurrence"
            defaultValue={event?.recurrence ?? ""}
            className={textareaClass}
          >
            <option value="">One-off</option>
            <option value="weekly">Weekly — auto-creates next week&apos;s copy when this one ends</option>
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <legend className="px-1 text-caption font-medium">Technical brief (all optional)</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start_time" className={labelClass}>Start time</label>
            <Input id="start_time" name="start_time" type="time" defaultValue={event?.start_time?.slice(0, 5) ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="duration_minutes" className={labelClass}>Duration (minutes)</label>
            <Input id="duration_minutes" name="duration_minutes" type="number" min={5} defaultValue={event?.duration_minutes ?? ""} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="meeting_point" className={labelClass}>Meeting point</label>
            <Input id="meeting_point" name="meeting_point" defaultValue={event?.meeting_point ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="finish_point" className={labelClass}>Finish point</label>
            <Input id="finish_point" name="finish_point" placeholder="Same as meeting point" defaultValue={event?.finish_point ?? ""} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="distance_km" className={labelClass}>Distance (km)</label>
            <Input id="distance_km" name="distance_km" type="number" step="0.1" min={0} defaultValue={event?.distance_km ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="elevation_gain_m" className={labelClass}>Elevation gain (m)</label>
            <Input id="elevation_gain_m" name="elevation_gain_m" type="number" min={0} defaultValue={event?.elevation_gain_m ?? ""} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="route_gpx" className={labelClass}>
            Route map (GPX file, max 4 MB) — shown as a map on the event page
          </label>
          <Input id="route_gpx" name="route_gpx" type="file" accept=".gpx,application/gpx+xml" />
          {event?.route_gpx_path ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
              <span>
                Current route:{" "}
                <a
                  href={routeGpxUrl(event.route_gpx_path)}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  download GPX
                </a>{" "}
                — upload a new file to replace it.
              </span>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" name="route_remove" className="size-3.5 accent-primary" />
                Remove route
              </label>
            </div>
          ) : (
            <p className="text-caption text-muted-foreground">
              Leave “Distance” empty to fill it from the GPX track.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="route_notes" className={labelClass}>Route notes</label>
          <textarea id="route_notes" name="route_notes" rows={2} defaultValue={event?.route_notes ?? ""} className={textareaClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="what_to_bring" className={labelClass}>What to bring</label>
          <textarea id="what_to_bring" name="what_to_bring" rows={2} defaultValue={event?.what_to_bring ?? ""} className={textareaClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="coach_tips" className={labelClass}>Coach tips</label>
          <textarea id="coach_tips" name="coach_tips" rows={2} defaultValue={event?.coach_tips ?? ""} className={textareaClass} />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className={labelClass}>Body (MDX)</label>
        <textarea id="body" name="body" rows={12} defaultValue={event?.body} className={textareaClass} />
      </div>

      <Button type="submit" className="w-fit">
        {event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
