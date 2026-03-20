import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.ts'
import { dashboardStats } from './dashboard.controller.ts'

export const dashboardRoutes = Router()

dashboardRoutes.get('/stats', requireAuth, dashboardStats)
