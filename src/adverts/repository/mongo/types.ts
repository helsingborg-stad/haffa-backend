import type { Advert } from '../../types'

export interface MongoAdvertMeta {
  unreservedCount: number
  reservedCount: number
  collectedCount: number
  archived: boolean
}

export interface MongoAdvert {
  id: string
  versionId: string
  meta: MongoAdvertMeta
  advert: Advert
}
