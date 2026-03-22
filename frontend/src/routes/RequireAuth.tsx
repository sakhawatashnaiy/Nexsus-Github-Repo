import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice'
import type { User } from '@/features/auth/types'

type RequireAuthProps = PropsWithChildren<{ roles?: Array<User['role']> }>

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const isAuthed = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
