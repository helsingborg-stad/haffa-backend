import { Severity } from '../../../syslog/types'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import {
  type Advert,
  type AdvertMutations,
  AdvertClaimType,
  AdvertClaimEventType,
} from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { getNextClaimEventDate, isClaimOverdue } from './mappers'

export const createOverdueClaimsNotifier =
  ({
    adverts,
    notifications,
    syslog,
  }: Pick<
    Services,
    'adverts' | 'notifications' | 'syslog'
  >): AdvertMutations['notifyOverdueClaims'] =>
  (user, id, interval, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        let isModified = false

        const claims = advert.claims.map(c => {
          if (
            // Check the claim collection status
            // =====================================
            // A) Claim is of type "collected"
            // B) Claim modification date + lending period is larger than "now"
            c.type === AdvertClaimType.collected &&
            isClaimOverdue(c, advert.lendingPeriod, now)
          ) {
            // Determine the last time a reminder was sent
            // =====================================
            if (now >= getNextClaimEventDate(c, interval)) {
              // Queue notification for Email/SMS delivery
              actions(() =>
                notifications.advertNotReturned(
                  c.by,
                  { id: c.by, roles: {} },
                  c.quantity,
                  advert
                )
              )
              actions(() =>
                syslog.write({
                  by: user.id,
                  type: 'NOTIFY_OVERDUE_REMINDER',
                  severity: Severity.info,
                  message: `Reminder sent to: ${c.by} on ${advert.id}`,
                })
              )
              isModified = true
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
        // One or more claims has been modified
        return isModified
          ? {
              ...advert,
              claims: normalizeAdvertClaims(claims),
            }
          : null
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
