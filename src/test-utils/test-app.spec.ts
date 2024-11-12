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

    const to = 'some@user.id'
    await t(n.pincodeRequested(u.id, '12345'))
    await t(n.advertCollectWasCancelled(to, u, 1, a, null))
    await t(n.advertNotCollected(to, u, 1, a))
    await t(n.advertReservationWasCancelled(to, u, 1, a, null))
    await t(n.advertWasArchived(to, u, a))
    await t(n.advertWasCollected(to, u, 1, a, null))
    await t(n.advertWasCreated(to, u, a))
    await t(n.advertWasRemoved(to, u, a))
    await t(n.advertWasReserved(to, u, 1, a, null))
    await t(n.advertWasUnarchived(to, u, a))
    await t(n.subscriptionsHasNewAdverts(to, u, []))
  })
})
