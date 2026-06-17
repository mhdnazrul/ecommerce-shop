import { Skeleton } from '@/components/ui/Skeleton'

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-16">
      <div className="lg:w-1/2 flex flex-col gap-4">
        <Skeleton className="w-full min-h-[500px] rounded-2xl" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:w-1/2 flex flex-col">
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-8">
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-2/3 mb-8" />
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-b border-gray-200 py-8 my-4">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-14 flex-1 rounded-full" />
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
