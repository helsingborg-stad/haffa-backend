import { toMap } from './to-map'

const tryParseUrl = (s: string): URL | null => {
  try {
    return new URL(s)
  } catch (_) {
    return null
  }
}

const tryObfuscateSecret = (s: string, name?: string): string | null =>
  name && /(secret|key)/gi.test(name) ? '--secret--' : null

const tryObfuscateUrl = (s: string): string | null => {
  const url = tryParseUrl(s)
  if (!url) {
    return null
  }
  if (url.username) {
    url.username = '--user--'
  }
  if (url.password) {
    url.password = '--password--'
  }

  const sp = toMap(
    [...url.searchParams.entries()],
    ([key]) => key,
    ([key, value]) => obfuscate(value, key)
  )

  Object.keys(sp).forEach(key => url.searchParams.set(key, sp[key]))

  return url.toString()
}

/**
 *
 * Obfuscate a value before logging it!
 *
 */
export const obfuscate = (value: any, name?: string): any =>
  // eslint-disable-next-line no-nested-ternary
  typeof value === 'string'
    ? tryObfuscateSecret(value as string, name) ||
      tryObfuscateUrl(value as string) ||
      value
    : // eslint-disable-next-line no-nested-ternary
    Array.isArray(value)
    ? value.map(v => obfuscate(v, name))
    : value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, obfuscate(v, k)])
      )
    : value
