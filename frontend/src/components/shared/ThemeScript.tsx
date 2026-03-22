import { useLayoutEffect } from 'react'
import { initThemeSync } from '@/hooks/useTheme'

export function ThemeScript() {
  useLayoutEffect(() => {
    initThemeSync()
  }, [])

  return null
}
