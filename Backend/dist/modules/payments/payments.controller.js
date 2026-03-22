import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { getSkipLimit } from '../../utils/pagination.js';
import { env } from '../../config/env.js';
import { TransactionModel } from './transaction.model.js';
import { UserModel } from '../users/user.model.js';
function normalizeCurrency(value) {
    const c = typeof value === 'string' ? value.trim().toUpperCase() : 'USD';
    return c.length === 3 ? c : 'USD';
}
function chooseProvider(requested) {
    return requested ?? env.PAYMENT_PROVIDER;
}
function toDto(t) {
    return {
        id: String(t._id),
        type: t.type,
        status: t.status,
        provider: t.provider,
        currency: t.currency,
        amount: t.amount,
        note: t.note ?? null,
        toUserId: t.toUserId ? String(t.toUserId) : null,
        providerRef: t.providerRef ?? null,
        failureReason: t.failureReason ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    };
}
export const listTransactions = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const q = req.query;
    const { skip, limit } = getSkipLimit({ page: q.page, limit: q.limit });
    const filter = { userId };
    if (q.status)
        filter.status = q.status;
    if (q.type)
        filter.type = q.type;
    const [items, total] = await Promise.all([
        TransactionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        TransactionModel.countDocuments(filter),
    ]);
    return sendResponse(res, {
        message: 'OK',
        data: items.map((t) => toDto(t)),
        meta: { page: q.page, limit: q.limit, total },
    });
});
export const deposit = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const provider = chooseProvider(req.body?.provider);
    const currency = normalizeCurrency(req.body?.currency);
    const tx = await TransactionModel.create({
        userId,
        type: 'deposit',
        status: provider === 'mock' ? 'completed' : 'pending',
        provider,
        currency,
        amount: Number(req.body.amount),
        note: req.body.note,
    });
    // Stripe/PayPal sandbox hooks are intentionally minimal (mock-first milestone)
    // Stripe can be wired later via PaymentIntent + webhooks.
    if (provider === 'stripe' && !env.STRIPE_SECRET_KEY) {
        await TransactionModel.updateOne({ _id: tx._id }, { $set: { status: 'failed', failureReason: 'Stripe not configured' } });
    }
    return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Created',
        data: toDto((await TransactionModel.findById(tx._id).lean())),
    });
});
export const withdraw = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const provider = chooseProvider(req.body?.provider);
    const currency = normalizeCurrency(req.body?.currency);
    const tx = await TransactionModel.create({
        userId,
        type: 'withdraw',
        status: provider === 'mock' ? 'completed' : 'pending',
        provider,
        currency,
        amount: Number(req.body.amount),
        note: req.body.note,
    });
    if (provider === 'stripe' && !env.STRIPE_SECRET_KEY) {
        await TransactionModel.updateOne({ _id: tx._id }, { $set: { status: 'failed', failureReason: 'Stripe not configured' } });
    }
    return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Created',
        data: toDto((await TransactionModel.findById(tx._id).lean())),
    });
});
export const transfer = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const toUserId = req.body.toUserId;
    if (!mongoose.isValidObjectId(toUserId)) {
        return sendResponse(res.status(StatusCodes.UNPROCESSABLE_ENTITY), {
            success: false,
            message: 'Validation failed',
            errors: [{ path: ['toUserId'], message: 'Invalid user id' }],
        });
    }
    const recipient = await UserModel.findById(toUserId).lean();
    if (!recipient || recipient.isDeleted) {
        return sendResponse(res.status(StatusCodes.NOT_FOUND), { success: false, message: 'Recipient not found', errors: [] });
    }
    const provider = chooseProvider(req.body?.provider);
    const currency = normalizeCurrency(req.body?.currency);
    const tx = await TransactionModel.create({
        userId,
        toUserId,
        type: 'transfer',
        status: provider === 'mock' ? 'completed' : 'pending',
        provider,
        currency,
        amount: Number(req.body.amount),
        note: req.body.note,
    });
    if (provider === 'stripe' && !env.STRIPE_SECRET_KEY) {
        await TransactionModel.updateOne({ _id: tx._id }, { $set: { status: 'failed', failureReason: 'Stripe not configured' } });
    }
    return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Created',
        data: toDto((await TransactionModel.findById(tx._id).lean())),
    });
});
