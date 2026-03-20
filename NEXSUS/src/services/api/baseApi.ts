import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  createApi,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { logout } from '@/features/auth/authSlice'

type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
  errors?: unknown
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.success === 'boolean' && typeof v.message === 'string'
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (token) headers.set('authorization', `Bearer ${token}`)
    headers.set('accept', 'application/json')
    return headers
  },
})

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  // Backend responses are shaped as { success, message, data }. Unwrap `data`
  // so endpoints can type their return value as the actual data payload.
  if (result.data && isApiResponse(result.data)) {
    const body = result.data
    if (body.data !== undefined) {
      result.data = body.data
    }
  }

  if (result.error && result.error.status === 401) {
    api.dispatch(logout())
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Me', 'Dashboard', 'Project', 'Document', 'Transaction', 'Meeting'],
  endpoints: () => ({}),
})
