import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[rgb(var(--border))]">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap border-b border-[rgb(var(--border))] bg-black/5 px-4 py-3 text-sm font-semibold italic text-[rgb(var(--muted))] dark:bg-white/5',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'border-b border-[rgb(var(--border))] px-4 py-3 text-[rgb(var(--fg))]',
        className,
      )}
      {...props}
    />
  )
}
