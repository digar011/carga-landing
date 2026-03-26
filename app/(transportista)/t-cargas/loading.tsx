import { Skeleton } from '@/components/shared/skeleton';

export default function LoadBoardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Filtros placeholder */}
      <div className="flex animate-pulse gap-3">
        <div className="h-10 w-32 rounded-lg bg-gray-100" />
        <div className="h-10 w-32 rounded-lg bg-gray-100" />
        <div className="h-10 w-32 rounded-lg bg-gray-100" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton variant="card" count={4} />
      </div>
    </div>
  );
}
