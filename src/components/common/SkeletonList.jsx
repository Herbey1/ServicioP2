"use client"

export default function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg h-16 bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  );
}

