import type { Func } from '../../../lib/types'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { patchAdvertWithPickupLocation } from '../../../pickup/mappers'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'
import type { AdvertNotifier } from './types'

const isReservedClaim = ({ type }: AdvertClaim) =>
  type === AdvertClaimType.reserved

const ensureAtleastOne = <T>(l: T[], theOne: T): T[] =>
  l.length > 0 ? l : [theOne]

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
      // get reservation pickup locations
      ...ensureAtleastOne(
        claims
          .filter(isReservedClaim)
          .map(({ pickupLocation }) => pickupLocation)
          .filter(pickupLocation => pickupLocation),
        undefined // ...or a default unset one
      ).map(pickupLocation =>
        notifications.advertWasPickedOwner(
          advert.createdBy,
          user,
          patchAdvertWithPickupLocation(advert, pickupLocation)
        )
      ),
      ...claims
        .filter(isReservedClaim)
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
