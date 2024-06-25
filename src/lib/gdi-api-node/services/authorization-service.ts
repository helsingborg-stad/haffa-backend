import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { getEnv } from '../config'

export interface AuthorizationService {
  /**
   * Given a JWT, if not null/empty,
   * extract user from payload.
   *
   * Should throw if JWT validation fails
   */
  tryGetUserFromJwt: (token: string) => any
}

/**
 * Recognize JWT exceptions and map them to http 401 exceptions
 *
 */
const mapErrors = <T>(fn: () => T): T => {
  try {
    return fn()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw createError(401, err)
    }
    throw err
  }
}

const createGetDefaultUser = (json: string): any | null =>
  json ? () => JSON.parse(json) : null

export const createAuthorizationService = (
  sharedSecret: string,
  getDefaultUser?: () => any | null
): AuthorizationService => ({
  tryGetUserFromJwt: token =>
    mapErrors(() =>
      token
        ? jwt.verify(token, sharedSecret, { complete: true })?.payload
        : getDefaultUser?.() || null
    ),
})

export const createAuthorizationServiceFromEnv = (): AuthorizationService =>
  createAuthorizationService(
    getEnv('JWT_SHARED_SECRET'),
    createGetDefaultUser(getEnv('JWT_DEFAULT_USER', { fallback: '' }))
  )
