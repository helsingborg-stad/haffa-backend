import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import {
  type Advert,
  type AdvertMutations,
  type AdvertClaim,
  AdvertClaimType,
} from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { isClaimOverdue } from './mappers'

export const createExpiredClaimsNotifier =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['notifyExpiredClaims'] =>
  (user, id, interval, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const claims = advert.claims.reduce<AdvertClaim[]>((p, c) => {
          if (
            // Check the claims reservation deadline
            c.type === AdvertClaimType.reserved &&
            isClaimOverdue(c, interval, now)
          ) {
            // Queue notification
            actions(() =>
              notifications.advertReservationWasCancelled(
                { id: c.by, roles: {} },
                c.quantity,
                advert
              )
            )
            // Remove claim
            return [...p]
          }
          return [...p, c]
        }, [])

        return {
          ...advert,
          claims,
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
