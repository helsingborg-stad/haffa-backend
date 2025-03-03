import { Severity } from '../../../syslog/types'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import {
  type Advert,
  type AdvertMutations,
  AdvertClaimEventType,
  AdvertClaimType,
} from '../../types'
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
        // =====================================
        // Rule: Supress notification
        // =====================================
        // Apply when:
        // 1. Advert is not yet picked
        // AND
        // 2. reminderSnoozeUntilPicked is set to 1
        if (snooze === 1 && !meta.isPicked) {
          return null
        }

        let isModified = false
        const claims = advert.claims.map(c => {
          // =====================================
          // Rule: Determine comparison date
          // =====================================
          // Comparison date will be pickedAt when
          // 1. Advert is picked
          // AND
          // 2. pickedAt is later than claim date
          // AND
          // 3. reminderSnoozeUntilPicked is set to 1
          //
          // Otherwise comparison date will be claim date
          //
          const defaultDate =
            snooze === 1 && meta.isPicked
              ? [c.at, advert.pickedAt ?? '']
                  .filter(x => x !== '')
                  .sort((x, y) => y.localeCompare(x))[0]
              : c.at
          // =====================================
          // Rule: Check the claim reserved status
          // =====================================
          // A) Claim is of type "reserved"
          // B) Determine the last time a reminder was sent
          //
          // defaultDate will either be the claim date or the pickedAt date
          // of the advert.

          if (
            c.type === AdvertClaimType.reserved &&
            now >= getNextClaimEventDate(c, interval, defaultDate)
          ) {
            // Queue notification for Email/SMS delivery
            actions(() =>
              notifications.advertNotCollected(c.by, user, c.quantity, advert)
            )
            actions(() =>
              syslog.write({
                by: user.id,
                type: 'NOTIFY_RESERVATION_REMINDER',
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
          return c
        })
        // One or more claims has been removed
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
