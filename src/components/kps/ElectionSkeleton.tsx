import { Skeleton } from "@/components/ui/skeleton";

export function ElectionSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <div role="status" aria-label="Loading election information" className="mt-6 space-y-5 motion-reduce:[&_*]:animate-none">
      <span className="sr-only">Loading election information…</span>
      {detail ? <>
        <Skeleton className="mx-auto h-48 w-40 bg-muted" />
        <Skeleton className="mx-auto h-7 w-3/4 bg-muted" />
        <Skeleton className="h-20 w-full bg-muted" />
        <Skeleton className="h-12 w-full bg-muted" />
        <Skeleton className="h-28 w-full bg-muted" />
      </> : Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-gold/30 bg-card p-3">
          <Skeleton className="h-32 w-24 shrink-0 bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-3 py-2">
            <Skeleton className="h-6 w-full bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted" />
            <Skeleton className="mt-auto h-6 w-1/2 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}