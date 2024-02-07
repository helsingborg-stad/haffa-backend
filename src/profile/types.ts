import type { HaffaUser } from '../login/types'

export interface ProfileUserFields {
  name: string
  phone: string
  adress: string
  zipCode: string
  city: string
  country: string
  organization: string
}
export interface Profile extends ProfileUserFields {
  email: string
}

export interface ProfileInput {
  name: string
  phone: string
  adress: string
  zipCode: string
  city: string
  country: string
  organization: string
}

export interface RemoveProfileInput {
  removeAdverts: boolean
}

export interface ProfileRepository {
  getProfile: (user: HaffaUser) => Promise<Profile>
  updateProfile: (user: HaffaUser, input: ProfileInput) => Promise<Profile>
  deleteProfile: (user: HaffaUser) => Promise<void>
}

export type GetProfile = Pick<ProfileRepository, 'getProfile'>
