import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string
      role: 'entrepreneur' | 'investor' | 'admin'
      email: string
      name: string
    }
  }
}
