import { join } from 'path'
import type { AdvertsRepository } from '../../types'
import { createFsAdvertsRepository } from './fs-adverts-repository'
import type { StartupLog } from '../../../types'
import { getEnv } from '../../../lib/gdi-api-node'
import type { GetAdvertMeta } from '../../advert-meta/types'

export const tryCreateFsAdvertsRepositoryFromEnv = (
  startupLog: StartupLog,
  getAdvertMeta: GetAdvertMeta
): AdvertsRepository | null => {
  const dataFolder = getEnv('FS_DATA_PATH', { fallback: '' })
  return dataFolder
    ? startupLog.echo(
        createFsAdvertsRepository(
          join(process.cwd(), dataFolder, 'adverts'),
          getAdvertMeta
        ),
        {
          name: 'adverts',
          config: {
            on: 'fs',
            dataFolder,
          },
        }
      )
    : null
}
