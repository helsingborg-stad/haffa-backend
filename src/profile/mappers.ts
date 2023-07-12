import type { Profile } from './types'

export const createEmptyProfile = (): Profile => ({
  email: '',
  phone: '',
  adress: '',
  zipCode: '',
  city: '',
  country: 'Sverige',
})
