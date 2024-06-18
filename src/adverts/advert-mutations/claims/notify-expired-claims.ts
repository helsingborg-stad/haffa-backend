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
    adverts,
    notifications,
    syslog,
  }: Pick<
    Services,
    'adverts' | 'notifications' | 'syslog'
  >): AdvertMutations['notifyExpiredClaims'] =>
  (user, id, interval, now) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const claims = advert.claims.reduce<AdvertClaim[]>((p, c) => {
          if (
            // Check the claim reservation status
            // =====================================
            // A) Claim is of type "reserved"
            // B) Claim creation date + max reservations is larger than "now"
            c.type === AdvertClaimType.reserved &&
            isClaimOverdue(c, interval, now)
          ) {
            // Queue notification for Email/SMS delivery
            actions(() =>
              notifications.advertReservationWasCancelled(
                c.by,
                user,
                c.quantity,
                advert
              )
            )
            actions(() =>
              notifications.advertReservationWasCancelledOwner(
                advert.createdBy,
                user,
                c.quantity,
                advert
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
          return {
            ...advert,
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
