import { sortBy } from '../../../lib'
import { Severity } from '../../../syslog/types'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { getNextClaimEventDate } from './mappers'

export const createReservedClaimsNotifier =
  ({
    getAdvertMeta,
    adverts,
    notifications,
    syslog,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications' | 'syslog'
  >): AdvertMutations['notifyReservedClaims'] =>
  (user, id, interval, snooze, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const meta = getAdvertMeta(advert, user, now)

        // Rule: Supress notification
        if (snooze === 1 && !meta.isPicked) {
          return null
        }

        const claims = advert.claims
          // Tag reserved claims
          .map<{
            claim: AdvertClaim
            isReserved: boolean
          }>(claim => ({
            claim,
            isReserved: claim.type === AdvertClaimType.reserved,
          }))
          // Determine if notification should take place
          .map<{
            claim: AdvertClaim
            shouldNotify: boolean
          }>(({ claim, isReserved }) => {
            const defaultDate =
              snooze === 1 && meta.isPicked
                ? [claim.at, advert.pickedAt ?? '']
                    .filter(x => x !== '')
                    .sort(sortBy(x => x))
                    .reverse()[0]
                : claim.at

            return {
              claim,
              shouldNotify:
                isReserved &&
                now >= getNextClaimEventDate(claim, interval, defaultDate),
            }
          })
          // Write Event
          .map(({ claim, shouldNotify }) =>
            shouldNotify
              ? {
                  shouldNotify,
                  claim: {
                    ...claim,
                    events: [
                      ...claim.events,
                      {
                        type: AdvertClaimEventType.reminder,
                        at: now.toISOString(),
                      },
                    ],
                  },
                }
              : { shouldNotify, claim }
          )
        const isModified = claims
          .filter(claim => claim.shouldNotify)
          .reduce<boolean>((_, { claim }) => {
            actions(() =>
              notifications.advertNotCollected(
                claim.by,
                user,
                claim.quantity,
                advert
              )
            )
            actions(() =>
              syslog.write({
                by: user.id,
                type: 'NOTIFY_RESERVATION_REMINDER',
                severity: Severity.info,
                message: `Reminder sent to: ${claim.by} on ${advert.id}`,
              })
            )
            return true
          }, false)
        // One or more claims has been removed
        return isModified
          ? {
              ...advert,
              claims: normalizeAdvertClaims(claims.map(({ claim }) => claim)),
            }
          : null
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
