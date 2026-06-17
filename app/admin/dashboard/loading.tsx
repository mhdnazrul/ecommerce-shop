import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminDashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Skeleton className="h-6 w-36 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-6">
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
