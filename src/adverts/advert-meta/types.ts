import type { HaffaUser } from '../../login/types'
import type { Advert, AdvertMeta } from '../types'

export interface GetAdvertMeta {
  (advert: Advert, user: HaffaUser, now?: Date): AdvertMeta
}
