import { AppRoutes } from '@/routes/AppRoutes'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
