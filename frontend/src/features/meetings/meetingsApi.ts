import { baseApi } from '@/services/api/baseApi'
import type { ListMeetingsQuery, Meeting, MeetingEvent } from '@/features/meetings/types'

export const meetingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMeetings: builder.query<Meeting[], ListMeetingsQuery | void>({
      query: (arg) => ({
        url: '/meetings',
        params: arg && typeof arg === 'object' ? arg : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: 'Meeting' as const, id: m.id })),
              { type: 'Meeting' as const, id: 'LIST' },
            ]
          : [{ type: 'Meeting' as const, id: 'LIST' }],
    }),

    listMeetingEvents: builder.query<MeetingEvent[], ListMeetingsQuery | void>({
      query: (arg) => ({
        url: '/meetings/events',
        params: arg && typeof arg === 'object' ? arg : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: 'Meeting' as const, id: e.id })),
              { type: 'Meeting' as const, id: 'LIST' },
            ]
          : [{ type: 'Meeting' as const, id: 'LIST' }],
    }),

    acceptMeeting: builder.mutation<Meeting, { id: string }>({
      query: ({ id }) => ({ url: `/meetings/${id}/accept`, method: 'POST' }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Meeting', id: arg.id },
        { type: 'Meeting', id: 'LIST' },
      ],
    }),

    rejectMeeting: builder.mutation<Meeting, { id: string }>({
      query: ({ id }) => ({ url: `/meetings/${id}/reject`, method: 'POST' }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Meeting', id: arg.id },
        { type: 'Meeting', id: 'LIST' },
      ],
    }),

    cancelMeeting: builder.mutation<Meeting, { id: string }>({
      query: ({ id }) => ({ url: `/meetings/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Meeting', id: arg.id },
        { type: 'Meeting', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListMeetingsQuery,
  useListMeetingEventsQuery,
  useAcceptMeetingMutation,
  useRejectMeetingMutation,
  useCancelMeetingMutation,
} = meetingsApi
