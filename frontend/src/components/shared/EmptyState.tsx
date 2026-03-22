import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: ReactNode
  description?: ReactNode
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
      <div className="text-sm font-semibold">{title}</div>
      {description ? <div className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</div> : null}
      {action ? (
        <div className="mt-4">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      ) : null}
    </div>
  )
}
