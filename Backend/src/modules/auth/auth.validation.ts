import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(6),
  })
  .strict()

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(200),
    email: z.string().trim().email(),
    password: z.string().min(6),
  })
  .strict()
