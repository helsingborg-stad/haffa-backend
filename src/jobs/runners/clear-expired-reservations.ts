import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

export const clearExpiredReservations: TaskRunnerSignature = async (
  services,
  { maxReservationDays, reminderSnoozeUntilPicked },
  user
) => {
  const mutations = createAdvertMutations(services as Services)

  // Get list of all reserved adverts
  const adverts = await services.adverts.getAdvertsByClaimStatus({
    type: AdvertClaimType.reserved,
  })
  const result = await adverts?.reduce<Promise<number>>(
    async (p, c) =>
      p.then(res =>
        mutations
          .notifyExpiredClaims(
            user,
            c,
            maxReservationDays,
            reminderSnoozeUntilPicked,
            new Date()
          )
          .then(ver => (ver.advert ? res + 1 : res))
      ),
    Promise.resolve(0)
  )
  return `${result} advert(s) affected`
}
