export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

export type User = {
  id: string
  email: string
  name: string
  role: 'entrepreneur' | 'investor' | 'admin'
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  tokens: AuthTokens
}
