import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
export function requireRole(...roles) {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role || !roles.includes(role)) {
            return next(new ApiError('Forbidden', StatusCodes.FORBIDDEN));
        }
        return next();
    };
}
