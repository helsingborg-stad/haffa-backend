import type { SettingsService } from '../settings/types'
import type { ApiKey } from './types'

const coalesce = (a: any, b: string): string => (typeof a === 'string' ? a : b)

const normalizeApiKey = (k?: Partial<ApiKey>): ApiKey => ({
  secret: coalesce(k?.secret, '').trim(),
  expires: coalesce(k?.expires, '').trim(),
  email: coalesce(k?.email, '').trim(),
})

const normalizeApiKeys = (apiKeys: Partial<ApiKey>[] | null): ApiKey[] =>
  Array.isArray(apiKeys)
    ? apiKeys
        .map(normalizeApiKey)
        .filter(({ email, secret }) => email && secret)
    : []

export const apiKeysAdapter = (settings: SettingsService) => ({
  getApiKeys: () =>
    settings.getSetting<ApiKey[]>('api-keys').then(normalizeApiKeys),
  updateApiKeys: (apiKeys: Partial<ApiKey>[]) =>
    settings
      .updateSetting('api-keys', normalizeApiKeys(apiKeys))
      .then(normalizeApiKeys),
})
