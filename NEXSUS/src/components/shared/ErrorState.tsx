import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: ReactNode
  description?: ReactNode
  onRetry?: () => void
}) {
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
      <div className="text-sm font-semibold">{title}</div>
      {description ? <div className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</div> : null}
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}
