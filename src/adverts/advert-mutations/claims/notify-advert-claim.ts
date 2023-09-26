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
        const claimIndex = advert.claims.findIndex(matchClaim)

        if (claimIndex === -1) {
          return null
        }

        const lastEventDate = ((claim: AdvertClaim) => {
          let lastDate = claim.at
          if (claim.events && claim.events.length > 0) {
            const e = (a: AdvertClaimEvent, b: AdvertClaimEvent) =>
              b.at.localeCompare(a.at)
            const eventList = [...claim.events].sort(e)
            lastDate = eventList[0].at
          }
          return new Date(lastDate)
        })(advert.claims[claimIndex])

        const newEvent: AdvertClaimEvent[] =
          now.getTime() - lastEventDate.getTime() >= daysToMilliseconds(delay)
            ? [
                {
                  type: AdvertClaimEventType.reminder,
                  at: now.toISOString(),
                },
              ]
            : []
        if (newEvent.length > 0) {
          actions(() =>
            notifications.advertNotCollected(
              { id: advert.claims[claimIndex].by, roles: [] },
              1,
              advert
            )
          )
        }
        return {
          ...advert,
          claims: [
            ...advert.claims.map((claim, index) => ({
              ...claim,
              events: [
                ...(claim.events ?? []),
                ...(index === claimIndex ? newEvent : []),
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
