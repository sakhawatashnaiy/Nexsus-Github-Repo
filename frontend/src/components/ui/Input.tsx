import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-base text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] outline-none transition-shadow duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] sm:text-sm',
        className,
      )}
      {...props}
    />
  )
}
