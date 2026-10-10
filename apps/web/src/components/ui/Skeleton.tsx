import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={className}
            lines={1}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'skeleton rounded-sm',
        className
      )}
    />
  );
}

export function DishCardSkeleton() {
  return (
    <div className="bg-surface rounded-md overflow-hidden shadow-sm">
      <div className="w-full aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
