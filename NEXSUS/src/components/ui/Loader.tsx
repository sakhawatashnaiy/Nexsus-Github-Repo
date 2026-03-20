import { cn } from '@/utils/cn'

export function Loader({ className }: { className?: string }) {
  return (
    <span
      aria-label="Loading"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--border))] border-t-[rgb(var(--primary))]',
        className,
      )}
    />
  )
}
