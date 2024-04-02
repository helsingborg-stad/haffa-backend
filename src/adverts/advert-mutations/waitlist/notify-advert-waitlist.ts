import { makeUser } from '../../../login'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import { type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createNotifyAdvertWaitlist =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['notifyAdvertWaitlist'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const quantity = getAdvertMeta(advert, user).reservableQuantity
        const recipients = advert.waitlist
        if (quantity < 1 || recipients.length === 0) {
          // no changes
          return null
        }

        // Notify each recipient about availability
        recipients.forEach(recipient =>
          actions(() =>
            notifications.advertWaitlistAvailable(
              makeUser({ id: recipient }),
              quantity,
              advert
            )
          )
        )

        return {
          ...advert,
          waitlist: [],
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
