import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

export const clearExpiredReservations: TaskRunnerSignature = async (
  services,
  { maxReservationDays },
  user
) => {
  const mutations = createAdvertMutations(services as Services)

  // Get list of all reserved adverts
  const adverts = await services.adverts?.getAdvertsByClaimStatus({
    type: AdvertClaimType.reserved,
  })
  const result = await adverts.reduce<Promise<string[]>>(
    async (p, c) =>
      p.then(res =>
        mutations
          .notifyExpiredClaims(user, c, maxReservationDays, new Date())
          .then(ver => (ver.advert ? [...res, c] : res))
      ),
    Promise.resolve([])
  )

  return JSON.stringify(result)
}
