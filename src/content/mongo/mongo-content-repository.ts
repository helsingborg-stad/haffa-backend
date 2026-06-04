import type { MongoConnection } from '../../mongodb-utils/types'
import type { Services } from '../../types'
import type { ContentRepository } from '../types'
import { createGetComposition } from './api/get-composition'
import { createUpdateComposition } from './api/update-composition'
import type { MongoViewComposition } from './types'

export const createMongoContentRepository = (
  connection: MongoConnection<MongoViewComposition>,
  services: Pick<Services, 'files'>
): ContentRepository => ({
  getComposition: createGetComposition(connection),
  updateComposition: createUpdateComposition(connection, services),
})
