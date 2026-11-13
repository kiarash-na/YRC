import type { EventItem } from "@/lib/content-shared";

/**
 * RFC 5545 iCalendar builder for events (no dependencies).
 * Berlin wall-clock times via an embedded Europe/Berlin VTIMEZONE so
 * calendar clients handle CET/CEST without a tz database.
 */

const encoder = new TextEncoder();
const utf8Length = (s: string) => encoder.encode(s).length;

/** Fold a content line at 75 octets; continuations are CRLF + one space. */
function foldLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = utf8Length(char);
    if (currentBytes + charBytes > 75) {
      out.push(current);
      current = " "; // continuation space counts toward the 75-octet limit
      currentBytes = 1;
    }
    current += char;
    currentBytes += charBytes;
  }
  out.push(current);
  return out;
}

/** Escape a TEXT value (RFC 5545 §3.3.11); CRs are stripped, not escaped. */
function escapeText(value: string): string {
  return value
    .replace(/\r/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

const pad = (n: number) => String(n).padStart(2, "0");

interface Ymd {
  y: number;
  m: number;
  d: number;
}

function parseYmd(iso: string): Ymd {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** 1-based month → number of days. */
function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const fmtDate = ({ y, m, d }: Ymd) => `${y}${pad(m)}${pad(d)}`;
const fmtDateTime = (p: Ymd & { hh: number; mm: number }) =>
  `${fmtDate(p)}T${pad(p.hh)}${pad(p.mm)}00`;

/** Add minutes to a wall-clock date+time, rolling across midnight/months. */
function addMinutes(date: Ymd, hh: number, mm: number, add: number) {
  let total = hh * 60 + mm + add;
  let { y, m, d } = date;
  while (total >= 1440) {
    total -= 1440;
    d += 1;
    if (d > daysInMonth(y, m)) {
      d = 1;
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }
  return { y, m, d, hh: Math.floor(total / 60), mm: total % 60 };
}

/** Add whole days (all-day DTEND is the day AFTER the last day). */
function addDays(date: Ymd, days: number): Ymd {
  let { y, m, d } = date;
  d += days;
  while (d > daysInMonth(y, m)) {
    d -= daysInMonth(y, m);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return { y, m, d };
}

/** UTC timestamp for DTSTAMP. */
function fmtUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function buildEventIcs(
  event: EventItem,
  siteUrl: string,
  now = new Date(),
): string {
  const base = siteUrl.replace(/\/+$/, "");
  const url = `${base}/events/${event.slug}`;
  const date = parseYmd(event.date);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YRC//Yas Rise Community Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Static Europe/Berlin zone: CET +0100 / CEST +0200, EU switchover rules.
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${event.slug}@yasrise.run`,
    `DTSTAMP:${fmtUtc(now)}`,
  ];

  if (event.startTime) {
    const [hh, mm] = event.startTime.split(":").map(Number);
    lines.push(
      `DTSTART;TZID=Europe/Berlin:${fmtDateTime({ ...date, hh, mm })}`,
      `DTEND;TZID=Europe/Berlin:${fmtDateTime(addMinutes(date, hh, mm, event.durationMinutes ?? 120))}`,
    );
  } else {
    const end = addDays(parseYmd(event.endDate ?? event.date), 1);
    lines.push(
      `DTSTART;VALUE=DATE:${fmtDate(date)}`,
      `DTEND;VALUE=DATE:${fmtDate(end)}`,
    );
  }

  const brief: string[] = [];
  if (event.distanceKm != null) brief.push(`Distance: ${event.distanceKm} km`);
  if (event.elevationGainM != null)
    brief.push(`Elevation: +${event.elevationGainM} m`);
  if (event.routeNotes) brief.push(`Route: ${event.routeNotes}`);
  if (event.whatToBring) brief.push(`Bring: ${event.whatToBring}`);
  if (event.coachTips) brief.push(`Tips: ${event.coachTips}`);

  const description = [event.excerpt, ""]
    .concat(brief)
    .concat(brief.length ? [""] : [])
    .concat([url, "— YRC · Yas Rise Community · yasrise.run"])
    .join("\n");

  const location = event.meetingPoint
    ? `${event.meetingPoint}, ${event.city}`
    : `${event.location}, ${event.city}`;

  lines.push(
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    "ORGANIZER;CN=Yas Rise Community:mailto:login@mail.yasrise.run",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return lines.flatMap(foldLine).join("\r\n") + "\r\n";
}
