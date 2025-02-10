import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

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
          actions(patched =>
            Promise.all([
              notifications.advertWasCollected(
                user.id,
                user,
                quantity,
                patched,
                null
              ),
              notifications.advertWasCollectedOwner(
                advert.createdBy,
                user,
                quantity,
                patched,
                null
              ),
            ])
          )

          const reservedByMeCount = advert.claims
            .filter(
              ({ by, type }) =>
                by === user.id && type === AdvertClaimType.reserved
            )
            .map(({ quantity }) => quantity)
            .reduce((s, v) => s + v, 0)
          const collectedByMeCount = advert.claims
            .filter(
              ({ by, type }) =>
                by === user.id && type === AdvertClaimType.collected
            )
            .map(({ quantity }) => quantity)
            .reduce((s, v) => s + v, 0)

          const pickedAt = pickOnCollect ? at : advert.pickedAt

          return {
            ...advert,
            pickedAt,
            claims: normalizeAdvertClaims([
              ...advert.claims.filter(({ by }) => by !== user.id), // all except mine
              {
                by: user.id,
                at,
                quantity: reservedByMeCount - quantity,
                type: AdvertClaimType.reserved,
                events: [],
              },
              {
                by: user.id,
                at,
                quantity: collectedByMeCount + quantity,
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
