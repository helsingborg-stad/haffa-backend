import type { Profile, ProfileInput } from './types'

export const createEmptyProfile = (): Profile => ({
  email: '',
  phone: '',
  adress: '',
  zipCode: '',
  city: '',
  country: 'Sverige',
  organization: '',
})

export const createEmptyProfileInput = (): ProfileInput => ({
  phone: '',
  adress: '',
  zipCode: '',
  city: '',
  country: 'Sverige',
  organization: '',
})
