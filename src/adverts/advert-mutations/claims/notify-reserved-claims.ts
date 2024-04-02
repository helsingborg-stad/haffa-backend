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
    adverts,
    notifications,
    syslog,
  }: Pick<
    Services,
    'adverts' | 'notifications' | 'syslog'
  >): AdvertMutations['notifyReservedClaims'] =>
  (user, id, interval, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        let isModified = false

        const claims = advert.claims.map(c => {
          // Check the claim reserved status
          // =====================================
          // A) Claim is of type "reserved"
          // B) Determine the last time a reminder was sent
          if (
            c.type === AdvertClaimType.reserved &&
            now >= getNextClaimEventDate(c, interval)
          ) {
            // Queue notification for Email/SMS delivery
            actions(() =>
              notifications.advertNotCollected(
                { id: c.by, roles: {} },
                c.quantity,
                advert
              )
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
