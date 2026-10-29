/** Route-level loading state: keeps navigations instant (prefetch boundary). */
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center py-32">
      <p className="text-caption animate-pulse font-bold tracking-[0.3em] text-muted-foreground uppercase">
        YRC
      </p>
    </main>
  );
}
