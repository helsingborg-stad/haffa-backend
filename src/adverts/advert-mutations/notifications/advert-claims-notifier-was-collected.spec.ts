import { normalizeLocation } from '../../../locations/mappers'
import { makeUser } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { normalizePickupLocation } from '../../../pickup/mappers'
import { createTestNotificationServices } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { Advert } from '../../types'
import { makeCollectClaim } from '../test-utils/claims'
import { createAdvertClaimsNotifier } from './advert-claims-notifier'
import type { AdvertClaimsNotifier } from './types'

describe('createAdvertClaimsNotifier().wasCollected() delegates to NotificationService', () => {
  const createCase = (
    notifications: Partial<NotificationService>,
    patchAdvert: Partial<Advert> = {}
  ): { user: HaffaUser; advert: Advert; notifier: AdvertClaimsNotifier } => {
    const user: HaffaUser = makeUser({ id: 'test@user' })
    const notifier = createAdvertClaimsNotifier({
      user,
      notifications: createTestNotificationServices(notifications),
    })
    const advert = createEmptyAdvert({
      createdBy: 'ow@ner',
      ...patchAdvert,
    })
    return {
      user,
      advert,
      notifier,
    }
  }

  it('wasCollected -> advertWasCollected', async () => {
    const advertWasCollected = jest.fn()
    const advertWasCollectedOwner = jest.fn()
    const { advert, user, notifier } = createCase({
      advertWasCollected,
      advertWasCollectedOwner,
    })

    await notifier.wasCollected(advert, 3, [
      makeCollectClaim({ by: 'some@user' }),
    ])

    expect(advertWasCollectedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      3,
      advert,
      null
    )
    expect(advertWasCollected).toHaveBeenCalledWith(
      'some@user',
      user,
      3,
      advert,
      null
    )
  })

  it('wasCollected -> patches location and notifies pickuplocation email', async () => {
    const advertWasCollected = jest.fn()
    const advertWasCollectedOwner = jest.fn()
    const { advert, user, notifier } = createCase(
      {
        advertWasCollected,
        advertWasCollectedOwner,
      },
      {
        location: normalizeLocation({ name: 'will be overwritten' }),
      }
    )
    const pickupLocation = normalizePickupLocation({
      name: 'pl1',
      city: 'Test Town',
      notifyEmail: 'external@store',
    })

    await notifier.wasCollected(advert, 3, [
      makeCollectClaim({ by: 'some@user', pickupLocation }),
    ])

    expect(advertWasCollectedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
    expect(advertWasCollectedOwner).toHaveBeenCalledWith(
      'external@store',
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
    expect(advertWasCollected).toHaveBeenCalledWith(
      'some@user',
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
  })
})
