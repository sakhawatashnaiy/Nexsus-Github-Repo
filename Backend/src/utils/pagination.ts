import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export function getSkipLimit(page: number, limit: number): { skip: number; limit: number }
export function getSkipLimit(input: { page: number; limit: number }): { skip: number; limit: number }
export function getSkipLimit(
  pageOrInput: number | { page: number; limit: number },
  limitArg?: number,
): { skip: number; limit: number } {
  const page = typeof pageOrInput === 'number' ? pageOrInput : pageOrInput.page
  const limit = typeof pageOrInput === 'number' ? limitArg : pageOrInput.limit

  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : 20
  return { skip: (safePage - 1) * safeLimit, limit: safeLimit }
}
