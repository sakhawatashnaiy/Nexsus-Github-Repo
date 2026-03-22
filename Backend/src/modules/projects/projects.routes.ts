import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import * as controller from './projects.controller.js'
import {
  createProjectSchema,
  listProjectsQuery,
  projectIdParams,
  updateProjectSchema,
} from './projects.validation.js'

export const projectRoutes = Router()

projectRoutes.get('/', requireAuth, requireRole('entrepreneur', 'admin'), validate({ query: listProjectsQuery }), controller.listProjects)
projectRoutes.post('/', requireAuth, requireRole('entrepreneur', 'admin'), validate({ body: createProjectSchema }), controller.createProject)
projectRoutes.patch(
  '/:id',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: projectIdParams, body: updateProjectSchema }),
  controller.updateProject,
)
projectRoutes.delete('/:id', requireAuth, requireRole('entrepreneur', 'admin'), validate({ params: projectIdParams }), controller.deleteProject)
