import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminOrdersLoading() {
  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-48 rounded-md" />
                </div>
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2 border-t border-gray-100 pt-4 bg-gray-50/50 p-4 rounded-xl">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
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
