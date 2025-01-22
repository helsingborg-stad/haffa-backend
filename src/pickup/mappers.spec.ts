import type { AdvertLocation } from '../adverts/types'
import { normalizePickupLocations } from './mappers'

it('should add default values to missing fields', () => {
  const output = normalizePickupLocations([
    {
      name: 'valid',
      zipCode: 'valid',
    },
  ])

  expect(output).toEqual([
    {
      name: 'valid',
      adress: '',
      zipCode: 'valid',
      city: '',
      country: '',
      notifyEmail: '',
      tags: [],
    },
  ])
})

it('should trim field values', () => {
  const output = normalizePickupLocations([
    {
      name: '  valid  ',
      adress: '  valid  ',
      zipCode: '  valid  ',
      city: '  valid  ',
      country: '  valid  ',
      notifyEmail: '  valid  ',
      tags: ['  valid  '],
    },
  ])

  expect(output).toEqual([
    {
      name: 'valid',
      adress: 'valid',
      zipCode: 'valid',
      city: 'valid',
      country: 'valid',
      notifyEmail: 'valid',
      tags: ['valid'],
    },
  ])
})

it('should remove unexpected fields', () => {
  const output = normalizePickupLocations([
    {
      dummy: 'valid',
    } as unknown as AdvertLocation,
  ])

  expect(output).toEqual([
    {
      name: '',
      adress: '',
      zipCode: '',
      city: '',
      country: '',
      notifyEmail: '',
      tags: [],
    },
  ])
})
