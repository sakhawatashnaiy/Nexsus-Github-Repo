import { baseApi } from '@/services/api/baseApi'
import type { Transaction } from '@/features/payments/types'

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTransactions: builder.query<Transaction[], void>({
      query: () => ({ url: '/payments/transactions' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'Transaction' as const, id: t.id })),
              { type: 'Transaction' as const, id: 'LIST' },
            ]
          : [{ type: 'Transaction' as const, id: 'LIST' }],
    }),

    deposit: builder.mutation<Transaction, { amount: number; currency?: string; note?: string }>({
      query: (body) => ({ url: '/payments/deposit', method: 'POST', body: { ...body, provider: 'mock' } }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    withdraw: builder.mutation<Transaction, { amount: number; currency?: string; note?: string }>({
      query: (body) => ({ url: '/payments/withdraw', method: 'POST', body: { ...body, provider: 'mock' } }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    transfer: builder.mutation<Transaction, { toUserId: string; amount: number; currency?: string; note?: string }>({
      query: (body) => ({ url: '/payments/transfer', method: 'POST', body: { ...body, provider: 'mock' } }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const { useListTransactionsQuery, useDepositMutation, useWithdrawMutation, useTransferMutation } = paymentsApi
