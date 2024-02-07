import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import {
  type Advert,
  type AdvertMutations,
  type AdvertClaim,
  AdvertClaimEventType,
  AdvertClaimType,
} from '../../types'
import {
  mapTxResultToAdvertMutationResult,
  normalizeAdvertClaims,
} from '../mappers'
import { getNextClaimEventDate } from './mappers'

export const createReservedClaimsNotifier =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['notifyReservedClaims'] =>
  (user, id, interval, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const claims = advert.claims.map(c => {
          // Act on reservations only
          if (c.type === AdvertClaimType.reserved) {
            // Determine the next reminder date
            if (now >= getNextClaimEventDate(c, interval)) {
              // Queue notifications
              actions(() =>
                notifications.advertNotCollected(
                  { id: c.by, roles: {} },
                  c.quantity,
                  advert
                )
              )

              // Add reminder event
              return {
                ...c,
                events: [
                  ...c.events,
                  {
                    type: AdvertClaimEventType.reminder,
                    at: now.toISOString(),
                  },
                ],
              }
            }
          }
          return c
        })
        return {
          ...advert,
          claims: normalizeAdvertClaims(claims),
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
