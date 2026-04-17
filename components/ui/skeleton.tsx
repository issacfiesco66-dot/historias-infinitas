import { cn } from '@/lib/utils';

/** Skeleton elegante con shimmer dorado sutil. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-pizarra-100',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-dorado-200/50 before:to-transparent',
        'before:animate-[shimmer_1.8s_infinite]',
        className,
      )}
    />
  );
}
