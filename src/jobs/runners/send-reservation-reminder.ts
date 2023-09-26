import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { AdvertMutationResult } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

export const sendReservationReminder: TaskRunnerSignature = async (
  services,
  { reminderFrequency }
): Promise<string> => {
  const before = new Date()
  before.setDate(before.getDate() - reminderFrequency)

  const mutations = createAdvertMutations(services as Services)

  const documents = await services.adverts?.getAggregatedClaims({
    before,
    type: AdvertClaimType.reserved,
  })

  const result: Promise<AdvertMutationResult>[] = []
  documents?.forEach(async document => {
    document.advert.claims.forEach(async reservation => {
      result.push(
        mutations.notifyAdvertClaim(
          {
            id: reservation.by,
            roles: [],
          },
          document.id,
          AdvertClaimType.reserved,
          reminderFrequency
        )
      )
    })
  })
  return JSON.stringify(await Promise.all(result))
}
