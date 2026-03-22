import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'

export type AccessTokenPayload = {
  sub: string
  role?: string
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export function signRefreshToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
  } catch {
    throw new ApiError('Unauthorized', 401)
  }
}
