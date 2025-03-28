import { makeUser } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import {
  normalizePickupLocation,
  patchAdvertWithPickupLocation,
} from '../../../pickup/mappers'
import { createTestNotificationServices } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { Advert } from '../../types'
import { makeCollectClaim, makeReservedClaim } from '../test-utils/claims'
import { createAdvertNotifier } from './advert-notifier'
import type { AdvertNotifier } from './types'

describe('advert-notifier delegates to NotificationService', () => {
  const createCase = (
    notifications: Partial<NotificationService>
  ): { user: HaffaUser; advert: Advert; notifier: AdvertNotifier } => {
    const user: HaffaUser = makeUser({ id: 'test@user' })
    const notifier = createAdvertNotifier({
      user,
      notifications: createTestNotificationServices(notifications),
    })
    const advert = createEmptyAdvert({
      createdBy: 'ow@ner',
    })
    return {
      user,
      advert,
      notifier,
    }
  }
  it('wasArchived(advert) -> advertWasArchived(advert.createBy, user, advert)', async () => {
    const advertWasArchived = jest.fn()
    const { user, advert, notifier } = createCase({ advertWasArchived })
    await notifier.wasArchived(advert)
    expect(advertWasArchived).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
  })
  it('wasUnarchived(advert) -> advertWasUnarchived(advert.createBy, user, advert)', async () => {
    const advertWasUnarchived = jest.fn()
    const { user, advert, notifier } = createCase({ advertWasUnarchived })
    await notifier.wasUnArchived(advert)
    expect(advertWasUnarchived).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
  })
  it('wasRemoved(advert) -> advertWasRemoved(advert.createBy, user, advert)', async () => {
    const advertWasRemoved = jest.fn()
    const { user, advert, notifier } = createCase({ advertWasRemoved })
    await notifier.wasRemoved(advert)
    expect(advertWasRemoved).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
  })
  it('wasPicked(advert) -> advertWasPickedOwner(advert.createBy, user, advert)', async () => {
    const advertWasPickedOwner = jest.fn()
    const { user, advert, notifier } = createCase({ advertWasPickedOwner })
    await notifier.wasPicked(advert, [])
    expect(advertWasPickedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
  })
  it('wasPicked(advert) -> advertWasPicked(<reservation claims>)', async () => {
    const advertWasPicked = jest.fn()
    const advertWasPickedOwner = jest.fn()
    const { user, advert, notifier } = createCase({
      advertWasPicked,
      advertWasPickedOwner,
    })
    const pl1 = normalizePickupLocation({})
    const pl2 = undefined
    await notifier.wasPicked(advert, [
      makeReservedClaim({ by: 'first@user', pickupLocation: pl1 }),
      makeCollectClaim({ by: 'ignored' }),
      makeReservedClaim({ by: 'second@user', pickupLocation: pl2 }),
    ])
    expect(advertWasPickedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      patchAdvertWithPickupLocation(advert, pl1)
    )
    expect(advertWasPickedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      patchAdvertWithPickupLocation(advert, pl1)
    )

    expect(advertWasPicked).toHaveBeenCalledWith('first@user', user, advert)
    expect(advertWasPicked).toHaveBeenCalledWith('second@user', user, advert)
  })
  it('wasPicked(advert without reservations) -> advertWasPicked([])', async () => {
    const advertWasPicked = jest.fn()
    const advertWasPickedOwner = jest.fn()
    const { user, advert, notifier } = createCase({
      advertWasPicked,
      advertWasPickedOwner,
    })
    await notifier.wasPicked(advert, [])
    expect(advertWasPickedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
    expect(advertWasPicked).toHaveBeenCalledTimes(0)
  })
  it('wasUnpicked(advert) -> advertWasUnpickedOwner(advert.createBy, user, advert)', async () => {
    const advertWasUnpickedOwner = jest.fn()
    const { user, advert, notifier } = createCase({ advertWasUnpickedOwner })
    await notifier.wasUnPicked(advert)
    expect(advertWasUnpickedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      advert
    )
  })
})
