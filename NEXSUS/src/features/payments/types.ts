export type TransactionType = 'deposit' | 'withdraw' | 'transfer'
export type TransactionStatus = 'pending' | 'completed' | 'failed'
export type PaymentProvider = 'mock' | 'stripe' | 'paypal'

export type Transaction = {
  id: string
  type: TransactionType
  status: TransactionStatus
  provider: PaymentProvider
  currency: string
  amount: number
  note: string | null
  toUserId: string | null
  providerRef: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}
