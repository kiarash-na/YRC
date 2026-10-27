import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES } from "@/lib/content-shared";

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
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="registration_url" className={labelClass}>Registration URL (optional)</label>
          <Input id="registration_url" name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} />
        </div>
      </div>

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
