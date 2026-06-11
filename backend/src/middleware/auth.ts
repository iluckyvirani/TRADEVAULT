import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt.js'
import { AppError } from '../lib/errors.js'

export interface AuthedRequest extends Request {
  userId: string
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'))
  }

  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    ;(req as AuthedRequest).userId = payload.sub
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED'))
  }
}
