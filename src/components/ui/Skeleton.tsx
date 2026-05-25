import { cn } from '@/lib/utils'

/** Base shimmer block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-border/60', className)} />
  )
}

/** 4-column summary card row skeleton */
export function CardRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

/** Table rows skeleton */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-border/40">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-5 py-3">
                  <Skeleton className={cn('h-3', c === 0 ? 'w-20' : 'w-12')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Chart panel skeleton */
export function ChartSkeleton({ height = 480 }: { height?: number }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      style={{ height }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="ml-auto h-7 w-28 rounded-lg" />
      </div>
      {/* Price */}
      <div className="flex items-end gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mb-1 h-4 w-20" />
      </div>
      {/* Chart area */}
      <Skeleton className="flex-1 rounded-xl" />
    </div>
  )
}

/** Full dashboard page skeleton */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:items-start lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
        <ChartSkeleton height={480} />
        <div className="flex flex-col gap-4">
          <CardRowSkeleton cols={1} />
          <TableSkeleton rows={6} cols={3} />
        </div>
      </div>
      <TableSkeleton rows={5} cols={6} />
    </div>
  )
}

/** Generic page skeleton: header + card row + table */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <CardRowSkeleton cols={4} />
      <TableSkeleton rows={6} cols={6} />
    </div>
  )
}
