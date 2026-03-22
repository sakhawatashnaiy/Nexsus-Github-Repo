import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { loginSchema, registerSchema } from './auth.validation.js'
import * as controller from './auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/register', validate({ body: registerSchema }), controller.register)
authRoutes.post('/login', validate({ body: loginSchema }), controller.login)
authRoutes.get('/me', requireAuth, controller.getMe)
