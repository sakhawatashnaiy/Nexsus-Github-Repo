import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'default' | 'muted'

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[rgb(var(--border))] px-2 py-0.5 text-xs font-medium',
        props.variant === 'muted' && 'text-[rgb(var(--muted))]',
        className,
      )}
      {...props}
    />
  )
}
