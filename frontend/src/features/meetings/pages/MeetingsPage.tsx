import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type ToolbarProps,
  type View,
} from 'react-big-calendar'
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { VideoCallPanel } from '@/features/meetings/components/VideoCallPanel'
import { useListProjectsQuery } from '@/features/projects/projectsApi'
import type { Project } from '@/features/projects/types'
import {
  useAcceptMeetingMutation,
  useCancelMeetingMutation,
  useListMeetingEventsQuery,
  useListMeetingsQuery,
  useRejectMeetingMutation,
} from '@/features/meetings/meetingsApi'
import type { Meeting, MeetingStatus } from '@/features/meetings/types'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { 'en-US': enUS },
})

type CalendarEvent = {
  id: string
  kind: 'meeting' | 'project'
  title: string
  start: Date
  end: Date
  status?: MeetingStatus
  organizerId?: string
  inviteeId?: string
  location?: string | null
  projectId?: string
}

function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function formatStatus(status: MeetingStatus) {
  if (status === 'pending') return 'Pending'
  if (status === 'accepted') return 'Accepted'
  if (status === 'rejected') return 'Rejected'
  return 'Cancelled'
}

function statusBadgeClassName(status: MeetingStatus) {
  if (status === 'accepted') {
    return 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
  }
  if (status === 'pending') {
    return 'text-[rgb(var(--muted))]'
  }
  return 'border-[rgb(var(--danger))] text-[rgb(var(--danger))]'
}

function toRange(view: View, date: Date) {
  if (view === 'month') {
    return { from: startOfMonth(date), to: endOfMonth(date) }
  }
  if (view === 'week') {
    return { from: startOfWeek(date, { locale: enUS }), to: endOfWeek(date, { locale: enUS }) }
  }
  if (view === 'day') {
    return { from: startOfDay(date), to: endOfDay(date) }
  }

  // agenda / other views: treat as a week around the current date
  return { from: startOfWeek(date, { locale: enUS }), to: endOfWeek(date, { locale: enUS }) }
}

function CalendarToolbar({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent>) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          aria-label="Go to today"
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('PREV')}
          aria-label="Previous"
        >
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('NEXT')}
          aria-label="Next"
        >
          Next
        </Button>
        <div className="ml-1 text-base font-semibold tracking-tight sm:text-sm">{label}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={view === 'month' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onView('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onView('day')}
        >
          Day
        </Button>
        <Button
          variant={view === 'agenda' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onView('agenda')}
        >
          Agenda
        </Button>
      </div>
    </div>
  )
}

function CalendarEventContent({ event }: EventProps<CalendarEvent>) {
  if (event.kind === 'project') {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--muted))]" />
        <span className="min-w-0 truncate text-base font-semibold sm:text-sm">{event.title}</span>
        <span className="shrink-0 rounded border border-[rgb(var(--border))] px-1.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--muted))]">
          Project
        </span>
      </div>
    )
  }

  const dotClassName =
    event.status === 'accepted'
      ? 'bg-[rgb(var(--primary))]'
      : event.status === 'pending'
        ? 'bg-[rgb(var(--muted))]'
        : 'bg-[rgb(var(--danger))]'

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} />
      <span className="min-w-0 truncate text-base font-semibold sm:text-sm">{event.title}</span>
    </div>
  )
}

export function MeetingsPage() {
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'day'
    return window.matchMedia('(max-width: 640px)').matches ? 'agenda' : 'day'
  })
  const [date, setDate] = useState<Date>(new Date())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setView((v) => (mq.matches && v === 'day' ? 'agenda' : v))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const me = useAppSelector(selectCurrentUser)
  const shouldLoadProjects = me?.role === 'entrepreneur' || me?.role === 'admin'

  const range = useMemo(() => {
    const r = toRange(view, date)
    // Small buffer so we don't miss events on view transitions.
    return {
      from: addDays(r.from, -7).toISOString(),
      to: addDays(r.to, 7).toISOString(),
    }
  }, [view, date])

  const upcomingRange = useMemo(() => {
    const now = new Date()
    return { from: now.toISOString(), to: addDays(now, 30).toISOString() }
  }, [])

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useListMeetingEventsQuery(range)

  const {
    data: meetingsData,
    isLoading: isMeetingsLoading,
    isError: isMeetingsError,
    refetch: refetchMeetings,
  } = useListMeetingsQuery(upcomingRange)

  const { data: visibleMeetingsData } = useListMeetingsQuery(range)

  const {
    data: projectsData,
    isError: isProjectsError,
    refetch: refetchProjects,
  } = useListProjectsQuery(undefined, { skip: !shouldLoadProjects })

  const [acceptMeeting, { isLoading: isAccepting }] = useAcceptMeetingMutation()
  const [rejectMeeting, { isLoading: isRejecting }] = useRejectMeetingMutation()
  const [cancelMeeting, { isLoading: isCancelling }] = useCancelMeetingMutation()

  const events: CalendarEvent[] = useMemo(() => {
    const apiEvents = eventsData ?? []
    const meetingEvents = apiEvents
      .map((e) => {
        const start = new Date(e.start)
        const end = new Date(e.end)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

        return {
          id: e.id,
          kind: 'meeting',
          title: e.title,
          start,
          end,
          status: e.extendedProps.status,
          organizerId: e.extendedProps.organizerId,
          inviteeId: e.extendedProps.inviteeId,
          location: e.extendedProps.location,
        } satisfies CalendarEvent
      })
      .filter(isNonNull)

    const projects = projectsData ?? []
    const projectEvents = projects
      .map((p) => {
        const when = p.dueDate ?? p.updatedAt
        const start = new Date(when)
        if (Number.isNaN(start.getTime())) return null
        const end = new Date(start.getTime() + 30 * 60 * 1000)
        return {
          id: `project:${p.id}`,
          kind: 'project',
          projectId: p.id,
          title: p.name,
          start,
          end,
        } satisfies CalendarEvent
      })
      .filter(isNonNull)

    return [...meetingEvents, ...projectEvents]
  }, [eventsData, projectsData])

  const upcomingMeetings: Meeting[] = useMemo(() => {
    const list = meetingsData ?? []
    const now = Date.now()
    return list
      .filter((m) => new Date(m.endAt).getTime() >= now)
      .slice()
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 8)
  }, [meetingsData])

  const counts = useMemo(() => {
    const list = meetingsData ?? []
    const base = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 }
    for (const m of list) base[m.status] += 1
    return base
  }, [meetingsData])

  const isMutating = isAccepting || isRejecting || isCancelling

  const canCancel = (m: Meeting) => Boolean(me?.id && m.organizerId === me.id && m.status !== 'cancelled')
  const canDecide = (m: Meeting) => m.status === 'pending'

  const selectedMeeting = useMemo(() => {
    if (!selectedId) return null
    if (selectedId.startsWith('project:')) return null
    const upcoming = meetingsData ?? []
    const visible = visibleMeetingsData ?? []
    return [...visible, ...upcoming].find((m) => m.id === selectedId) ?? null
  }, [selectedId, meetingsData, visibleMeetingsData])

  const selectedProject: Project | null = useMemo(() => {
    if (!selectedId?.startsWith('project:')) return null
    const id = selectedId.slice('project:'.length)
    return (projectsData ?? []).find((p) => p.id === id) ?? null
  }, [selectedId, projectsData])

  function jumpToMeeting(m: Meeting) {
    setSelectedId(m.id)
    setDate(new Date(m.startAt))
    setView('day')
  }

  async function onAccept(id: string) {
    try {
      await acceptMeeting({ id }).unwrap()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function onReject(id: string) {
    try {
      await rejectMeeting({ id }).unwrap()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async function onCancel(id: string) {
    try {
      await cancelMeeting({ id }).unwrap()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tight">Meetings</h2>
          <p className="mt-1 text-base font-medium italic text-[rgb(var(--muted))] sm:text-sm">
            Calendar view of meeting requests and scheduled calls.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={statusBadgeClassName('pending')}>Pending: {counts.pending}</Badge>
            <Badge className={statusBadgeClassName('accepted')}>Accepted: {counts.accepted}</Badge>
            <Badge className={statusBadgeClassName('rejected')}>Rejected: {counts.rejected}</Badge>
            <Badge className={statusBadgeClassName('cancelled')}>Cancelled: {counts.cancelled}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              refetchEvents()
              refetchMeetings()
              if (shouldLoadProjects) refetchProjects()
            }}
            disabled={isEventsLoading || isMeetingsLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isEventsError ? (
        <ErrorState
          title="Could not load calendar data"
          description="Check your API configuration and try again."
          onRetry={() => refetchEvents()}
        />
      ) : isEventsLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-4 motion-safe:animate-fade-up">
            <Skeleton className="h-[650px] w-full" />
          </Card>
          <Card className="p-4 motion-safe:animate-fade-up">
            <Skeleton className="h-[650px] w-full" />
          </Card>
        </div>
      ) : events.length === 0 && upcomingMeetings.length === 0 ? (
        <EmptyState
          title="No events"
          description="No meetings scheduled for this time range."
          action={{
            label: 'Refresh',
            onClick: () => {
              refetchEvents()
              refetchMeetings()
              if (shouldLoadProjects) refetchProjects()
            },
          }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-4 motion-safe:animate-fade-up">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[rgb(var(--muted))]">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--primary))]" />
                  Accepted
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--muted))]" />
                  Pending
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--danger))]" />
                  Rejected/Cancelled
                </div>
                {shouldLoadProjects ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[rgb(var(--muted))]" />
                    Project milestones
                  </div>
                ) : null}
              </div>
              <div className="text-xs font-medium text-[rgb(var(--muted))]">
                Tip: Click an event to see details.
              </div>
            </div>

            <div className="h-[70vh] sm:h-[650px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                defaultView={view}
                onSelectEvent={(e) => setSelectedId(e.id)}
                popup
                style={{ height: '100%' }}
                components={{ toolbar: CalendarToolbar, event: CalendarEventContent }}
                eventPropGetter={(event, _start, _end, isSelected) => {
                  if (event.kind === 'project') {
                    return {
                      className:
                        'cursor-pointer transition-transform duration-150 ease-out hover:-translate-y-px',
                      style: {
                        border: `1px solid rgb(var(--border))`,
                        backgroundColor: 'rgb(var(--card))',
                        color: 'rgb(var(--fg))',
                        borderRadius: 10,
                        boxShadow: isSelected
                          ? `0 0 0 2px rgb(var(--primary) / 0.35)`
                          : undefined,
                      },
                    }
                  }

                  const isPending = event.status === 'pending'
                  const isAccepted = event.status === 'accepted'
                  const isDanger = event.status === 'rejected' || event.status === 'cancelled'

                  const borderColor = isAccepted
                    ? 'rgb(var(--primary))'
                    : isDanger
                      ? 'rgb(var(--danger))'
                      : 'rgb(var(--border))'

                  const backgroundColor = isAccepted
                    ? 'rgb(var(--primary) / 0.18)'
                    : isDanger
                      ? 'rgb(var(--danger) / 0.16)'
                      : 'rgb(var(--card))'

                  return {
                    className:
                      'cursor-pointer transition-transform duration-150 ease-out hover:-translate-y-px',
                    style: {
                      border: `1px solid ${borderColor}`,
                      backgroundColor,
                      color: 'rgb(var(--fg))',
                      borderRadius: 10,
                      boxShadow: isSelected ? `0 0 0 2px rgb(var(--primary) / 0.35)` : undefined,
                      opacity: isPending ? 0.95 : 1,
                    },
                  }
                }}
              />
            </div>
          </Card>

          <Card className="p-4 motion-safe:animate-fade-up lg:sticky lg:top-6 lg:self-start">
            <div>
              <div className="text-sm font-semibold">Details</div>
              <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                Select an event to view summary and actions.
              </div>

              {selectedProject ? (
                <div className="mt-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{selectedProject.name}</div>
                      <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                        Schedule: {format(new Date(selectedProject.dueDate ?? selectedProject.updatedAt), 'EEE, MMM d · p')}
                      </div>
                    </div>
                    <span className="rounded border border-[rgb(var(--border))] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--muted))]">
                      Project
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDate(new Date(selectedProject.dueDate ?? selectedProject.updatedAt))
                        setView('day')
                      }}
                    >
                      Open day
                    </Button>
                  </div>
                </div>
              ) : selectedMeeting ? (
                <div className="mt-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{selectedMeeting.title}</div>
                      <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                        {format(new Date(selectedMeeting.startAt), 'EEE, MMM d · p')} –{' '}
                        {format(new Date(selectedMeeting.endAt), 'p')}
                      </div>
                      {selectedMeeting.location ? (
                        <div className="mt-0.5 truncate text-xs text-[rgb(var(--muted))]">
                          {selectedMeeting.location}
                        </div>
                      ) : null}
                    </div>
                    <Badge className={statusBadgeClassName(selectedMeeting.status)}>
                      {formatStatus(selectedMeeting.status)}
                    </Badge>
                  </div>

                  {selectedMeeting.description ? (
                    <div className="mt-3 text-sm text-[rgb(var(--muted))]">
                      {selectedMeeting.description}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => jumpToMeeting(selectedMeeting)}
                    >
                      Open day
                    </Button>

                    {canDecide(selectedMeeting) ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onAccept(selectedMeeting.id)}
                          disabled={isMutating}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onReject(selectedMeeting.id)}
                          disabled={isMutating}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}

                    {canCancel(selectedMeeting) ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onCancel(selectedMeeting.id)}
                        disabled={isMutating}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>

                  <VideoCallPanel
                    roomId={selectedMeeting.id}
                    disabled={
                      selectedMeeting.status === 'cancelled' ||
                      selectedMeeting.status === 'rejected'
                    }
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-sm text-[rgb(var(--muted))]">
                    Nothing selected yet. Choose a meeting to enable calling.
                  </div>
                  <VideoCallPanel roomId="preview" disabled />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Upcoming</div>
                <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">Next 30 days</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchMeetings()}
                disabled={isMeetingsLoading}
              >
                Refresh
              </Button>
            </div>

            {isMeetingsError ? (
              <div className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-sm text-[rgb(var(--muted))]">
                Could not load upcoming meetings.
              </div>
            ) : isMeetingsLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-sm text-[rgb(var(--muted))]">
                No upcoming meetings.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {isProjectsError ? (
                  <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-xs text-[rgb(var(--muted))]">
                    Projects could not be loaded for calendar milestones.
                  </div>
                ) : null}
                {upcomingMeetings.map((m) => {
                  const isSelected = selectedId === m.id
                  const start = new Date(m.startAt)
                  const end = new Date(m.endAt)
                  const when = `${format(start, 'EEE, MMM d · p')} – ${format(end, 'p')}`

                  return (
                    <div
                      key={m.id}
                      className={
                        'rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 transition-all duration-150 ease-out ' +
                        (isSelected
                          ? 'ring-2 ring-[rgb(var(--primary))] ring-offset-2 ring-offset-[rgb(var(--bg))]'
                          : '')
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() => jumpToMeeting(m)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') jumpToMeeting(m)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{m.title}</div>
                          <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">{when}</div>
                          {m.location ? (
                            <div className="mt-0.5 truncate text-xs text-[rgb(var(--muted))]">
                              {m.location}
                            </div>
                          ) : null}
                        </div>
                        <Badge className={statusBadgeClassName(m.status)}>{formatStatus(m.status)}</Badge>
                      </div>

                      {(canDecide(m) || canCancel(m)) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {canDecide(m) ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onAccept(m.id)
                                }}
                                disabled={isMutating}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onReject(m.id)
                                }}
                                disabled={isMutating}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}

                          {canCancel(m) ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCancel(m.id)
                              }}
                              disabled={isMutating}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
