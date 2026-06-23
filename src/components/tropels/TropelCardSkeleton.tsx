export function TropelCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-800" />
      </div>
      <div className="h-5 w-20 animate-pulse rounded-full bg-gray-800" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-12 animate-pulse rounded bg-gray-800" />
          <div className="h-3 w-8 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-800" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-12 animate-pulse rounded-lg bg-gray-800" />
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-gray-800" />
    </div>
  )
}
