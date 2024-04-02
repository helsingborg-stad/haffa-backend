import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { getAdvertMeta } from '../../advert-meta'
import { type Advert, type AdvertMutations, AdvertClaimType } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createJoinAdvertWaitlist =
  ({
    adverts,
  }: Pick<Services, 'adverts'>): AdvertMutations['joinAdvertWaitlist'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canJoinWaitList,
          TxErrors.Unauthorized
        )
      )
      .patch(advert => ({
        ...advert,
        waitlist: [...new Set<string>([...advert.waitlist, user.id])],
      }))
      .verify((_, ctx) =>
        verifyAll(
          ctx,
          verifyTypeIsReservation,
          verifyReservationLimits,
          verifyReservationsDoesNotExceedQuantity
        )
      )
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
