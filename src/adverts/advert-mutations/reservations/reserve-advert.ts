import { patchAdvertWithPickupLocation } from '../../../pickup/mappers'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import type { Advert, AdvertClaim, AdvertMutations } from '../../types'
import { AdvertClaimType } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertClaimsNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyTypeIsReservation,
} from '../verifiers'

export const createReserveAdvert =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['reserveAdvert'] =>
  (user, id, quantity, location) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => {})
      .patch((advert, { actions }) => {
        if (quantity > 0) {
          /*
          actions(patched =>
            
            Promise.all([
              notifications.advertWasReserved(
                user.id,
                user,
                quantity,
                patchAdvertWithPickupLocation(patched, location),
                null
              ),
              notifications.advertWasReservedOwner(
                location?.notifyEmail || advert.createdBy,
                user,
                quantity,
                patchAdvertWithPickupLocation(patched, location),
                null
              ),
            ])
          )
            */

          const isReservedByMe = ({ by, type }: AdvertClaim) =>
            by === user.id && type === AdvertClaimType.reserved
          const reservedByMeCount = advert.claims
            .filter(isReservedByMe)
            .map(c => c.quantity)
            .reduce((s, v) => s + v, 0)

          const reservationClaim = {
            by: user.id,
            at: new Date().toISOString(),
            quantity: reservedByMeCount + quantity,
            type: AdvertClaimType.reserved,
            events: [],
            pickupLocation: location,
          }

          actions(patched =>
            createAdvertClaimsNotifier({ notifications, user }).wasReserved(
              patched,
              quantity,
              [reservationClaim]
            )
          )

          return {
            ...advert,
            claims: normalizeAdvertClaims([
              ...advert.claims.filter(a => !isReservedByMe(a)),
              {
                by: user.id,
                at: new Date().toISOString(),
                quantity: reservedByMeCount + quantity,
                type: AdvertClaimType.reserved,
                events: [],
                pickupLocation: location,
              },
            ]),
          }
        }
        return advert
      })
      .verify((_, ctx) =>
        verifyAll(ctx, verifyTypeIsReservation, verifyReservationLimits)
      )
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
