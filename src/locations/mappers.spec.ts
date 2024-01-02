import type { AdvertLocation } from '../adverts/types'
import { normalizeLocations } from './mappers'

it('should add default values to missing fields', () => {
  const output = normalizeLocations([
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
    },
  ])
})

it('should trim field values', () => {
  const output = normalizeLocations([
    {
      name: '  valid  ',
      adress: '  valid  ',
      zipCode: '  valid  ',
      city: '  valid  ',
      country: '  valid  ',
    },
  ])

  expect(output).toEqual([
    {
      name: 'valid',
      adress: 'valid',
      zipCode: 'valid',
      city: 'valid',
      country: 'valid',
    },
  ])
})

it('should remove unexpected fields', () => {
  const output = normalizeLocations([
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
    },
  ])
})
