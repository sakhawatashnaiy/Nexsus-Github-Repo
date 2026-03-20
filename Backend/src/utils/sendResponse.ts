import type { Response } from 'express'

type SendResponseArgs<T> = {
  success?: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
  errors?: unknown
}

export function sendResponse<T>(res: Response, payload: SendResponseArgs<T>) {
  const body = {
    success: payload.success ?? true,
    message: payload.message,
    data: payload.data,
    meta: payload.meta,
    errors: payload.errors,
  }

  return res.json(body)
}
