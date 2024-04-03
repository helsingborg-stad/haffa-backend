import { makeAdmin, makeUser } from '../../../login'
import { createTestNotificationServices } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { createInMemoryAdvertsRepository } from '../../repository/memory'
import { AdvertClaimType, type AdvertClaim } from '../../types'
import { createNotifyAdvertWaitlist } from './notify-advert-waitlist'

const makeClaim = (c: Partial<AdvertClaim>): AdvertClaim => ({
  quantity: 1,
  by: '',
  at: '',
  type: AdvertClaimType.collected,
  events: [],
  ...c,
})

const reserved = (c: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.reserved, ...c })
const collected = (c: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.collected, ...c })

describe('notifyAdvertWaitlist', () => {
  it('notifies users and clears waitlist', async () => {
    // Setup a database with 1 advert
    const advert = createEmptyAdvert({
      id: 'advert-123',
      quantity: 1,
      waitlist: ['user1', 'user2'],
    })
    const adverts = createInMemoryAdvertsRepository({
      [advert.id]: advert,
    })

    // Setup notifications
    const advertWaitlistAvailable = jest.fn()
    const notifications = createTestNotificationServices({
      advertWaitlistAvailable,
    })

    // Send notifications to recipients
    const notify = createNotifyAdvertWaitlist({ adverts, notifications })
    await notify(makeAdmin({ id: 'test@user.com' }), 'advert-123')

    // waitlist users should be notified
    expect(advertWaitlistAvailable).toHaveBeenCalledWith(
      makeUser({ id: 'user1' }),
      1,
      advert
    )
    expect(advertWaitlistAvailable).toHaveBeenCalledWith(
      makeUser({ id: 'user2' }),
      1,
      advert
    )

    // waitlist should be cleared in database
    expect(adverts.getDb()['advert-123']?.waitlist).toHaveLength(0)
  })

  it('does not notify if availablity is zero', async () => {
    const adverts = createInMemoryAdvertsRepository({
      a1: createEmptyAdvert({
        id: 'a1',
        quantity: 1,
        claims: [collected({ by: 'some-user', quantity: 1 })],
        waitlist: ['me', 'you'],
      }),
      a2: createEmptyAdvert({
        id: 'a2',
        quantity: 1,
        claims: [reserved({ by: 'some-user', quantity: 1 })],
        waitlist: ['me', 'you'],
      }),
    })

    const advertWaitlistAvailable = jest.fn()
    const notifications = createTestNotificationServices({
      advertWaitlistAvailable,
    })

    const notify = createNotifyAdvertWaitlist({
      adverts,
      notifications,
    })
    await notify(makeAdmin({ id: 'test@user.com' }), 'a1')
    await notify(makeAdmin({ id: 'test@user.com' }), 'a2')

    expect(advertWaitlistAvailable).toHaveBeenCalledTimes(0)
  })
})
