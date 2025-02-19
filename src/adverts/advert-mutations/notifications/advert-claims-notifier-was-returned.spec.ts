import { normalizeLocation } from '../../../locations/mappers'
import { makeUser } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { normalizePickupLocation } from '../../../pickup/mappers'
import { createTestNotificationServices } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { Advert } from '../../types'
import { makeCollectClaim, makeReservedClaim } from '../test-utils/claims'
import { createAdvertClaimsNotifier } from './advert-claims-notifier'
import type { AdvertClaimsNotifier } from './types'

describe('createAdvertClaimsNotifier().wasReturned() delegates to NotificationService', () => {
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

  it('wasReturned -> advertWasReturned', async () => {
    const advertWasReturned = jest.fn()
    const advertWasReturnedOwner = jest.fn()
    const { advert, user, notifier } = createCase({
      advertWasReturned,
      advertWasReturnedOwner,
    })

    await notifier.wasReturned(advert, [
      makeCollectClaim({ by: 'some@user', quantity: 5 }),
    ])

    expect(advertWasReturnedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      5,
      advert
    )
    expect(advertWasReturned).toHaveBeenCalledWith('some@user', user, 5, advert)
  })
  it('wasReturned -> patches location and notifies pickuplocation email', async () => {
    const advertWasReturned = jest.fn()
    const advertWasReturnedOwner = jest.fn()
    const { advert, user, notifier } = createCase(
      {
        advertWasReturned,
        advertWasReturnedOwner,
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

    await notifier.wasReturned(advert, [
      makeCollectClaim({ by: 'some@user', quantity: 7, pickupLocation }),
    ])

    expect(advertWasReturnedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      7,
      { ...advert, location: normalizeLocation(pickupLocation) }
    )
    expect(advertWasReturnedOwner).toHaveBeenCalledWith(
      'external@store',
      user,
      7,
      { ...advert, location: normalizeLocation(pickupLocation) }
    )
    expect(advertWasReturned).toHaveBeenCalledWith('some@user', user, 7, {
      ...advert,
      location: normalizeLocation(pickupLocation),
    })
  })
})
