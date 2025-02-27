import {
  AdvertClaimType,
  type AdvertClaim,
  AdvertClaimEventType,
} from '../../types'
import {
  getLastClaimEventDate,
  getNextClaimEventDate,
  isClaimOverdue,
} from './mappers'

const completeClaim = {
  at: '2024-01-30',
  type: AdvertClaimType.collected,
  quantity: 1,
  by: 'jane@doe.se',
  events: [
    {
      at: '2024-01-01',
      type: AdvertClaimEventType.reminder,
    },
    {
      at: '2024-03-01',
      type: AdvertClaimEventType.reminder,
    },
    {
      at: '2024-02-01',
      type: AdvertClaimEventType.reminder,
    },
  ],
}

it('should handle empty event array WITHOUT default date override', () => {
  expect(
    getLastClaimEventDate({
      at: '2024-01-30',
      type: AdvertClaimType.collected,
      quantity: 1,
      by: 'jane@doe.se',
      events: [],
    })
  ).toEqual(new Date('2024-01-30'))
})
it('should handle empty event array WITH default date override', () => {
  expect(
    getLastClaimEventDate(
      {
        at: '2024-01-30',
        type: AdvertClaimType.collected,
        quantity: 1,
        by: 'jane@doe.se',
        events: [],
      },
      '2025-01-01'
    )
  ).toEqual(new Date('2025-01-01'))
})
it('should handle missing event array WITHOUT default date override', () => {
  expect(
    getLastClaimEventDate({
      at: '2024-01-30',
      type: AdvertClaimType.collected,
      quantity: 1,
      by: 'jane@doe.se',
    } as AdvertClaim)
  ).toEqual(new Date('2024-01-30'))
})
it('should handle missing event array WITH default date override', () => {
  expect(
    getLastClaimEventDate(
      {
        at: '2024-01-30',
        type: AdvertClaimType.collected,
        quantity: 1,
        by: 'jane@doe.se',
      } as AdvertClaim,
      '2025-01-01'
    )
  ).toEqual(new Date('2025-01-01'))
})

it('should handle single event WITHOUT default date override', () => {
  expect(
    getLastClaimEventDate({
      at: '2024-01-30',
      type: AdvertClaimType.collected,
      quantity: 1,
      by: 'jane@doe.se',
      events: [
        {
          at: '2024-02-01',
          type: AdvertClaimEventType.reminder,
        },
      ],
    })
  ).toEqual(new Date('2024-02-01'))
})
it('should handle single event WITH default date override', () => {
  expect(
    getLastClaimEventDate(
      {
        at: '2024-01-30',
        type: AdvertClaimType.collected,
        quantity: 1,
        by: 'jane@doe.se',
        events: [
          {
            at: '2024-02-01',
            type: AdvertClaimEventType.reminder,
          },
        ],
      },
      '2025-01-01'
    )
  ).toEqual(new Date('2024-02-01'))
})

it('should handle handle arbitrary order of events', () => {
  expect(getLastClaimEventDate(completeClaim)).toEqual(new Date('2024-03-01'))
})

it('should calculate next event from previous event', () => {
  expect(getNextClaimEventDate(completeClaim, 10)).toEqual(
    new Date('2024-03-11')
  )
})

it('should calculate next event WITHOUT default date override', () => {
  expect(
    getNextClaimEventDate(
      {
        at: '2024-02-01',
        type: AdvertClaimType.collected,
        quantity: 1,
        by: 'jane@doe.se',
        events: [],
      },
      10
    )
  ).toEqual(new Date('2024-02-11'))
})

it('should calculate next event WITH default date override', () => {
  expect(
    getNextClaimEventDate(
      {
        at: '2024-02-01',
        type: AdvertClaimType.collected,
        quantity: 1,
        by: 'jane@doe.se',
        events: [],
      },
      10,
      '2025-01-01'
    )
  ).toEqual(new Date('2025-01-11'))
})

it('should calculate overdue', () => {
  const claim = {
    at: '2024-02-01',
    type: AdvertClaimType.collected,
    quantity: 1,
    by: 'jane@doe.se',
    events: [],
  }
  expect(isClaimOverdue(claim, 1, new Date('2024-02-01'))).toBe(false)
  expect(isClaimOverdue(claim, 1, new Date('2024-02-02'))).toBe(false)
  expect(isClaimOverdue(claim, 1, new Date('2024-02-03'))).toBe(true)
  expect(isClaimOverdue(claim, 1, new Date('2025-02-01'))).toBe(true)
  expect(isClaimOverdue(claim, 1, new Date('2024-01-31'))).toBe(false)
})
