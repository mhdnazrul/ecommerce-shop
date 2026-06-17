import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <Skeleton className="flex-1 h-11 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
