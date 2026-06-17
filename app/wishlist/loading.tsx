import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function WishlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
