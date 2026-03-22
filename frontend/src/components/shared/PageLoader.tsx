import { Loader } from '@/components/ui/Loader'

export function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
        <Loader />
        Loading…
      </div>
    </div>
  )
}
