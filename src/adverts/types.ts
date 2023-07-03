import type { HaffaUser } from '../login/types'

export enum AdvertType {
  recycle = 'recycle',
  borrow = 'borrow',
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
}

export interface AdvertPermissions {
  edit: boolean
  delete: boolean
  book: boolean
  claim: boolean
}

export type AdvertInput = AdvertUserFields

export interface AdvertImage {
  url: string
}

export interface Advert extends AdvertUserFields {
  id: string
  type: AdvertType
  createdBy: string
  createdAt: string
  modifiedAt: string
}

export type FilterInput<T> = {
  ne?: T
  eq?: T
  gt?: T
  gte?: T
  lt?: T
  lte?: T
} & (T extends string ? { contains?: string } : {})

export type FilterAdvertsInput = {
  id?: FilterInput<string>
} & {
  [Property in keyof Omit<AdvertUserFields, 'images'>]: FilterInput<
    AdvertUserFields[Property]
  >
}

export interface AdvertsRepository {
  getAdvert: (id: string) => Promise<Advert | null>
  list: (filter?: FilterAdvertsInput) => Promise<Advert[]>
  create: (user: HaffaUser, advert: AdvertInput) => Promise<Advert>
  update: (
    id: string,
    user: HaffaUser,
    advert: AdvertInput
  ) => Promise<Advert | null>
}
