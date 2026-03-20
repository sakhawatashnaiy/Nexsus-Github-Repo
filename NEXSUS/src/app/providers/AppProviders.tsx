import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'
import { ThemeScript } from '@/components/shared/ThemeScript'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeScript />
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}
