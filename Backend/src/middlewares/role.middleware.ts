import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../utils/ApiError.js'

export function requireRole(...roles: Array<'entrepreneur' | 'investor' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role || !roles.includes(role)) {
      return next(new ApiError('Forbidden', StatusCodes.FORBIDDEN))
    }
    return next()
  }
}
