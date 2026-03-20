import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware.ts'
import { requireAuth } from '../../middlewares/auth.middleware.ts'
import { loginSchema, registerSchema } from './auth.validation.ts'
import * as controller from './auth.controller.ts'

export const authRoutes = Router()

authRoutes.post('/register', validate({ body: registerSchema }), controller.register)
authRoutes.post('/login', validate({ body: loginSchema }), controller.login)
authRoutes.get('/me', requireAuth, controller.getMe)
