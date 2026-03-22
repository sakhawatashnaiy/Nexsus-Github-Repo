import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { ApiError } from '../../utils/ApiError.js'
import { MeetingModel } from './meeting.model.js'

function toMeetingDto(m: {
  _id: mongoose.Types.ObjectId
  organizerId: mongoose.Types.ObjectId
  inviteeId: mongoose.Types.ObjectId
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt: Date
  status: string
  decidedAt?: Date
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: String(m._id),
    organizerId: String(m.organizerId),
    inviteeId: String(m.inviteeId),
    title: m.title,
    description: m.description ?? null,
    location: m.location ?? null,
    startAt: m.startAt.toISOString(),
    endAt: m.endAt.toISOString(),
    status: m.status,
    decidedAt: m.decidedAt ? m.decidedAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}

async function hasConflict(opts: {
  participantIds: string[]
  startAt: Date
  endAt: Date
  excludeMeetingId?: string
}) {
  const filter: Record<string, unknown> = {
    status: { $in: ['pending', 'accepted'] },
    participants: { $in: opts.participantIds },
    startAt: { $lt: opts.endAt },
    endAt: { $gt: opts.startAt },
  }
  if (opts.excludeMeetingId && mongoose.isValidObjectId(opts.excludeMeetingId)) {
    filter._id = { $ne: opts.excludeMeetingId }
  }

  const existing = await MeetingModel.findOne(filter).select({ _id: 1 }).lean()
  return Boolean(existing)
}

export const createMeeting = catchAsync(async (req: Request, res: Response) => {
  const organizerId = req.user!.id
  const { inviteeId, title, description, location, startAt, endAt } = req.body as {
    inviteeId: string
    title: string
    description?: string
    location?: string
    startAt: Date
    endAt: Date
  }

  if (!mongoose.isValidObjectId(inviteeId)) {
    throw new ApiError('Invalid inviteeId', StatusCodes.UNPROCESSABLE_ENTITY)
  }
  if (inviteeId === organizerId) {
    throw new ApiError('Cannot invite yourself', StatusCodes.UNPROCESSABLE_ENTITY)
  }

  const conflict = await hasConflict({
    participantIds: [organizerId, inviteeId],
    startAt,
    endAt,
  })
  if (conflict) {
    throw new ApiError('Time slot conflicts with an existing meeting', StatusCodes.CONFLICT)
  }

  const meeting = await MeetingModel.create({
    organizerId,
    inviteeId,
    participants: [organizerId, inviteeId],
    title,
    description,
    location,
    startAt,
    endAt,
    status: 'pending',
  })

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Meeting scheduled',
    data: toMeetingDto(meeting.toObject()),
  })
})

export const listMeetings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { from, to, status } = req.query as {
    from?: Date
    to?: Date
    status?: string
  }

  const filter: Record<string, unknown> = {
    participants: userId,
  }
  if (status) filter.status = status
  if (from || to) {
    // Meetings that intersect the requested range
    filter.startAt = { $lt: to ?? new Date('9999-12-31') }
    filter.endAt = { $gt: from ?? new Date(0) }
  }

  const meetings = await MeetingModel.find(filter).sort({ startAt: 1 }).lean()

  return sendResponse(res, {
    message: 'OK',
    data: meetings.map((m) => toMeetingDto(m as never)),
  })
})

export const listMeetingEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { from, to, status } = req.query as {
    from?: Date
    to?: Date
    status?: string
  }

  const filter: Record<string, unknown> = {
    participants: userId,
  }
  if (status) filter.status = status
  if (from || to) {
    filter.startAt = { $lt: to ?? new Date('9999-12-31') }
    filter.endAt = { $gt: from ?? new Date(0) }
  }

  const meetings = await MeetingModel.find(filter).sort({ startAt: 1 }).lean()

  // Calendar-library friendly shape (e.g. FullCalendar)
  const events = meetings.map((m) => {
    const dto = toMeetingDto(m as never)
    return {
      id: dto.id,
      title: dto.title,
      start: dto.startAt,
      end: dto.endAt,
      extendedProps: {
        status: dto.status,
        organizerId: dto.organizerId,
        inviteeId: dto.inviteeId,
        location: dto.location,
      },
    }
  })

  return sendResponse(res, { message: 'OK', data: events })
})

export const acceptMeeting = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const id = req.params.id
  if (!mongoose.isValidObjectId(id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const meeting = await MeetingModel.findById(id)
  if (!meeting || meeting.status === 'cancelled') return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  if (String(meeting.inviteeId) !== userId && String(meeting.organizerId) !== userId) {
    throw new ApiError('Forbidden', StatusCodes.FORBIDDEN)
  }
  if (meeting.status !== 'pending') {
    throw new ApiError('Meeting is not pending', StatusCodes.UNPROCESSABLE_ENTITY)
  }

  const conflict = await hasConflict({
    participantIds: meeting.participants.map(String),
    startAt: meeting.startAt,
    endAt: meeting.endAt,
    excludeMeetingId: id,
  })
  if (conflict) {
    throw new ApiError('Cannot accept: time slot conflicts with another meeting', StatusCodes.CONFLICT)
  }

  meeting.status = 'accepted'
  meeting.decidedAt = new Date()
  await meeting.save()

  return sendResponse(res, { message: 'Accepted', data: toMeetingDto(meeting.toObject()) })
})

export const rejectMeeting = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const id = req.params.id
  if (!mongoose.isValidObjectId(id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const meeting = await MeetingModel.findById(id)
  if (!meeting || meeting.status === 'cancelled') return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  if (String(meeting.inviteeId) !== userId && String(meeting.organizerId) !== userId) {
    throw new ApiError('Forbidden', StatusCodes.FORBIDDEN)
  }
  if (meeting.status !== 'pending') {
    throw new ApiError('Meeting is not pending', StatusCodes.UNPROCESSABLE_ENTITY)
  }

  meeting.status = 'rejected'
  meeting.decidedAt = new Date()
  await meeting.save()

  return sendResponse(res, { message: 'Rejected', data: toMeetingDto(meeting.toObject()) })
})

export const cancelMeeting = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const id = req.params.id
  if (!mongoose.isValidObjectId(id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const meeting = await MeetingModel.findById(id)
  if (!meeting) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  // Only organizer can cancel (simple rule)
  if (String(meeting.organizerId) !== userId) {
    throw new ApiError('Forbidden', StatusCodes.FORBIDDEN)
  }

  meeting.status = 'cancelled'
  meeting.decidedAt = new Date()
  await meeting.save()

  return sendResponse(res, { message: 'Cancelled', data: toMeetingDto(meeting.toObject()) })
})
