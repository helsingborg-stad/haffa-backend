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
  width: '',
  height: '',
  depth: '',
  weight: '',
  size: '',
  material: '',
  condition: '',
  usage: '',
  category: '',
  reference: '',
  externalId: '',
  tags: [],

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
  width: '',
  height: '',
  depth: '',
  weight: '',
  size: '',
  material: '',
  condition: '',
  usage: '',
  category: '',
  reference: '',
  externalId: '',
  tags: [],

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
  filter?: AdvertFilterInput,
  { defaultPageSize, maxCount } = { defaultPageSize: 25, maxCount: 100 }
  // defaultPageSize: number = 25,
  // maxCount: number = 1000
): AdvertList => {
  const totalCount = adverts.length
  const getInt = (v: any, d: number, max: number) =>
    v > 0 && v <= max ? Math.ceil(v) : d

  const pageSize = getInt(filter?.paging?.pageIndex, defaultPageSize, maxCount)
  const pageCount = Math.ceil(totalCount / pageSize)
  const pageIndex = getInt(
    filter?.paging?.pageIndex,
    0,
    Math.max(pageCount - 1, 0)
  )

  const useCursor = (filter?.paging?.limit || 0) > 0
  const { skip, take } = useCursor
    ? {
        // skip:  Math.max(0, parseInt(filter?.paging?.cursor || '0', 10) || 0),
        skip: Math.max(
          0,
          adverts.findIndex(({ id }) => id === filter?.paging?.cursor)
        ),
        take: Math.min(filter?.paging?.limit || 0, maxCount),
      }
    : {
        skip: pageIndex * pageSize,
        take: pageSize,
      }

  return {
    adverts: adverts.slice(skip, skip + take),
    paging: {
      totalCount: adverts.length,
      pageCount,
      pageSize,
      pageIndex,

      nextCursor: adverts[skip + take]?.id,
      // totalCount > skip + take ? (skip + take).toString() : undefined,
    },
  }
}
