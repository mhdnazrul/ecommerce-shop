import { Skeleton } from '@/components/ui/Skeleton'

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Skeleton className="h-9 w-40 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-7 w-24" />
              </div>
            </div>
            <Skeleton className="h-px w-full bg-gray-200" />
            <div className="space-y-2 pt-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
