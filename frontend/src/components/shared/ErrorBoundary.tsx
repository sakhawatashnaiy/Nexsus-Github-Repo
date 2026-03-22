import type { PropsWithChildren, ReactNode } from 'react'
import { Component } from 'react'
import { Button } from '@/components/ui/Button'

type Props = PropsWithChildren<{ fallback?: ReactNode }>

type State = {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-3 px-6">
          <div className="text-sm text-[rgb(var(--muted))]">Nexus</div>
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-[rgb(var(--muted))]">
            Refresh the page. If the issue persists, contact support.
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    )
  }
}
