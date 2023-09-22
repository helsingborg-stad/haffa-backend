import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import type { Advert, AdvertClaim, AdvertMutations } from '../../types'
import { AdvertClaimType } from '../../types'
import {
  mapTxResultToAdvertMutationResult,
  normalizeAdvertClaims,
} from '../mappers'
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
  (user, id, quantity) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => {})
      .patch((advert, { actions }) => {
        if (quantity > 0) {
          actions(patched =>
            notifications.advertWasReserved(user, quantity, patched)
          )

          const isReservedByMe = ({ by, type }: AdvertClaim) =>
            by === user.id && type === AdvertClaimType.reserved
          const reservedByMeCount = advert.claims
            .filter(isReservedByMe)
            .map(({ quantity }) => quantity)
            .reduce((s, v) => s + v, 0)

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
