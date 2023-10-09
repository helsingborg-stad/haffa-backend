import * as uuid from 'uuid'
import type {
  Advert,
  AdvertContact,
  AdvertFilterInput,
  AdvertInput,
  AdvertList,
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
  reference: '',
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
  organization: '',
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
  reference: '',
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

export const createPagedAdvertList = (
  adverts: Advert[],
  filter?: AdvertFilterInput
): AdvertList => {
  if (!filter?.paging) {
    return { adverts, paging: { totalCount: adverts.length } }
  }

  const { cursor, limit } = filter.paging
  const cursorIndex = Math.max(
    0,
    adverts.findIndex(advert => advert.id === cursor)
  )

  const sliced = adverts.slice(
    cursorIndex,
    limit > 0 ? cursorIndex + limit + 1 : undefined
  )

  const nextCursor =
    limit > 0 && sliced.length > limit ? sliced.at(-1)?.id : undefined
  const finalSlice =
    limit > 0 && sliced.length > limit ? sliced.slice(0, -1) : sliced

  return {
    adverts: finalSlice,
    paging: {
      totalCount: adverts.length,
      nextCursor,
    },
  }
}
