export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export type Meeting = {
  id: string
  organizerId: string
  inviteeId: string
  title: string
  description: string | null
  location: string | null
  startAt: string
  endAt: string
  status: MeetingStatus
  decidedAt: string | null
  createdAt: string
  updatedAt: string
}

export type MeetingEvent = {
  id: string
  title: string
  start: string
  end: string
  extendedProps: {
    status: MeetingStatus
    organizerId: string
    inviteeId: string
    location: string | null
  }
}

export type ListMeetingsQuery = {
  from?: string
  to?: string
  status?: MeetingStatus
}
