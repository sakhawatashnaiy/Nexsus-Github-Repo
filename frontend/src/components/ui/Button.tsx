import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:pointer-events-none disabled:opacity-50 transform-gpu hover:-translate-y-px active:translate-y-0'

const variants: Record<Variant, string> = {
  primary:
    'bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] shadow-sm hover:opacity-95 hover:shadow active:opacity-90',
  secondary:
    'border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] shadow-sm hover:bg-black/5 hover:shadow dark:hover:bg-white/5',
  ghost: 'text-[rgb(var(--fg))] hover:bg-black/5 dark:hover:bg-white/5',
  danger:
    'bg-[rgb(var(--danger))] text-[rgb(var(--danger-fg))] shadow-sm hover:opacity-95 hover:shadow active:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-5',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
