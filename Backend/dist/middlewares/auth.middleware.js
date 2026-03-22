import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../modules/auth/jwt.js';
import { UserModel } from '../modules/users/user.model.js';
export async function requireAuth(req, _res, next) {
    try {
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
        if (!token)
            return next(new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED));
        const payload = verifyAccessToken(token);
        const user = await UserModel.findById(payload.sub).lean();
        if (!user || user.isDeleted)
            return next(new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED));
        req.user = {
            id: String(user._id),
            role: user.role,
            email: user.email,
            name: user.name,
        };
        return next();
    }
    catch (err) {
        return next(err);
    }
}
