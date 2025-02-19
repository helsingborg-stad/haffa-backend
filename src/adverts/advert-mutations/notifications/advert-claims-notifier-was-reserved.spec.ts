import { normalizeLocation } from '../../../locations/mappers'
import { makeUser } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { normalizePickupLocation } from '../../../pickup/mappers'
import { createTestNotificationServices } from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { Advert } from '../../types'
import { makeReservedClaim } from '../test-utils/claims'
import { createAdvertClaimsNotifier } from './advert-claims-notifier'
import type { AdvertClaimsNotifier } from './types'

describe('createAdvertClaimsNotifier().wasReserved() delegates to NotificationService', () => {
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

  it('wasReserved -> advertWasReserved', async () => {
    const advertWasReserved = jest.fn()
    const advertWasReservedOwner = jest.fn()
    const { advert, user, notifier } = createCase({
      advertWasReserved,
      advertWasReservedOwner,
    })

    await notifier.wasReserved(advert, 3, [
      makeReservedClaim({ by: 'some@user' }),
    ])

    expect(advertWasReservedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      3,
      advert,
      null
    )
    expect(advertWasReserved).toHaveBeenCalledWith(
      'some@user',
      user,
      3,
      advert,
      null
    )
  })
  it('wasReserved -> patches location and notifies pickuplocation email', async () => {
    const advertWasReserved = jest.fn()
    const advertWasReservedOwner = jest.fn()
    const { advert, user, notifier } = createCase(
      {
        advertWasReserved,
        advertWasReservedOwner,
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

    await notifier.wasReserved(advert, 3, [
      makeReservedClaim({ by: 'some@user', pickupLocation }),
    ])

    expect(advertWasReservedOwner).toHaveBeenCalledWith(
      advert.createdBy,
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
    expect(advertWasReservedOwner).toHaveBeenCalledWith(
      'external@store',
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
    expect(advertWasReserved).toHaveBeenCalledWith(
      'some@user',
      user,
      3,
      { ...advert, location: normalizeLocation(pickupLocation) },
      null
    )
  })
})
