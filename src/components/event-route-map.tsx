"use client";

import { Download } from "lucide-react";

import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";

interface EventRouteMapProps {
  /** Simplified GPX track as [lng, lat] pairs (≥ 2 points). */
  line: [number, number][];
  /** Public URL of the original .gpx for download. */
  gpxUrl?: string;
  /** Used to name the downloaded file. */
  eventSlug: string;
}

/** Start and end closer than this (degrees ≈ 50 m) → one "Start / Finish" pin. */
const LOOP_TOLERANCE = 0.0005;

/**
 * Event route map (mapcn / MapLibre GL, free CARTO tiles, no API key).
 * Fits the whole route on load; page scroll is never hijacked
 * (cooperativeGestures: ctrl/⌘ + scroll or two fingers to zoom). The light
 * basemap is pinned so OS dark mode can't put dark tiles on the light page.
 */
export function EventRouteMap({ line, gpxUrl, eventSlug }: EventRouteMapProps) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of line) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const start = line[0];
  const end = line[line.length - 1];
  const isLoop =
    Math.abs(start[0] - end[0]) < LOOP_TOLERANCE &&
    Math.abs(start[1] - end[1]) < LOOP_TOLERANCE;

  return (
    <section aria-label="Route map" className="mt-12 flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
          Route
        </p>
        {gpxUrl && (
          <a
            href={gpxUrl}
            download={`${eventSlug}.gpx`}
            className="inline-flex items-center gap-1.5 text-body-small font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <Download className="size-4" aria-hidden="true" />
            Download GPX
          </a>
        )}
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-xl border border-border bg-muted md:h-[460px]">
        <Map
          theme="light"
          bounds={[
            [minLng, minLat],
            [maxLng, maxLat],
          ]}
          fitBoundsOptions={{ padding: 48 }}
          cooperativeGestures
        >
          <MapRoute
            coordinates={line}
            color="#171717"
            width={4}
            opacity={0.9}
            interactive={false}
          />

          <MapMarker longitude={start[0]} latitude={start[1]}>
            <MarkerContent>
              <span className="block size-4 rounded-full border-2 border-white bg-yrc-accent shadow-sm" />
            </MarkerContent>
            <MarkerTooltip>{isLoop ? "Start / Finish" : "Start"}</MarkerTooltip>
          </MapMarker>

          {!isLoop && (
            <MapMarker longitude={end[0]} latitude={end[1]}>
              <MarkerContent>
                <span className="block size-4 rounded-full border-2 border-white bg-foreground shadow-sm" />
              </MarkerContent>
              <MarkerTooltip>Finish</MarkerTooltip>
            </MapMarker>
          )}

          <MapControls showFullscreen />
        </Map>
      </div>
    </section>
  );
}
