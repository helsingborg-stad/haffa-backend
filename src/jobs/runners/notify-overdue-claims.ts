import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

export const sendOverdueReminder: TaskRunnerSignature = async (
  services,
  { reminderFrequency },
  user
) => {
  const mutations = createAdvertMutations(services as Services)

  // Get list of all reserved adverts
  const adverts = await services.adverts?.getAdvertsByClaimStatus({
    type: AdvertClaimType.collected,
  })
  const result = await Promise.all(
    adverts.map(async advert =>
      mutations
        .notifyOverdueClaims(user, advert, reminderFrequency, new Date())
        .then(ver => ({
          id: advert,
          status: ver.status,
        }))
    )
  )
  return JSON.stringify(result)
}
