/**
 * Shared skeleton placeholders for list loading states.
 */

export function SkeletonPulse({ className = '' }) {
  return <div className={`skeleton-bone ${className}`} />;
}

export function ResourceCardSkeleton() {
  return (
    <div className="bg-white border border-[#c5d8ed] rounded-md p-5 animate-fade-in">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonPulse className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <SkeletonPulse className="h-4 w-3/4 rounded" />
          <SkeletonPulse className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <SkeletonPulse className="h-5 w-12 rounded" />
        <SkeletonPulse className="h-5 w-16 rounded" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#e8eef5]">
        <SkeletonPulse className="h-3 w-20 rounded" />
        <SkeletonPulse className="h-3 w-14 rounded" />
      </div>
    </div>
  );
}

export function ResourceCardSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function QueueRowSkeleton() {
  return (
    <div className="card p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm">
      <SkeletonPulse className="w-4 h-4 rounded shrink-0 self-start md:self-center" />
      <SkeletonPulse className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 w-full space-y-3 min-w-0">
        <SkeletonPulse className="h-5 w-2/3 rounded" />
        <SkeletonPulse className="h-3 w-1/2 rounded" />
        <SkeletonPulse className="h-3 w-full max-w-md rounded" />
      </div>
      <div className="flex gap-3 w-full md:w-auto shrink-0">
        <SkeletonPulse className="h-11 w-24 rounded-lg" />
        <SkeletonPulse className="h-11 w-24 rounded-lg" />
        <SkeletonPulse className="h-11 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function QueueRowSkeletonList({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <QueueRowSkeleton key={i} />
      ))}
    </div>
  );
}
