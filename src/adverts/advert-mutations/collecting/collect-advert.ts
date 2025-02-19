import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertClaimsNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import { claimsBy } from '../claims/mappers'

export const createCollectAdvert =
  ({
    getAdvertMeta,
    adverts,
    notifications,
    workflow: { pickOnCollect },
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications' | 'workflow'
  >): AdvertMutations['reserveAdvert'] =>
  (user, id, quantity) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canCollect, TxErrors.Unauthorized)
      )
      .patch((advert, { actions }) => {
        if (quantity > 0) {
          const at = new Date().toISOString()

          const reserved = advert.claims.filter(
            claimsBy(user, AdvertClaimType.reserved)
          )
          const collected = advert.claims.filter(
            claimsBy(user, AdvertClaimType.collected)
          )

          actions(patched =>
            createAdvertClaimsNotifier({ notifications, user }).wasCollected(
              patched,
              quantity,
              patched.claims.filter(claimsBy(user, AdvertClaimType.collected))
            )
          )

          const pickedAt = pickOnCollect ? at : advert.pickedAt

          return {
            ...advert,
            pickedAt,
            claims: normalizeAdvertClaims([
              ...advert.claims.filter(({ by }) => by !== user.id), // all except mine
              // decrease all reservations (atmost 1 due to normalizations)
              ...reserved.map(c => ({ ...c, quantity: c.quantity - quantity })),
              // increase all collects (atmost 1 due to normalizations)
              ...collected.map(c => ({
                ...c,
                quantity: c.quantity + quantity,
              })),
              // fallback new claim if no previous collects existed
              {
                by: user.id,
                at,
                quantity,
                type: AdvertClaimType.collected,
                events: [],
              },
            ]),
          }
        }
        return advert
      })
      .verify((_, ctx) =>
        verifyAll(
          ctx,
          verifyTypeIsReservation,
          verifyReservationLimits,
          verifyReservationsDoesNotExceedQuantity
        )
      )
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
