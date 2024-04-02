import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createLeaveAdvertWaitlist =
  ({
    adverts,
  }: Pick<Services, 'adverts'>): AdvertMutations['leaveAdvertWaitlist'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch(advert => ({
        ...advert,
        waitlist: advert.waitlist.filter(v => v !== user.id),
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
