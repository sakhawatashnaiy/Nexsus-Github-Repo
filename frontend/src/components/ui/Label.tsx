import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-base font-medium text-[rgb(var(--fg))] sm:text-sm', className)}
      {...props}
    />
  )
}
