import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.ts'

export const listTransactionsQuery = paginationQuerySchema.extend({
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  type: z.enum(['deposit', 'withdraw', 'transfer']).optional(),
})

export const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).optional(),
  note: z.string().trim().min(1).optional(),
  provider: z.enum(['mock', 'stripe', 'paypal']).optional(),
})

export const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).optional(),
  note: z.string().trim().min(1).optional(),
  provider: z.enum(['mock', 'stripe', 'paypal']).optional(),
})

export const transferSchema = z.object({
  toUserId: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).optional(),
  note: z.string().trim().min(1).optional(),
  provider: z.enum(['mock', 'stripe', 'paypal']).optional(),
})
