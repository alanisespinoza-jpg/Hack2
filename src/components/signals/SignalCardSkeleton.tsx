export function SignalCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex gap-2">
        <div className="h-5 w-24 animate-pulse rounded-md bg-gray-800" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-800" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-800" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-800" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-gray-800" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-800" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-800 pt-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
      </div>
    </div>
  )
}
