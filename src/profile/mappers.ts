import type { Profile, ProfileInput } from './types'

export const createEmptyProfile = (): Profile => ({
  email: '',
  name: '',
  phone: '',
  adress: '',
  zipCode: '',
  city: '',
  country: 'Sverige',
  organization: '',
})

export const createEmptyProfileInput = (): ProfileInput => ({
  name: '',
  phone: '',
  adress: '',
  zipCode: '',
  city: '',
  country: 'Sverige',
  organization: '',
})
