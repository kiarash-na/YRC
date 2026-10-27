// One-off generator: reads content/events/*.mdx and writes supabase/seed.sql.
// Usage: node scripts/generate-events-seed.mjs
// NOTE: the MDX event files were retired after the seed was generated
// (events now live in the DB). To regenerate, restore them from git history:
//   git checkout <commit-before-retirement> -- content/events/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const EVENTS_DIR = path.join(process.cwd(), "content", "events");
const OUT_FILE = path.join(process.cwd(), "supabase", "seed.sql");

if (!fs.existsSync(EVENTS_DIR)) {
  console.error(
    "content/events/ no longer exists — events live in the database now.\n" +
      "To regenerate the seed, restore the MDX files from git history first:\n" +
      "  git log --oneline -- content/events   (find the commit before removal)\n" +
      "  git checkout <that-commit>^ -- content/events/",
  );
  process.exit(1);
}

const CATEGORIES = new Set(["race", "training", "social", "camp"]);

/** Quote a JS string as a SQL literal (dollar-quoting for long MDX bodies). */
function sql(value) {
  if (value === undefined || value === null || value === "") return "null";
  const s = String(value);
  if (s.length < 200 && !s.includes("\n") && !s.includes("'")) return `'${s}'`;
  if (!s.includes("$yrc$")) return `$yrc$${s}$yrc$`;
  return `'${s.replaceAll("'", "''")}'`;
}

function toISODate(value, field, file) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString().slice(0, 10);
  }
  throw new Error(`Invalid or missing "${field}" in ${file}`);
}

function requireString(value, field, file) {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  throw new Error(`Invalid or missing "${field}" in ${file}`);
}

const files = fs
  .readdirSync(EVENTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort();

const rows = files.map((file) => {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(EVENTS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  if (!CATEGORIES.has(data.category)) {
    throw new Error(`Invalid or missing "category" in events/${file}`);
  }

  return {
    slug,
    title: requireString(data.title, "title", file),
    excerpt: requireString(data.excerpt, "excerpt", file),
    cover: requireString(data.cover, "cover", file),
    event_date: toISODate(data.date, "date", file),
    end_date: data.endDate ? toISODate(data.endDate, "endDate", file) : null,
    location: requireString(data.location, "location", file),
    city: requireString(data.city, "city", file),
    category: data.category,
    registration_url: data.registrationUrl ? String(data.registrationUrl) : null,
    body: content.trim(),
  };
});

const inserts = rows
  .map(
    (r) => `insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  ${sql(r.slug)},
  ${sql(r.title)},
  ${sql(r.excerpt)},
  ${sql(r.cover)},
  ${sql(r.event_date)},
  ${sql(r.end_date)},
  ${sql(r.location)},
  ${sql(r.city)},
  ${sql(r.category)},
  ${sql(r.registration_url)},
  ${sql(r.body)}
)
on conflict (slug) do nothing;`,
  )
  .join("\n\n");

const seed = `-- ============================================================================
-- YRC seed data
--   - the points menu (score_actions)
--   - all events, generated from content/events/*.mdx
--     by scripts/generate-events-seed.mjs — do not edit by hand
--   - one QR check-in token per event
-- Safe to re-run: every insert is idempotent.
--
-- NOTE: the first admin seat is intentionally NOT in this file (personal
-- email in a public repo). Run it once by hand in the Supabase SQL editor:
--   insert into public.admins (email) values ('<admin-email>');
-- Then link the seat to a Strava athlete ID via the /admin/admins page.
-- ============================================================================

begin;

insert into public.score_actions (key, points, description)
values ('event_attendance', 10, 'Checking in at an event')
on conflict (key) do nothing;

${inserts}

-- one active QR token per event that doesn't have one yet
insert into public.event_checkin_tokens (event_id)
select e.id
from public.events e
where not exists (
  select 1 from public.event_checkin_tokens t where t.event_id = e.id
);

commit;
`;

fs.writeFileSync(OUT_FILE, seed);
console.log(`Wrote ${OUT_FILE} with ${rows.length} events.`);
