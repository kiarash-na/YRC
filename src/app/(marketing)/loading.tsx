/**
 * Route-level loading state: keeps navigations instant (prefetch boundary).
 * Fills the viewport so the footer never flashes up under it and then jumps
 * away when the page streams in (that jump measured CLS 0.585 on desktop).
 */
export default function Loading() {
  return (
    <main id="main" className="flex min-h-svh flex-1 items-center justify-center py-32">
      <p className="text-caption animate-pulse font-bold tracking-[0.3em] text-muted-foreground uppercase">
        YRC
      </p>
    </main>
  );
}
