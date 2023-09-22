import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import {
  mapTxResultToAdvertMutationResult,
  normalizeAdvertClaims,
} from '../mappers'

export const createCancelAdvertReservation =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['cancelAdvertReservation'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        actions((patched, original) =>
          notifications.advertReservationWasCancelled(
            user,
            original.claims
              .filter(
                ({ by, type }) =>
                  by === user.id && type === AdvertClaimType.reserved
              )
              .reduce((s, { quantity }) => s + quantity, 0),
            patched
          )
        )
        return {
          ...advert,
          claims: normalizeAdvertClaims(
            advert.claims // remove all reservations for user
              .filter(
                ({ by, type }) =>
                  !(by === user.id && type === AdvertClaimType.reserved)
              )
          ),
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
