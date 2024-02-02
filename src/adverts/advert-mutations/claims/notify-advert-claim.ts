import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import {
  type AdvertClaimEvent,
  type Advert,
  type AdvertMutations,
  type AdvertClaim,
  AdvertClaimEventType,
} from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { getLastClaimEventDate } from './mappers'

const daysToMilliseconds = (days: number) => days * 24 * 60 * 60 * 1000

export const createAdvertClaimNotifier =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['notifyAdvertClaim'] =>
  (user, id, type, delay, now = new Date()) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const matchClaim = (c: AdvertClaim) =>
          c.by === user.id && c.type === type
        const claim = advert.claims.find(matchClaim)

        if (!claim) {
          return null
        }
        const lastEventDate = getLastClaimEventDate(claim)

        const event: AdvertClaimEvent[] =
          now.getTime() - lastEventDate.getTime() >= daysToMilliseconds(delay)
            ? [
                {
                  type: AdvertClaimEventType.reminder,
                  at: now.toISOString(),
                },
              ]
            : []
        if (event.length > 0) {
          actions(() =>
            notifications.advertNotCollected(
              { id: claim.by, roles: {} },
              claim.quantity,
              advert
            )
          )
        }
        return {
          ...advert,
          claims: [
            ...advert.claims.map((c, i) => ({
              ...c,
              events: [
                ...(c.events ?? []),
                ...(i === advert.claims.findIndex(matchClaim) ? event : []),
              ],
            })),
          ],
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
