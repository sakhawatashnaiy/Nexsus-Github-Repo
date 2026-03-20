import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { AuthTokens, User } from '@/features/auth/types'
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/features/auth/authStorage'

export type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

const stored = typeof window !== 'undefined' ? readStoredAuth() : { user: null, tokens: null }

const initialState: AuthState = {
  user: stored.user,
  accessToken: stored.tokens?.accessToken ?? null,
  refreshToken: stored.tokens?.refreshToken ?? null,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.tokens.accessToken
      state.refreshToken = action.payload.tokens.refreshToken ?? null
      writeStoredAuth({ user: state.user, tokens: action.payload.tokens })
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      const tokens = state.accessToken
        ? { accessToken: state.accessToken, refreshToken: state.refreshToken ?? undefined }
        : null
      writeStoredAuth({ user: state.user, tokens })
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      clearStoredAuth()
    },
  },
})

export const { setCredentials, setUser, logout } = slice.actions
export const authReducer = slice.reducer

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.accessToken)
