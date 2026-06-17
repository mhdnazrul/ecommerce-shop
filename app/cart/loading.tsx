import { Skeleton } from '@/components/ui/Skeleton'

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col md:flex-row gap-12 items-start">
      <div className="flex-1 w-full">
        <Skeleton className="h-10 w-56 mb-8" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20 mb-2 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-96 rounded-2xl bg-gray-50 border border-gray-200 p-8 sticky top-24">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-px w-full bg-gray-200 my-4" />
        <div className="flex justify-between mb-8">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  )
}
