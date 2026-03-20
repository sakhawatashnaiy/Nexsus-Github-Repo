import { z } from 'zod'

const isoOrDate = z.preprocess((v) => {
  if (typeof v === 'string' || v instanceof Date) return new Date(v)
  return v
}, z.date())

export const createMeetingSchema = z
  .object({
    inviteeId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(200).default('Meeting'),
    description: z.string().trim().max(5000).optional(),
    location: z.string().trim().max(500).optional(),
    startAt: isoOrDate,
    endAt: isoOrDate,
  })
  .strict()
  .refine((v) => v.endAt.getTime() > v.startAt.getTime(), {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  })

export const meetingIdParams = z.object({ id: z.string().trim().min(1) }).strict()

export const listMeetingsQuery = z
  .object({
    from: isoOrDate.optional(),
    to: isoOrDate.optional(),
    status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']).optional(),
  })
  .strict()
  .refine((v) => !v.from || !v.to || v.to.getTime() >= v.from.getTime(), {
    message: 'to must be after from',
    path: ['to'],
  })
