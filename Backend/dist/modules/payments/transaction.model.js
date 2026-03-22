import mongoose, { Schema } from 'mongoose';
const TransactionSchema = new Schema({
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
}, { timestamps: true });
TransactionSchema.index({ userId: 1, createdAt: -1 });
export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
