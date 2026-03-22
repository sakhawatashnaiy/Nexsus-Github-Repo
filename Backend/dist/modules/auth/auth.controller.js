import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { UserModel } from '../users/user.model.js';
import { signAccessToken, signRefreshToken } from './jwt.js';
export const register = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await UserModel.findOne({ email }).select({ _id: 1 }).lean();
    if (existing)
        throw new ApiError('Email already registered', StatusCodes.CONFLICT);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash, role: 'entrepreneur' });
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
    const payload = {
        user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
        tokens: { accessToken, refreshToken },
    };
    return sendResponse(res, { message: 'Registered', data: payload });
});
export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select('+passwordHash').lean();
    if (!user || !user.passwordHash)
        throw new ApiError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        throw new ApiError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
    const payload = {
        user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
        tokens: { accessToken, refreshToken },
    };
    return sendResponse(res, { message: 'Logged in', data: payload });
});
export const getMe = catchAsync(async (req, res) => {
    if (!req.user)
        throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED);
    return sendResponse(res, {
        message: 'OK',
        data: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
        },
    });
});
