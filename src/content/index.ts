import type { Services, StartupLog } from '../types'
import { tryCreateMongoContentRepositoryFromEnv } from './mongo'
import { createNullContentRepository } from './null-content-repository'
import type { ContentRepository } from './types'

export { createNullContentRepository, tryCreateMongoContentRepositoryFromEnv }

export const createContentRepositoryFromEnv = (
  startupLog: StartupLog,
  services: Pick<Services, 'files'>
): ContentRepository =>
  tryCreateMongoContentRepositoryFromEnv(startupLog, services) ||
  startupLog.echo(createNullContentRepository(), {
    name: 'content',
    config: { on: 'null' },
  })
