import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

export type ModalProps = PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  footer?: ReactNode
  className?: string
}>

export function Modal({ open, onOpenChange, title, footer, className, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close"
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-full max-w-lg animate-pop rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm',
            className,
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-5 py-4">
            <div className="text-sm font-semibold tracking-tight">{title}</div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-[rgb(var(--border))] px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
