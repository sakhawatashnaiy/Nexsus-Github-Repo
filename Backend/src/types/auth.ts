export type JwtPayload = {
  sub: string
  role: 'entrepreneur' | 'investor' | 'admin'
  tid?: string
}
