import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
export function validate(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body)
                req.body = schemas.body.parse(req.body);
            if (schemas.query)
                req.query = schemas.query.parse(req.query);
            if (schemas.params)
                req.params = schemas.params.parse(req.params);
            return next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                return next(new ApiError('Validation error', StatusCodes.UNPROCESSABLE_ENTITY, err.flatten()));
            }
            return next(err);
        }
    };
}
