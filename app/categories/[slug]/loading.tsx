import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="flex items-start gap-6 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-lg mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mb-10">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
