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

it('should calculate overdue WITHOUT default date override', () => {
  const claim = {
    at: '2024-02-01',
    type: AdvertClaimType.collected,
    quantity: 1,
    by: 'jane@doe.se',
    events: [],
  }
  // Current Date: 2024-02-01, reservation date: 2024-02-01
  // Comparison between 2024-02-01 and 2024-02-01 is 0 day = not overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-02-01'))).toBe(false)
  // Current Date: 2024-02-02, reservation date: 2024-02-01
  // Comparison between 2024-02-02 and 2024-02-01 is 1 day = not overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-02-02'))).toBe(false)
  // Current Date: 2024-02-03, reservation date: 2024-02-01
  // Comparison between 2024-02-03 and 2024-02-01 is 2 days = overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-02-03'))).toBe(true)
  // Current Date: 2024-02-04, reservation date: 2024-02-01
  // Comparison between 2024-02-04 and 2024-02-01 is 3 days = overdue
  expect(isClaimOverdue(claim, 1, new Date('2025-02-01'))).toBe(true)
  // Current Date: 2024-01-31, reservation date: 2024-02-01
  // Comparison between 2024-01-31 and 2024-02-01 is -1 day = not overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-01-31'))).toBe(false)
})

it('should calculate overdue WITH default date override', () => {
  const claim = {
    at: '2024-02-01',
    type: AdvertClaimType.reserved,
    quantity: 1,
    by: 'jane@doe.se',
    events: [],
  }
  // Current Date: 2024-02-05, reservation date: 2024-02-01, picked date: 2024-02-04
  // Comparison between 2024-02-05 and 2024-02-04 is 1 day = not overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-02-05'), '2024-02-04')).toBe(
    false
  )
  // Current Date: 2024-02-06, reservation date: 2024-02-01, picked date: 2024-02-04
  // Comparison between 2024-02-06 and 2024-02-04 is 2 days = overdue
  expect(isClaimOverdue(claim, 1, new Date('2024-02-06'), '2024-02-04')).toBe(
    true
  )
})
