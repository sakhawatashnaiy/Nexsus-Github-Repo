import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { performance } from 'node:perf_hooks'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../../utils/ApiError.js'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { UserModel } from '../users/user.model.js'
import { signAccessToken, signRefreshToken } from './jwt.js'
import { env } from '../../config/env.js'
import { logger } from '../../utils/logger.js'

type AuthResponse = {
  user: { id: string; email: string; name: string; role: 'entrepreneur' | 'investor' | 'admin' }
  tokens: { accessToken: string; refreshToken?: string }
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const t0 = performance.now()
  const { name, email, password } = req.body as { name: string; email: string; password: string }

  const tDb0 = performance.now()
  const existing = await UserModel.findOne({ email }).select({ _id: 1 }).lean()
  const dbMs = performance.now() - tDb0
  if (existing) throw new ApiError('Email already registered', StatusCodes.CONFLICT)

  const tHash0 = performance.now()
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)
  const hashMs = performance.now() - tHash0

  const tCreate0 = performance.now()
  const user = await UserModel.create({ name, email, passwordHash, role: 'entrepreneur' })
  const createMs = performance.now() - tCreate0

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role })
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role })

  const payload: AuthResponse = {
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
    tokens: { accessToken, refreshToken },
  }

  const totalMs = performance.now() - t0
  if (env.LOG_AUTH_TIMINGS || totalMs > 2000) {
    const level = totalMs > 2000 ? 'warn' : 'debug'
    logger.log(level, {
      msg: 'auth.register.timing',
      totalMs: Math.round(totalMs),
      dbMs: Math.round(dbMs),
      hashMs: Math.round(hashMs),
      createMs: Math.round(createMs),
    })
  }

  return sendResponse(res, { message: 'Registered', data: payload })
})

export const login = catchAsync(async (req: Request, res: Response) => {
  const t0 = performance.now()
  const { email, password } = req.body as { email: string; password: string }

  const tDb0 = performance.now()
  const user = await UserModel.findOne({ email }).select('+passwordHash').lean()
  const dbMs = performance.now() - tDb0
  if (!user || !user.passwordHash) throw new ApiError('Invalid credentials', StatusCodes.UNAUTHORIZED)

  const tCompare0 = performance.now()
  const ok = await bcrypt.compare(password, user.passwordHash)
  const compareMs = performance.now() - tCompare0
  if (!ok) throw new ApiError('Invalid credentials', StatusCodes.UNAUTHORIZED)

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role })
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role })

  const payload: AuthResponse = {
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
    tokens: { accessToken, refreshToken },
  }

  const totalMs = performance.now() - t0
  if (env.LOG_AUTH_TIMINGS || totalMs > 2000) {
    const level = totalMs > 2000 ? 'warn' : 'debug'
    logger.log(level, {
      msg: 'auth.login.timing',
      totalMs: Math.round(totalMs),
      dbMs: Math.round(dbMs),
      compareMs: Math.round(compareMs),
    })
  }

  return sendResponse(res, { message: 'Logged in', data: payload })
})

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED)

  return sendResponse(res, {
    message: 'OK',
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  })
})
