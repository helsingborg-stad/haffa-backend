import type { Advert } from '../types'

export interface MongoAdvertMeta {
  unreservedCount: number
  reservedCount: number
}

export interface MongoAdvert {
  id: string
  versionId: string
  meta: MongoAdvertMeta
  advert: Advert
}
