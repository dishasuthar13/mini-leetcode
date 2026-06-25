const SkeletonLoader = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;