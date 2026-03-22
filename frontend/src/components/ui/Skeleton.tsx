import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-black/5 dark:bg-white/5',
        className,
      )}
    />
  )
}
