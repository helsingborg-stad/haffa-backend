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
  AdvertSummaries,
  AdvertWithMeta,
  AdvertWithMetaMutationResult,
} from './types'
import { AdvertType } from './types'
import type { HaffaUser } from '../login/types'
import type { Services } from '../types'
import { mapValues } from '../lib'

const isObject = (o: any) => o === Object(o)
const isArray = (a: any) => Array.isArray(a)

const omitNullProperties = <T>(o?: Partial<T>): Partial<T> | undefined =>
  (o
    ? Object.fromEntries(
        Object.entries(o).filter(
          ([_, v]) => v !== null && typeof v !== 'undefined'
        )
      )
    : o) as Partial<T>

export const normalizeAdvert = (
  {
    id,
    versionId,
    type,
    createdBy,
    createdAt,
    modifiedAt,
    archivedAt,
    pickedAt,
    reservedAt,
    collectedAt,
    returnedAt,
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
    place,
    waitlist,
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
    pickedAt,
    reservedAt,
    collectedAt,
    returnedAt,
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
    tags: isArray(tags) ? normalizeStringArray(tags) : [],
    waitlist: isArray(waitlist) ? normalizeStringArray(waitlist) : [],
    location: isObject(location)
      ? normalizeAdvertLocation(location)
      : createEmptyAdvertLocation(),
    contact: isObject(contact)
      ? normalizeAdvertContact(contact)
      : createEmptyAdvertContact(),
    place,
  })

export const normalizeAdvertImage = ({ url }: AdvertImage): AdvertImage => ({
  url,
})

export const normalizeStringArray = (a: string[] = []): string[] =>
  a.map(s => s?.trim()).filter(s => s)

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
  reservedAt: '',
  collectedAt: '',
  returnedAt: '',
  pickedAt: '',
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
  waitlist: [],

  location: createEmptyAdvertLocation(),
  contact: createEmptyAdvertContact(),
  place: '',
  ...omitNullProperties(defaults),
})

export const createEmptyAdvertLocation = (
  defaults?: Partial<AdvertLocation>
): AdvertLocation => ({
  name: '',
  adress: '',
  zipCode: '',
  city: '',
  country: '',
  ...omitNullProperties(defaults),
})

export const createEmptyAdvertContact = (
  defaults?: Partial<AdvertContact>
): AdvertContact => ({
  email: '',
  phone: '',
  organization: '',
  ...omitNullProperties(defaults),
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
  place: '',
})

export const mapCreateAdvertInputToAdvert = (
  input: AdvertInput,
  user: HaffaUser,
  when: string = new Date().toISOString()
): Advert => ({
  ...createEmptyAdvert({
    id: uuid.v4().toString(),
    createdBy: user.id,
    createdAt: when,
    modifiedAt: when,
    ...omitNullProperties(input),
  }),
})

export const patchAdvertWithAdvertInput = (
  advert: Advert,
  input: AdvertInput
): Advert => ({
  ...advert,
  ...omitNullProperties(input),
  modifiedAt: new Date().toISOString(),
})

export const mapAdvertToAdvertWithMeta = (
  user: HaffaUser,
  advert: Advert | null,
  { getAdvertMeta }: Pick<Services, 'getAdvertMeta'>
): AdvertWithMeta | null =>
  advert
    ? {
        ...normalizeAdvert(advert),
        ...{
          get meta() {
            return getAdvertMeta(advert, user)
          },
        },
      }
    : null

export const mapAdvertsToAdvertsWithMeta = (
  user: HaffaUser,
  adverts: (Advert | null)[],
  services: Pick<Services, 'getAdvertMeta'>
): (AdvertWithMeta | null)[] =>
  adverts.map(a => mapAdvertToAdvertWithMeta(user, a, services)).filter(a => a)

export const mapAdvertMutationResultToAdvertWithMetaMutationResult = (
  user: HaffaUser,
  result: AdvertMutationResult,
  services: Pick<Services, 'getAdvertMeta'>
): AdvertWithMetaMutationResult => ({
  advert: mapAdvertToAdvertWithMeta(user, result.advert, services),
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

export const normalizeAdvertSummaries = (
  summary: Partial<AdvertSummaries>
): AdvertSummaries => ({
  totalLendingAdverts: 0,
  totalRecycleAdverts: 0,
  availableLendingAdverts: 0,
  availableRecycleAdverts: 0,
  availableAdverts: 0,
  totalAdverts: 0,
  reservedAdverts: 0,
  collectedAdverts: 0,
  // ...summary,
  ...mapValues(summary, v => (v > 0 ? v : 0)),
})
