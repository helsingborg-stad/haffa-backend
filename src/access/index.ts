import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { readFileSync } from 'fs'
import type { AccessRule, AccessService } from './types'

const getRuleForUser = (
  accessList: AccessRule[],
  emailAddress: string
): AccessRule | undefined =>
  accessList.find(rule => new RegExp(rule.pattern).test(emailAddress))

const createAccessService = (accessList: AccessRule[] = []): AccessService => ({
  isAuthorized: (emailAddress: string) =>
    Boolean(getRuleForUser(accessList, emailAddress)),
  hasRole: (emailAddress: string, roleName: string) =>
    getRuleForUser(accessList, emailAddress)?.roles.includes(roleName) ?? false,
})

const createAccessServiceFromEnv = (): AccessService => {
  const path = getEnv('FS_ACCESS_FILE', { fallback: './default.json' })

  let json = []
  try {
    json = JSON.parse(readFileSync(path).toString())
  } catch (ex) {
    throw new Error(`File ${path} not found.`)
  }
  return createAccessService(json)
}

export { createAccessServiceFromEnv, createAccessService }
