import { createTestNotificationServices } from '.'
import { createEmptyAdvert } from '../adverts/mappers'
import type { HaffaUser } from '../login/types'

describe('createTestNotificationServices()', () => {
  it('fails on every invocation', async () => {
    const n = createTestNotificationServices({})
    const u: HaffaUser = { id: 'test@user.com' }
    const a = createEmptyAdvert()
    const t = async (p: Promise<void>) =>
      expect(p).rejects.toMatchObject({ wasUnexpectedNotification: true })

    await t(n.pincodeRequested(u.id, '12345'))
    await t(n.advertCollectWasCancelled(u, 1, a))
    await t(n.advertNotCollected(u, 1, a))
    await t(n.advertReservationWasCancelled(u, 1, a))
    await t(n.advertWasArchived(u, a))
    await t(n.advertWasCollected(u, 1, a))
    await t(n.advertWasCreated(u, a))
    await t(n.advertWasRemoved(u, a))
    await t(n.advertWasReserved(u, 1, a))
    await t(n.advertWasUnarchived(u, a))
    await t(n.subscriptionsHasNewAdverts(u, []))
  })
})
