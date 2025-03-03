import { Severity } from '../../../syslog/types'
import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
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
    getAdvertMeta,
    adverts,
    notifications,
    syslog,
    workflow: { unpickOnReturn },
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications' | 'syslog' | 'workflow'
  >): AdvertMutations['notifyExpiredClaims'] =>
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
        //
        if (snooze === 1 && !meta.isPicked) {
          return null
        }

        const claims = advert.claims.reduce<AdvertClaim[]>((p, c) => {
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

          if (
            // Check the claim reservation status
            // =====================================
            // A) Claim is of type "reserved"
            // B) Claim creation date + max reservations is larger than "now"
            c.type === AdvertClaimType.reserved &&
            isClaimOverdue(c, interval, now, defaultDate)
          ) {
            // Queue notification for Email/SMS delivery
            actions(() =>
              notifications.advertReservationWasCancelled(
                c.by,
                user,
                c.quantity,
                advert,
                null
              )
            )
            actions(() =>
              notifications.advertReservationWasCancelledOwner(
                advert.createdBy,
                user,
                c.quantity,
                advert,
                null
              )
            )
            actions(() =>
              syslog.write({
                by: user.id,
                type: 'NOTIFY_EXPIRED_CLAIM',
                severity: Severity.info,
                message: `Removed claim for: ${c.by} on ${advert.id}`,
              })
            )
            // Remove claim from advert
            return [...p]
          }
          // Retain claim in advert
          return [...p, c]
        }, [])

        // One or more claims has been removed
        if (claims.length !== advert.claims.length) {
          const pickedAt = unpickOnReturn ? '' : advert.pickedAt

          return {
            ...advert,
            pickedAt,
            claims: normalizeAdvertClaims(claims),
          }
        }
        // No changes
        return null
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
