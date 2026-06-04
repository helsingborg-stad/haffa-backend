import type { HaffaUser } from '../../login/types'
import type { Advert, AdvertMeta } from '../types'

export type GetAdvertMeta = (
  advert: Advert,
  user: HaffaUser,
  now?: Date
) => AdvertMeta
