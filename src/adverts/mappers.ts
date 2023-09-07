import * as uuid from 'uuid'
import type {
  Advert,
  AdvertContact,
  AdvertInput,
  AdvertLocation,
  AdvertMutationResult,
  AdvertWithMeta,
  AdvertWithMetaMutationResult,
} from './types'
import { AdvertType } from './types'
import type { HaffaUser } from '../login/types'
import { getAdvertMeta } from './advert-meta'

export const createEmptyAdvert = (defaults?: Partial<Advert>): Advert => ({
  id: '',
  versionId: '',
  type: AdvertType.recycle,
  createdBy: '',
  createdAt: new Date(0).toISOString(),
  modifiedAt: new Date(0).toISOString(),
  archivedAt: '',
  title: '',
  description: '',
  quantity: 1,
  images: [],

  unit: '',
  material: '',
  condition: '',
  usage: '',
  category: '',
  externalId: '',

  claims: [],

  location: createEmptyAdvertLocation(),
  contact: createEmptyAdvertContact(),
  ...defaults,
})

export const createEmptyAdvertLocation = (): AdvertLocation => ({
  adress: '',
  zipCode: '',
  city: '',
  country: '',
})

export const createEmptyAdvertContact = (): AdvertContact => ({
  email: '',
  phone: '',
})

export const createEmptyAdvertInput = (): AdvertInput => ({
  title: '',
  description: '',
  quantity: 1,
  images: [],

  unit: '',
  material: '',
  condition: '',
  usage: '',
  category: '',
  externalId: '',

  location: createEmptyAdvertLocation(),
  contact: createEmptyAdvertContact(),
})

export const mapCreateAdvertInputToAdvert = (
  input: AdvertInput,
  user: HaffaUser,
  when: string = new Date().toISOString()
): Advert => ({
  ...createEmptyAdvert(),
  id: uuid.v4().toString(),
  createdBy: user.id,
  createdAt: when,
  modifiedAt: when,
  ...input,
})

export const patchAdvertWithAdvertInput = (
  advert: Advert,
  input: AdvertInput
): Advert => ({
  ...advert,
  ...input,
  modifiedAt: new Date().toISOString(),
})

export const mapAdvertToAdvertWithMeta = (
  user: HaffaUser,
  advert: Advert | null
): AdvertWithMeta | null =>
  advert
    ? {
        ...createEmptyAdvert(),
        ...advert,
        ...{
          get meta() {
            return getAdvertMeta(advert, user)
          },
        },
      }
    : null

export const mapAdvertsToAdvertsWithMeta = (
  user: HaffaUser,
  adverts: (Advert | null)[]
): (AdvertWithMeta | null)[] =>
  adverts.map(a => mapAdvertToAdvertWithMeta(user, a)).filter(a => a)

export const mapAdvertMutationResultToAdvertWithMetaMutationResult = (
  user: HaffaUser,
  result: AdvertMutationResult
): AdvertWithMetaMutationResult => ({
  advert: mapAdvertToAdvertWithMeta(user, result.advert),
  status: result.status,
})
