import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError, type ZodSchema } from 'zod'
import { ApiError } from '../utils/ApiError.js'

type Schemas = {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body)
      if (schemas.query) req.query = schemas.query.parse(req.query)
      if (schemas.params) req.params = schemas.params.parse(req.params)
      return next()
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ApiError('Validation error', StatusCodes.UNPROCESSABLE_ENTITY, err.flatten()))
      }
      return next(err)
    }
  }
}
