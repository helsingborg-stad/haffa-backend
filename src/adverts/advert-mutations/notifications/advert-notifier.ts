import type { Func } from '../../../lib/types'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { patchAdvertWithPickupLocation } from '../../../pickup/mappers'
import { AdvertClaimType } from '../../types'
import type { AdvertNotifier } from './types'

export const createAdvertNotifier: Func<
  {
    user: HaffaUser
    notifications: NotificationService
  },
  AdvertNotifier
> = ({ user, notifications }) => ({
  wasArchived: advert =>
    notifications.advertWasArchived(advert.createdBy, user, advert),
  wasUnArchived: advert =>
    notifications.advertWasUnarchived(advert.createdBy, user, advert),
  wasRemoved: advert =>
    notifications.advertWasRemoved(advert.createdBy, user, advert),
  wasPicked: (advert, claims) =>
    Promise.all([
      notifications.advertWasPickedOwner(advert.createdBy, user, advert),
      ...claims
        .filter(({ type }) => type === AdvertClaimType.reserved)
        .map(({ by: to, pickupLocation }) =>
          notifications.advertWasPicked(
            to,
            user,
            patchAdvertWithPickupLocation(advert, pickupLocation)
          )
        ),
    ]),
  wasUnPicked: advert =>
    notifications.advertWasUnpickedOwner(advert.createdBy, user, advert),
})
