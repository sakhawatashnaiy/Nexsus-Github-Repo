import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function InlineAlert({
  title,
  description,
  variant = 'info',
}: {
  title: ReactNode
  description?: ReactNode
  variant?: 'info' | 'error'
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        variant === 'error'
          ? 'border-[rgb(var(--danger))]/30 bg-[rgb(var(--danger))]/10 text-[rgb(var(--fg))]'
          : 'border-[rgb(var(--border))] bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5',
      )}
    >
      <div className="font-medium">{title}</div>
      {description ? <div className="mt-0.5 text-[rgb(var(--muted))]">{description}</div> : null}
    </div>
  )
}
