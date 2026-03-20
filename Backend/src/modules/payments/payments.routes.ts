import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.ts'
import { requireRole } from '../../middlewares/role.middleware.ts'
import { validate } from '../../middlewares/validate.middleware.ts'
import * as controller from './payments.controller.ts'
import {
  depositSchema,
  listTransactionsQuery,
  transferSchema,
  withdrawSchema,
} from './payments.validation.ts'

export const paymentRoutes = Router()

paymentRoutes.get(
  '/transactions',
  requireAuth,
  requireRole('entrepreneur', 'investor', 'admin'),
  validate({ query: listTransactionsQuery }),
  controller.listTransactions,
)

paymentRoutes.post(
  '/deposit',
  requireAuth,
  requireRole('entrepreneur', 'investor', 'admin'),
  validate({ body: depositSchema }),
  controller.deposit,
)

paymentRoutes.post(
  '/withdraw',
  requireAuth,
  requireRole('entrepreneur', 'investor', 'admin'),
  validate({ body: withdrawSchema }),
  controller.withdraw,
)

paymentRoutes.post(
  '/transfer',
  requireAuth,
  requireRole('entrepreneur', 'investor', 'admin'),
  validate({ body: transferSchema }),
  controller.transfer,
)
