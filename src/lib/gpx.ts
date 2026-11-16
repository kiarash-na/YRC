/**
 * Minimal GPX → [lng, lat][] parsing for event routes (server-side, no DOM,
 * no dependencies). Reads track points (<trkpt>) and falls back to route
 * points (<rtept>); waypoints are ignored. Coordinates are returned in
 * GeoJSON / MapLibre order: [longitude, latitude].
 */

export type LngLat = [number, number];

/** Upper bound on stored points — plenty for a smooth line, light to ship. */
const MAX_POINTS = 1500;

const POINT_RE = /<(trkpt|rtept)\b([^>]*)>/gi;
const attr = (attrs: string, name: string) =>
  attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];

export function parseGpx(xml: string): LngLat[] {
  const track: LngLat[] = [];
  const route: LngLat[] = [];
  for (const match of xml.matchAll(POINT_RE)) {
    const lat = Number(attr(match[2], "lat"));
    const lon = Number(attr(match[2], "lon"));
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      continue;
    }
    (match[1].toLowerCase() === "trkpt" ? track : route).push([lon, lat]);
  }
  return track.length >= 2 ? track : route;
}

/** Great-circle length of a line, in km. */
export function lineLengthKm(line: LngLat[]): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    const [lon1, lat1] = line[i - 1];
    const [lon2, lat2] = line[i];
    const a =
      Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    km += 2 * R * Math.asin(Math.sqrt(a));
  }
  return km;
}

/** Squared distance from p to segment a–b (planar; fine at route scale). */
function segDist2(p: LngLat, a: LngLat, b: LngLat): number {
  let [x, y] = a;
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

/** Ramer–Douglas–Peucker, iterative (no recursion depth issues). */
function rdp(line: LngLat[], tolerance: number): LngLat[] {
  if (line.length <= 2) return line;
  const sqTol = tolerance * tolerance;
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    let maxD = 0;
    let index = 0;
    for (let i = first + 1; i < last; i++) {
      const d = segDist2(line[i], line[first], line[last]);
      if (d > maxD) {
        maxD = d;
        index = i;
      }
    }
    if (maxD > sqTol) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

/**
 * Simplify to ≤ MAX_POINTS, starting at ~1 m tolerance and loosening until
 * it fits. Coordinates are rounded to 6 decimals (~0.1 m).
 */
export function simplifyLine(line: LngLat[]): LngLat[] {
  let tolerance = 0.00001; // degrees ≈ 1 m
  let out = rdp(line, tolerance);
  while (out.length > MAX_POINTS) {
    tolerance *= 2;
    out = rdp(line, tolerance);
  }
  return out.map(([lng, lat]) => [
    Math.round(lng * 1e6) / 1e6,
    Math.round(lat * 1e6) / 1e6,
  ]);
}
