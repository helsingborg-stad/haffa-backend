import type { HaffaUser } from '../login/types'

export interface ProfileUserFields {
  phone: string
  adress: string
  zipCode: string
  city: string
  country: string
}
export interface Profile extends ProfileUserFields {
  email: string
}

export interface ProfileInput {
  phone: string
  adress: string
  zipCode: string
  city: string
  country: string
}

export interface ProfileRepository {
  getProfile: (user: HaffaUser) => Promise<Profile>
  updateProfile: (user: HaffaUser, input: ProfileInput) => Promise<Profile>
}
