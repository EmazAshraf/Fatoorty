interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 10, columns = 7 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>
      </div>

      {/* Table header skeleton */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          {Array.from({ length: columns - 1 }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
          ))}
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center space-x-6">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center space-x-3 flex-1">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 