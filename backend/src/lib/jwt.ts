import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config.js'

export interface AccessPayload {
  sub: string
  type: 'access'
}

export interface RefreshPayload {
  sub: string
  type: 'refresh'
  jti: string
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' } satisfies AccessPayload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpires as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh', jti } satisfies RefreshPayload,
    config.jwtSecret,
    { expiresIn: config.jwtRefreshExpires as jwt.SignOptions['expiresIn'] },
  )
}

export function verifyAccessToken(token: string): AccessPayload {
  const payload = jwt.verify(token, config.jwtSecret) as AccessPayload
  if (payload.type !== 'access') throw new jwt.JsonWebTokenError('Invalid token type')
  return payload
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const payload = jwt.verify(token, config.jwtSecret) as RefreshPayload
  if (payload.type !== 'refresh') throw new jwt.JsonWebTokenError('Invalid token type')
  return payload
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function refreshExpiresAt(): Date {
  const match = /^(\d+)([dhms])$/.exec(config.jwtRefreshExpires)
  if (!match) return new Date(Date.now() + 7 * 86400000)
  const n = Number(match[1])
  const unit = match[2]
  const ms =
    unit === 'd' ? n * 86400000 : unit === 'h' ? n * 3600000 : unit === 'm' ? n * 60000 : n * 1000
  return new Date(Date.now() + ms)
}
