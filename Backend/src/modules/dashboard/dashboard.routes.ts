import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { dashboardStats } from './dashboard.controller.js'

export const dashboardRoutes = Router()

dashboardRoutes.get('/stats', requireAuth, dashboardStats)
