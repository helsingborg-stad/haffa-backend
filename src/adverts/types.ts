import type { Only } from '../lib/types'
import type { HaffaUser } from '../login/types'

export enum AdvertType {
  recycle = 'recycle',
  borrow = 'borrow',
}

export interface AdvertLocation {
  adress: string
  zipCode: string
  city: string
  country: string
}

export interface AdvertContact {
  phone: string
  email: string
}
// User editable fields in an advert
export interface AdvertUserFields {
  title: string
  description: string
  quantity: number
  images: AdvertImage[]
  unit: string
  material: string
  condition: string
  usage: string
  category: string
  externalId: string
  location: AdvertLocation
  contact: AdvertContact
}

export interface AdvertMetaClaim extends AdvertClaim {
  canCancel: boolean
  canConvert: boolean
}
export interface AdvertMeta {
  reservableQuantity: number
  collectableQuantity: number
  isMine: boolean
  canEdit: boolean
  canArchive: boolean
  canUnarchive: boolean
  canRemove: boolean
  canBook: boolean
  canReserve: boolean
  canCancelReservation: boolean
  canCollect: boolean
  canManageClaims: boolean
  reservedyMe: number
  collectedByMe: number
  claims: AdvertMetaClaim[]
}

export interface AdvertMutationStatus {
  code: string
  message: string
  field: string
}

export interface AdvertMutationResult {
  status: AdvertMutationStatus | null
  advert: Advert | null
}

export interface AdvertWithMetaMutationResult {
  status: AdvertMutationStatus | null
  advert: AdvertWithMeta | null
}

export type AdvertInput = AdvertUserFields

export interface AdvertImage {
  url: string
}

export enum AdvertClaimType {
  reserved = 'reserved',
  collected = 'collected',
}
export interface AdvertClaim {
  quantity: number
  by: string
  at: string
  type: AdvertClaimType
}
export interface AdvertReservations {
  id: string
  advert: {
    claims: AdvertClaim[]
  }
}
export interface Advert extends AdvertUserFields {
  id: string
  versionId: string
  type: AdvertType
  createdBy: string
  createdAt: string
  modifiedAt: string
  archivedAt: string
  claims: AdvertClaim[]
}

export type AdvertWithMeta = Advert & { meta: AdvertMeta }

export type FilterInput<T> = {
  ne?: T
  eq?: T
  gt?: T
  gte?: T
  lt?: T
  lte?: T
  in?: T[]
} & (T extends string ? { contains?: string } : Record<string, never>)

export type AdvertFieldsFilterInput = {
  id?: FilterInput<string>
} & {
  [Property in keyof Omit<AdvertUserFields, 'images'>]?: FilterInput<
    AdvertUserFields[Property]
  >
}

export interface AdvertRestrictionsFilterInput {
  canBeReserved?: boolean
  reservedByMe?: boolean
  createdByMe?: boolean
  isArchived?: boolean
  hasReservations?: boolean
  hasCollects?: boolean
}

export interface AdvertSorting {
  field?: keyof AdvertUserFields
  ascending?: boolean
}

export interface AdvertPaging {
  cursor?: string
  limit: number
}

export interface AdvertFilterInput {
  search?: string
  fields?: AdvertFieldsFilterInput
  restrictions?: AdvertRestrictionsFilterInput
  sorting?: AdvertSorting
  paging?: AdvertPaging
}

export interface AdvertList {
  adverts: Advert[]
  nextCursor?: string
}

export interface ReservationFilter {
  olderThan?: Date
}

export interface AdvertsRepository {
  stats: AdvertStats
  getAdvert: (user: HaffaUser, id: string) => Promise<Advert | null>
  saveAdvertVersion: (
    user: HaffaUser,
    versionId: string,
    advert: Advert
  ) => Promise<Advert | null>
  list: (user: HaffaUser, filter?: AdvertFilterInput) => Promise<AdvertList>
  create: (user: HaffaUser, advert: Advert) => Promise<Advert>
  remove: (user: HaffaUser, id: string) => Promise<Advert | null>

  // return count of adverts per value of selected property
  countBy: (
    user: HaffaUser,
    by: keyof Only<Advert, string>
    // by: keyof Extract<Advert, string>
  ) => Promise<Record<string, number>>
  getReservationList: (
    filter: ReservationFilter
  ) => Promise<AdvertReservations[]>
}

export interface AdvertMutations {
  createAdvert: (
    user: HaffaUser,
    input: AdvertInput
  ) => Promise<AdvertMutationResult>
  updateAdvert: (
    user: HaffaUser,
    id: string,
    input: AdvertInput
  ) => Promise<AdvertMutationResult>
  removeAdvert: (user: HaffaUser, id: string) => Promise<AdvertMutationResult>
  reserveAdvert: (
    user: HaffaUser,
    id: string,
    quantity: number
  ) => Promise<AdvertMutationResult>
  cancelAdvertReservation: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  collectAdvert: (
    user: HaffaUser,
    id: string,
    quantity: number
  ) => Promise<AdvertMutationResult>
  archiveAdvert: (user: HaffaUser, id: string) => Promise<AdvertMutationResult>
  unarchiveAdvert: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  cancelAdvertClaim: (
    user: HaffaUser,
    id: string,
    by: string,
    type: AdvertClaimType
  ) => Promise<AdvertMutationResult>
  convertAdvertClaim: (
    user: HaffaUser,
    id: string,
    by: string,
    type: AdvertClaimType,
    newType: AdvertClaimType
  ) => Promise<AdvertMutationResult>
}

interface AdvertStats {
  advertCount: number | Promise<number>
}
