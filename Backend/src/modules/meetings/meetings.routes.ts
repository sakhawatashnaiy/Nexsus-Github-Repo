import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import * as controller from './meetings.controller.js'
import {
  createMeetingSchema,
  listMeetingsQuery,
  meetingIdParams,
} from './meetings.validation.js'

export const meetingRoutes = Router()

meetingRoutes.get('/', requireAuth, validate({ query: listMeetingsQuery }), controller.listMeetings)
meetingRoutes.get('/events', requireAuth, validate({ query: listMeetingsQuery }), controller.listMeetingEvents)
meetingRoutes.post('/', requireAuth, validate({ body: createMeetingSchema }), controller.createMeeting)

meetingRoutes.post('/:id/accept', requireAuth, validate({ params: meetingIdParams }), controller.acceptMeeting)
meetingRoutes.post('/:id/reject', requireAuth, validate({ params: meetingIdParams }), controller.rejectMeeting)
meetingRoutes.post('/:id/cancel', requireAuth, validate({ params: meetingIdParams }), controller.cancelMeeting)
