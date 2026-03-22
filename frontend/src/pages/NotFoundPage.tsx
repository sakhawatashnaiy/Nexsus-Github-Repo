import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="max-w-md px-6 text-center">
        <div className="text-xs font-medium tracking-wide text-[rgb(var(--muted))]">NEXUS</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-[rgb(var(--muted))]">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-5 flex justify-center">
          <Link to="/">
            <Button variant="secondary">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
