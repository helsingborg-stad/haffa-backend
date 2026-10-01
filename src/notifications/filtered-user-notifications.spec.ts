import { createEmptyAdvert } from '../adverts/mappers'
import type { HaffaUser } from '../login/types'
import { createTestNotificationServices } from '../test-utils'
import { tryCreateEmailUserNotifications } from './filtered-user-notifications'
import type { NotificationService } from './types'

describe('tryCreateEmailUserNotifications', () => {
  it('doesnt wrap null', () =>
    expect(tryCreateEmailUserNotifications(null)).toBeNull())

  it('does forward calls for email users', async () => {
    const inner: NotificationService = {
      pincodeRequested: vi.fn(),
      advertCollectWasCancelled: vi.fn(),
      advertCollectWasCancelledOwner: vi.fn(),
      advertNotCollected: vi.fn(),
      advertReservationWasCancelled: vi.fn(),
      advertReservationWasCancelledOwner: vi.fn(),
      advertWasArchived: vi.fn(),
      advertWasCollected: vi.fn(),
      advertWasCollectedOwner: vi.fn(),
      advertWasCreated: vi.fn(),
      advertWasRemoved: vi.fn(),
      advertWasReserved: vi.fn(),
      advertWasReservedOwner: vi.fn(),
      advertWasUnarchived: vi.fn(),
      subscriptionsHasNewAdverts: vi.fn(),
      advertNotReturned: vi.fn(),
      advertWasReturned: vi.fn(),
      advertWasReturnedOwner: vi.fn(),
      advertWaitlistAvailable: vi.fn(),
      advertWasPicked: vi.fn(),
      advertWasPickedOwner: vi.fn(),
      advertWasUnpickedOwner: vi.fn(),
      advertCollectWasRenewed: vi.fn(),
      advertCollectWasRenewedOwner: vi.fn(),
      advertReservationWasRenewed: vi.fn(),
      advertReservationWasRenewedOwner: vi.fn(),
    }
    const n = tryCreateEmailUserNotifications(inner)!

    const u: HaffaUser = { id: 'test@user.com' }
    const a = createEmptyAdvert()

    const to = 'valid@email.com'
    await n.pincodeRequested(to, '123456')
    await n.advertCollectWasCancelled(to, u, 1, a, null)
    await n.advertNotCollected(to, u, 1, a)
    await n.advertReservationWasCancelled(to, u, 1, a, null)
    await n.advertWasArchived(to, u, a)
    await n.advertWasCollected(to, u, 1, a, null)
    await n.advertWasCreated(to, u, a)
    await n.advertWasRemoved(to, u, a)
    await n.advertWasReserved(to, u, 1, a, null)
    await n.advertWasUnarchived(to, u, a)
    await n.subscriptionsHasNewAdverts(to, u, [])
    await n.advertNotReturned(to, u, 1, a)
    await n.advertWasReturned(to, u, 1, a)
    await n.advertWasReturnedOwner(to, u, 1, a)

    expect(inner.pincodeRequested).toHaveBeenCalledWith(to, '123456')
    expect(inner.advertCollectWasCancelled).toHaveBeenCalledWith(
      to,
      u,
      1,
      a,
      null
    )
    expect(inner.advertNotCollected).toHaveBeenCalledWith(to, u, 1, a)
    expect(inner.advertReservationWasCancelled).toHaveBeenCalledWith(
      to,
      u,
      1,
      a,
      null
    )
    expect(inner.advertWasArchived).toHaveBeenCalledWith(to, u, a)
    expect(inner.advertWasCollected).toHaveBeenCalledWith(to, u, 1, a, null)
    expect(inner.advertWasCreated).toHaveBeenCalledWith(to, u, a)
    expect(inner.advertWasRemoved).toHaveBeenCalledWith(to, u, a)
    expect(inner.advertWasReserved).toHaveBeenCalledWith(to, u, 1, a, null)
    expect(inner.advertWasUnarchived).toHaveBeenCalledWith(to, u, a)
    expect(inner.subscriptionsHasNewAdverts).toHaveBeenCalledWith(to, u, [])
    expect(inner.advertNotReturned).toHaveBeenCalledWith(to, u, 1, a)
    expect(inner.advertWasReturned).toHaveBeenCalledWith(to, u, 1, a)
    expect(inner.advertWasReturnedOwner).toHaveBeenCalledWith(to, u, 1, a)
  })

  it('doesnt forward calls for non-email users', async () => {
    // NOTE: the test notification services fails on every invocation
    // This test basically checks that test notifications are never invoked
    const inner = createTestNotificationServices({})
    const n = tryCreateEmailUserNotifications(inner)!

    const u: HaffaUser = { id: 'test@user.com' }
    const a = createEmptyAdvert()
    await expect(
      (async () => {
        const to = 'not an email'
        await n.pincodeRequested(to, '123456')
        await n.advertCollectWasCancelled(to, u, 1, a, null)
        await n.advertNotCollected(to, u, 1, a)
        await n.advertReservationWasCancelled(to, u, 1, a, null)
        await n.advertWasArchived(to, u, a)
        await n.advertWasCollected(to, u, 1, a, null)
        await n.advertWasCreated(to, u, a)
        await n.advertWasRemoved(to, u, a)
        await n.advertWasReserved(to, u, 1, a, null)
        await n.advertWasUnarchived(to, u, a)
        await n.subscriptionsHasNewAdverts(to, u, [])
        await n.advertNotReturned(to, u, 1, a)
        return 'no notifications where forwarded'
      })()
    ).resolves.toMatch('no notifications where forwarded')
  })
})
