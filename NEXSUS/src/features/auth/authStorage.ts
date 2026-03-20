import type { AuthTokens, User } from '@/features/auth/types'

const STORAGE_KEY = 'nexus.auth'

type StoredAuth = {
  user: User | null
  tokens: AuthTokens | null
}

export function readStoredAuth(): StoredAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, tokens: null }
    const parsed = JSON.parse(raw) as StoredAuth
    return {
      user: parsed.user ?? null,
      tokens: parsed.tokens ?? null,
    }
  } catch {
    return { user: null, tokens: null }
  }
}

export function writeStoredAuth(payload: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
