import { baseApi } from '@/services/api/baseApi'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/features/auth/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Me'],
    }),
  }),
  overrideExisting: false,
})

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } = authApi
