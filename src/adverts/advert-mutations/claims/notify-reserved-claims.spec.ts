import { createReservedClaimsNotifier } from '.'
import { end2endTest } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'

const defaultClaim = {
  at: '2023-06-01',
  quantity: 1,
  type: AdvertClaimType.reserved,
  events: [],
}
describe('notifyReservedClaims', () => {
  it('should add an event when no prior event exists (WITHOUT pickedAt override)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // Reservation created: 2023-06-01
      // reminder interval: 10 days
      // Current date: 2023-06-11
      // = Notification should be sent

      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        claims: [
          {
            ...defaultClaim,
            by: user.id,
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      await notifyAdvertClaim(user, 'advert-123', 10, 0, new Date('2023-06-11'))
      expect(adverts['advert-123'].claims[0].events).toMatchObject([
        {
          type: AdvertClaimEventType.reminder,
          at: '2023-06-11T00:00:00.000Z',
        },
      ])
    }))

  it('should add an event when no prior event exists (WITH pickedAt override)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // Reservation created: 2023-06-01
      // PickedAt: 2023-06-10
      // Reminder interval: 10 days
      // Current date: 2023-06-21
      // = Notification should be sent

      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        pickedAt: '2023-06-10',
        claims: [
          {
            ...defaultClaim,
            by: user.id,
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      // With pickedAt override
      await notifyAdvertClaim(user, 'advert-123', 10, 1, new Date('2023-06-21'))

      expect(adverts['advert-123'].claims[0].events).toMatchObject([
        {
          type: AdvertClaimEventType.reminder,
          at: '2023-06-21T00:00:00.000Z',
        },
      ])
    }))

  it('should add a reminder to event array when prior events exists using datecomparison with the previous event)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // Reservation created: 2023-06-01
      // Last event: 2023-06-10
      // Reminder interval: 10 days
      // Current date: 2023-06-21
      // = Notification should be sent

      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        claims: [
          {
            ...defaultClaim,
            by: user.id,
            events: [
              {
                type: AdvertClaimEventType.reminder,
                at: '2023-06-10',
              },
            ],
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      await notifyAdvertClaim(user, 'advert-123', 10, 0, new Date('2023-06-21'))

      expect(adverts['advert-123'].claims[0].events).toMatchObject([
        {
          at: '2023-06-10',
          type: AdvertClaimEventType.reminder,
        },
        {
          at: '2023-06-21T00:00:00.000Z',
          type: AdvertClaimEventType.reminder,
        },
      ])
    }))
  it('should return null when no claim reminder is sent)', () =>
    end2endTest({}, async ({ user, adverts, services }) => {
      // eslint-disable-next-line no-param-reassign
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        id: 'advert-123',
        createdBy: user.id,
        claims: [
          {
            ...defaultClaim,
            by: 'jane@doe1.se',
          },
        ],
      }
      const notifyAdvertClaim = createReservedClaimsNotifier(services)

      const result = await notifyAdvertClaim(
        user,
        'advert-123',
        1,
        0,
        new Date('2023-06-01')
      )
      expect(result.advert).toBeNull()
    }))
})

it('should snooze an event when advert not picked)', () =>
  end2endTest({}, async ({ user, adverts, services }) => {
    // Reservation created: 2023-06-01
    // Last event: -
    // Reminder interval: 1 days
    // Current date: 2023-06-01
    // = Notification should NOT be sent

    // eslint-disable-next-line no-param-reassign
    adverts['advert-123'] = {
      ...createEmptyAdvert(),
      id: 'advert-123',
      createdBy: user.id,
      pickedAt: '',
      claims: [
        {
          ...defaultClaim,
          by: user.id,
        },
      ],
    }
    const notifyAdvertClaim = createReservedClaimsNotifier(services)

    await notifyAdvertClaim(user, 'advert-123', 10, 1, new Date('2023-06-01'))
    expect(adverts['advert-123'].claims[0].events).toMatchObject([])
  }))

it('should respect the snoozeReminderUntilPicked flag', () =>
  end2endTest({}, async ({ user, adverts, services }) => {
    // Reservation created: 2023-06-01
    // Picked at: 2023-06-05
    // Last event: -
    // Reminder interval: 10 days
    // Current date: 2023-06-11
    // = Notification should NOT be sent

    // eslint-disable-next-line no-param-reassign
    adverts['advert-123'] = {
      ...createEmptyAdvert(),
      id: 'advert-123',
      createdBy: user.id,
      pickedAt: '2025-06-05',
      claims: [
        {
          ...defaultClaim,
          by: user.id,
        },
      ],
    }
    const notifyAdvertClaim = createReservedClaimsNotifier(services)

    // snoozeReminderUntilPicked : TRUE
    await notifyAdvertClaim(user, 'advert-123', 10, 1, new Date('2023-06-11'))
    expect(adverts['advert-123'].claims[0].events).toMatchObject([])

    // snoozeReminderUntilPicked: FALSE
    await notifyAdvertClaim(user, 'advert-123', 10, 0, new Date('2023-06-11'))
    expect(adverts['advert-123'].claims[0].events).toMatchObject([
      {
        at: '2023-06-11T00:00:00.000Z',
        type: AdvertClaimEventType.reminder,
      },
    ])
  }))

it('should apply snoozeReminderUntilPicked flag when picked is before claim date', () =>
  end2endTest({}, async ({ user, adverts, services }) => {
    // Reservation A created: 2023-06-01
    // Reservation B created: 2023-06-10
    // Picked at: 2023-06-05
    // Last event: -
    // Reminder interval: 10 days
    // Current date: 2023-06-16
    // = Notification should NOT be sent for B but for A
    // since A is created before PickedAt thoug B is not

    // eslint-disable-next-line no-param-reassign
    adverts['advert-123'] = {
      ...createEmptyAdvert(),
      id: 'advert-123',
      createdBy: user.id,
      pickedAt: '2023-06-05',
      claims: [
        {
          ...defaultClaim,
          at: '2023-06-01', // Before picked At
          by: 'jane@doe1',
        },
        {
          ...defaultClaim,
          by: 'jane@doe2',
          at: '2023-06-10', // After pickup, ignored
        },
      ],
    }
    const notifyAdvertClaim = createReservedClaimsNotifier(services)

    await notifyAdvertClaim(user, 'advert-123', 10, 1, new Date('2023-06-16'))
    expect(adverts['advert-123'].claims[0].events).toMatchObject([
      {
        at: '2023-06-16T00:00:00.000Z',
        type: AdvertClaimEventType.reminder,
      },
    ])
    expect(adverts['advert-123'].claims[1].events).toMatchObject([])
  }))
