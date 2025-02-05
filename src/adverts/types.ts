import type stream from 'stream'
import type { Only } from '../lib/types'
import type { HaffaUser } from '../login/types'
import type { ProfileInput } from '../profile/types'
import type { PickupLocation } from '../pickup/types'

export enum AdvertType {
  recycle = 'recycle',
  borrow = 'borrow',
}

export interface AdvertLocation {
  name: string
  adress: string
  zipCode: string
  city: string
  country: string
}

export interface AdvertContact {
  phone: string
  email: string
  organization: string
}
// User editable fields in an advert
export interface AdvertUserFields {
  title: string
  description: string
  quantity: number
  lendingPeriod: number
  images: AdvertImage[]
  unit: string
  width: string
  height: string
  depth: string
  weight: string
  size: string
  material: string
  condition: string
  usage: string
  category: string
  reference: string
  externalId: string
  notes: string
  tags: string[]
  location: AdvertLocation
  contact: AdvertContact
  place: string
}

export interface AdvertMetaClaim extends AdvertClaim {
  canCancel: boolean
  canConvert: boolean
  isOverdue: boolean
}
export interface AdvertReturnInfo {
  at: string
  quantity: number
  isMine: boolean
}
export interface AdvertMeta {
  reservableQuantity: number
  collectableQuantity: number
  isMine: boolean
  canEdit: boolean
  canArchive: boolean
  canUnarchive: boolean
  canPick: boolean
  canUnpick: boolean
  canRemove: boolean
  canBook: boolean
  canReserve: boolean
  canCancelReservation: boolean
  canCollect: boolean
  canJoinWaitList: boolean
  canLeaveWaitList: boolean
  canManageClaims: boolean
  canReturn: boolean
  reservedyMe: number
  collectedByMe: number
  isLendingAdvert: boolean
  isReservedBySome: boolean
  isCollectedBySome: boolean
  isPicked: boolean
  waitlistCount: number
  returnInfo: AdvertReturnInfo[]
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

export enum AdvertClaimEventType {
  reminder = 'reminder',
}
export interface AdvertClaimEvent {
  type: AdvertClaimEventType
  at: string
}
export interface AdvertClaim {
  quantity: number
  by: string
  at: string
  type: AdvertClaimType
  events: AdvertClaimEvent[]
  pickupLocation?: PickupLocation
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
  pickedAt: string
  claims: AdvertClaim[]
  waitlist: string[]
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

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type

export type AdvertFieldsFilterInput = {
  id?: FilterInput<string>
  // for internal searches
  createdBy?: FilterInput<string>
  createdAt?: FilterInput<string>
  modifiedAt?: FilterInput<string>
  archivedAt?: FilterInput<string>
  pickedAt?: FilterInput<string>
} & {
  [Property in keyof Omit<AdvertUserFields, 'images'>]?: FilterInput<
    Flatten<AdvertUserFields[Property]>
  >
}

export interface AdvertRestrictionsFilterInput {
  canBeReserved?: boolean
  reservedByMe?: boolean
  collectedByMe?: boolean
  createdByMe?: boolean
  editableByMe?: boolean
  isArchived?: boolean
  isPicked?: boolean
  hasReservations?: boolean
  hasCollects?: boolean
}

export interface AdvertWorkflowInput {
  pickupLocationTrackingNames?: string[]
  places?: string[]
}

export interface AdvertSorting {
  field?: keyof AdvertUserFields
  ascending?: boolean
}

export interface AdvertPagingInput {
  pageIndex?: number
  pageSize?: number

  limit?: number
  cursor?: string
}

export interface AdvertFilterInput {
  search?: string
  fields?: AdvertFieldsFilterInput
  restrictions?: AdvertRestrictionsFilterInput
  sorting?: AdvertSorting
  paging?: AdvertPagingInput
  workflow?: AdvertWorkflowInput

  // decorators/pipelines can attach additional criterias
  pipelineCategoryIds?: string[]
  pipelineOr?: {
    fields: AdvertFieldsFilterInput
  }[]
}

export interface AdvertListPaging {
  totalCount: number
  pageCount: number
  pageIndex: number
  pageSize: number
  nextCursor?: string
}

export interface AdvertList {
  adverts: Advert[]
  paging: AdvertListPaging
}

export interface AdvertsClaimFilter {
  type: AdvertClaimType
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
    by: keyof Only<Advert, string>,
    excludeArchived?: boolean
    // by: keyof Extract<Advert, string>
  ) => Promise<Record<string, number>>
  getAdvertsByClaimStatus: (filter: AdvertsClaimFilter) => Promise<string[]>
  getReservableAdvertsWithWaitlist: () => Promise<string[]>
  getSnapshot: () => stream.Readable
}

export interface AdvertMutations {
  importAdvertSnapshot: (user: HaffaUser, advert: Advert) => Promise<boolean>
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
    quantity: number,
    location?: PickupLocation
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
    type: AdvertClaimType,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<AdvertMutationResult>
  convertAdvertClaim: (
    user: HaffaUser,
    id: string,
    by: string,
    type: AdvertClaimType,
    newType: AdvertClaimType,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<AdvertMutationResult>
  renewAdvertClaim: (
    user: HaffaUser,
    id: string,
    by: string,
    type: AdvertClaimType,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<AdvertMutationResult>
  notifyReservedClaims: (
    user: HaffaUser,
    id: string,
    interval: number,
    snooze: number,
    now: Date
  ) => Promise<AdvertMutationResult>
  notifyExpiredClaims: (
    user: HaffaUser,
    id: string,
    interval: number,
    now: Date
  ) => Promise<AdvertMutationResult>
  notifyOverdueClaims: (
    user: HaffaUser,
    id: string,
    interval: number,
    now: Date
  ) => Promise<AdvertMutationResult>
  returnAdvert: (user: HaffaUser, id: string) => Promise<AdvertMutationResult>
  joinAdvertWaitlist: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  leaveAdvertWaitlist: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  notifyAdvertWaitlist: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  markAdvertAsPicked: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  markAdvertAsUnpicked: (
    user: HaffaUser,
    id: string
  ) => Promise<AdvertMutationResult>
  patchAdvertTags: (
    user: HaffaUser,
    id: string,
    patch: { add: string; remove: string[] }
  ) => Promise<AdvertMutationResult>
}

interface AdvertStats {
  advertCount: number | Promise<number>
}
