import { baseApi } from '@/services/api/baseApi'
import type { DashboardStats } from '@/features/dashboard/types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({ url: '/dashboard/stats' }),
      providesTags: ['Dashboard'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetDashboardStatsQuery } = dashboardApi
