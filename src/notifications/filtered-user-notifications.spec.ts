import { createEmptyAdvert } from '../adverts/mappers'
import type { HaffaUser } from '../login/types'
import { createTermsGqlModule } from '../terms'
import { createTestNotificationServices } from '../test-utils'
import { tryCreateEmailUserNotifications } from './filtered-user-notifications'
import type { NotificationService } from './types'

/*
    const advertWasArchived = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasArchived,
    })

*/
describe('tryCreateEmailUserNotifications', () => {
  it('doesnt wrap null', () =>
    expect(tryCreateEmailUserNotifications(null)).toBeNull())

  it('does forward callls for email users', async () => {
    const inner: NotificationService = {
      pincodeRequested: jest.fn(),
      advertCollectWasCancelled: jest.fn(),
      advertNotCollected: jest.fn(),
      advertReservationWasCancelled: jest.fn(),
      advertWasArchived: jest.fn(),
      advertWasCollected: jest.fn(),
      advertWasCreated: jest.fn(),
      advertWasRemoved: jest.fn(),
      advertWasReserved: jest.fn(),
      advertWasUnarchived: jest.fn(),
      subscriptionsHasNewAdverts: jest.fn(),
    }
    const n = tryCreateEmailUserNotifications(inner)!

    const u: HaffaUser = { id: 'test@user.com' }
    const a = createEmptyAdvert()

    await n.pincodeRequested(u.id, '123456')
    await n.advertCollectWasCancelled(u, 1, a)
    await n.advertNotCollected(u, 1, a)
    await n.advertReservationWasCancelled(u, 1, a)
    await n.advertWasArchived(u, a)
    await n.advertWasCollected(u, 1, a)
    await n.advertWasCreated(u, a)
    await n.advertWasRemoved(u, a)
    await n.advertWasReserved(u, 1, a)
    await n.advertWasUnarchived(u, a)
    await n.subscriptionsHasNewAdverts(u, [])

    expect(inner.pincodeRequested).toHaveBeenCalledWith(u.id, '123456')
    expect(inner.advertCollectWasCancelled).toHaveBeenCalledWith(u, 1, a)
    expect(inner.advertNotCollected).toHaveBeenCalledWith(u, 1, a)
    expect(inner.advertReservationWasCancelled).toHaveBeenCalledWith(u, 1, a)
    expect(inner.advertWasArchived).toHaveBeenCalledWith(u, a)
    expect(inner.advertWasCollected).toHaveBeenCalledWith(u, 1, a)
    expect(inner.advertWasCreated).toHaveBeenCalledWith(u, a)
    expect(inner.advertWasRemoved).toHaveBeenCalledWith(u, a)
    expect(inner.advertWasReserved).toHaveBeenCalledWith(u, 1, a)
    expect(inner.advertWasUnarchived).toHaveBeenCalledWith(u, a)
    expect(inner.subscriptionsHasNewAdverts).toHaveBeenCalledWith(u, [])
  })

  it('doesnt forward calls for non-email users', async () => {
    // NOTE: the test notification services fails on every invocation
    // This test basically checks that test notifications are never invoked
    const inner = createTestNotificationServices({})
    const n = tryCreateEmailUserNotifications(inner)!

    const u: HaffaUser = { id: 'not an email' }
    const a = createEmptyAdvert()

    await expect(
      (async () => {
        await n.pincodeRequested(u.id, '123456')
        await n.advertCollectWasCancelled(u, 1, a)
        await n.advertNotCollected(u, 1, a)
        await n.advertReservationWasCancelled(u, 1, a)
        await n.advertWasArchived(u, a)
        await n.advertWasCollected(u, 1, a)
        await n.advertWasCreated(u, a)
        await n.advertWasRemoved(u, a)
        await n.advertWasReserved(u, 1, a)
        await n.advertWasUnarchived(u, a)
        await n.subscriptionsHasNewAdverts(u, [])
        return 'no notifications where forwarded'
      })()
    ).resolves.toMatch('no notifications where forwarded')
  })
})
