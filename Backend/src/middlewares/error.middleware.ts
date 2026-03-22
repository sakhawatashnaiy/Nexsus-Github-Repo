import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

export function globalErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isApiError = err instanceof ApiError
  const statusCode = isApiError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR
  const message = isApiError ? err.message : 'Internal server error'

  if (statusCode >= 500) {
    logger.error({ message, err })
  }

  const response = {
    success: false,
    message,
    errors: isApiError ? err.errors : undefined,
    stack: env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined,
  }

  res.status(statusCode).json(response)
}
