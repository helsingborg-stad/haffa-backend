import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { tryCreateFsProfileRepositoryFromEnv } from './fs-profile-repository'
import { createInMemoryProfileRepository } from './in-memory-profile-repository'
import { tryCreateMongoDbProfileRepositoryFromEnv } from './mongo-profile-repository'
import type { ProfileRepository } from './types'

export { createInMemoryProfileRepository }

const tryCreateFromEnvDriver = () => {
  const driver = getEnv('ADVERT_DRIVER', { fallback: '' })

  const driverMap: Record<string, () => ProfileRepository | null> = {
    mongodb: tryCreateMongoDbProfileRepositoryFromEnv,
    fs: tryCreateFsProfileRepositoryFromEnv,
    memory: createInMemoryProfileRepository,
  }

  return driverMap[driver]?.() ?? null
}

export const createProfileRepositoryFromEnv = (): ProfileRepository =>
  tryCreateFromEnvDriver() || createInMemoryProfileRepository()
