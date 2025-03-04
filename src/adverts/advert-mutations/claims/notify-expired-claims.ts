import { sortBy } from '../../../lib'
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

        // Rule: Supress notification
        if (snooze === 1 && !meta.isPicked) {
          return null
        }

        const claimsWithMeta = advert.claims
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
                isReserved && isClaimOverdue(claim, interval, now, defaultDate),
            }
          })

        const claims = claimsWithMeta.reduce<AdvertClaim[]>(
          (p, { claim, shouldNotify }) => {
            if (shouldNotify) {
              // Queue notification for Email/SMS delivery
              actions(() =>
                notifications.advertReservationWasCancelled(
                  claim.by,
                  user,
                  claim.quantity,
                  advert,
                  null
                )
              )
              actions(() =>
                notifications.advertReservationWasCancelledOwner(
                  advert.createdBy,
                  user,
                  claim.quantity,
                  advert,
                  null
                )
              )
              actions(() =>
                syslog.write({
                  by: user.id,
                  type: 'NOTIFY_EXPIRED_CLAIM',
                  severity: Severity.info,
                  message: `Removed claim for: ${claim.by} on ${advert.id}`,
                })
              )
              return [...p]
            }
            return [...p, claim]
          },
          []
        )

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
