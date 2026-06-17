import { Skeleton } from '@/components/ui/Skeleton'

export default function OrderSuccessLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-10 w-72 mx-auto mb-2" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-gray-100">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="space-y-4 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-px w-full bg-gray-100" />
        <div className="flex justify-between items-center pt-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Skeleton className="h-14 w-44 rounded-full" />
        <Skeleton className="h-14 w-48 rounded-full" />
      </div>
    </div>
  )
}
