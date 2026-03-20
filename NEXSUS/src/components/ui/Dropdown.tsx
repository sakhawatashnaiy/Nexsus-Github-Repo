import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

export function Dropdown({
  trigger,
  children,
  align = 'right',
}: PropsWithChildren<{ trigger: ReactNode; align?: 'left' | 'right' }>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
      >
        {trigger}
      </button>
      {open ? (
        <div
          aria-label="Menu"
          className={cn(
            'absolute top-full z-40 mt-2 min-w-48 animate-pop rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1 shadow-sm',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownItem({
  children,
  className,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[rgb(var(--fg))] transition-colors duration-150 ease-out hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--card))] dark:hover:bg-white/5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
