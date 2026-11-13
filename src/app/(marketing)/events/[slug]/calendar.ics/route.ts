import { getEventBySlug } from "@/lib/events-db";
import { buildEventIcs } from "@/lib/ics";

// Matches the event page ISR window; admin edits revalidate on demand.
export const revalidate = 900;

/**
 * GET /events/<slug>/calendar.ics — YRC-branded .ics download.
 * The `calendar.ics` segment is a literal (dotted) folder name, served as-is.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasrise.run";
  const ics = buildEventIcs(event, siteUrl);

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="yrc-${event.slug}.ics"`,
      "cache-control": "public, max-age=900",
    },
  });
}
