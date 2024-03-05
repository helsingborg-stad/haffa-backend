import * as uuid from 'uuid'
import type {
  Advert,
  AdvertContact,
  AdvertFilterInput,
  AdvertImage,
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

const isObject = (o: any) => o === Object(o)
const isArray = (a: any) => Array.isArray(a)

export const normalizeAdvert = (
  {
    id,
    versionId,
    type,
    createdBy,
    createdAt,
    modifiedAt,
    archivedAt,
    claims,
    title,
    description,
    quantity,
    lendingPeriod,
    images,
    unit,
    width,
    height,
    depth,
    weight,
    size,
    material,
    condition,
    usage,
    category,
    reference,
    externalId,
    notes,
    tags,
    location,
    contact,
  }: Advert = createEmptyAdvert()
): Advert =>
  createEmptyAdvert({
    id,
    versionId,
    type,
    createdBy,
    createdAt,
    modifiedAt,
    archivedAt,
    claims,
    title,
    description,
    quantity,
    lendingPeriod,
    images: isArray(images) ? images.map(normalizeAdvertImage) : [],
    unit,
    width,
    height,
    depth,
    weight,
    size,
    material,
    condition,
    usage,
    category,
    reference,
    externalId,
    notes,
    tags: isArray(tags) ? normalizeAdvertTags(tags) : [],
    location: isObject(location)
      ? normalizeAdvertLocation(location)
      : createEmptyAdvertLocation(),
    contact: isObject(contact)
      ? normalizeAdvertContact(contact)
      : createEmptyAdvertContact(),
  })

export const normalizeAdvertImage = ({ url }: AdvertImage): AdvertImage => ({
  url,
})
export const normalizeAdvertTags = (tags: string[] = []): string[] =>
  tags.map(s => s?.trim()).filter(s => s)
export const normalizeAdvertLocation = (
  {
    name,
    adress,
    zipCode,
    city,
    country,
  }: AdvertLocation = createEmptyAdvertLocation()
): AdvertLocation =>
  createEmptyAdvertLocation({
    name,
    adress,
    zipCode,
    city,
    country,
  })
export const normalizeAdvertContact = (
  { phone, email, organization }: AdvertContact = createEmptyAdvertContact()
): AdvertContact =>
  createEmptyAdvertContact({
    phone,
    email,
    organization,
  })

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
  lendingPeriod: 0,
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
  notes: '',
  tags: [],

  claims: [],

  location: createEmptyAdvertLocation(),
  contact: createEmptyAdvertContact(),
  ...defaults,
})

export const createEmptyAdvertLocation = (
  defaults?: Partial<AdvertLocation>
): AdvertLocation => ({
  name: '',
  adress: '',
  zipCode: '',
  city: '',
  country: '',
  ...defaults,
})

export const createEmptyAdvertContact = (
  defaults?: Partial<AdvertContact>
): AdvertContact => ({
  email: '',
  phone: '',
  organization: '',
  ...defaults,
})

export const createEmptyAdvertInput = (): AdvertInput => ({
  title: '',
  description: '',
  quantity: 1,
  lendingPeriod: 0,
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
  notes: '',
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
        location: {
          ...createEmptyAdvertLocation(),
          ...advert.location,
        },
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
