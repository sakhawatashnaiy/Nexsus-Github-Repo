import { Router } from 'express'
import { authRoutes } from '../modules/auth/auth.routes.ts'
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes.ts'
import { meetingRoutes } from '../modules/meetings/meetings.routes.ts'
import { documentRoutes } from '../modules/documents/documents.routes.ts'
import { paymentRoutes } from '../modules/payments/payments.routes.ts'
import { projectRoutes } from '../modules/projects/projects.routes.ts'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/dashboard', dashboardRoutes)
routes.use('/meetings', meetingRoutes)
routes.use('/documents', documentRoutes)
routes.use('/payments', paymentRoutes)
routes.use('/projects', projectRoutes)
