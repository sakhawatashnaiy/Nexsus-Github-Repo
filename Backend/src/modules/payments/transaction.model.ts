import mongoose, { Schema } from 'mongoose'

export type TransactionType = 'deposit' | 'withdraw' | 'transfer'
export type TransactionStatus = 'pending' | 'completed' | 'failed'
export type PaymentProvider = 'mock' | 'stripe' | 'paypal'

export type TransactionDoc = {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  toUserId?: mongoose.Types.ObjectId
  type: TransactionType
  status: TransactionStatus
  provider: PaymentProvider
  currency: string
  amount: number
  note?: string
  providerRef?: string
  failureReason?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    provider: { type: String, enum: ['mock', 'stripe', 'paypal'], default: 'mock', index: true },
    currency: { type: String, required: true, default: 'USD' },
    amount: { type: Number, required: true },
    note: { type: String },
    providerRef: { type: String },
    failureReason: { type: String },
  },
  { timestamps: true },
)

TransactionSchema.index({ userId: 1, createdAt: -1 })

export const TransactionModel = mongoose.model<TransactionDoc>('Transaction', TransactionSchema)
