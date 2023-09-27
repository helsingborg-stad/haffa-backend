import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

export const clearExpiredReservations: TaskRunnerSignature = async (
  services,
  { maxReservationDays }
): Promise<string> => {
  const before = new Date()
  before.setDate(before.getDate() - maxReservationDays)

  const mutations = createAdvertMutations(services as Services)

  const documents = await services.adverts?.getAggregatedClaims({
    before,
    type: AdvertClaimType.reserved,
  })

  documents?.forEach(async document => {
    document.advert.claims.forEach(async reservation => {
      await mutations.cancelAdvertReservation(
        {
          id: reservation.by,
        },
        document.id
      )
    })
  })
  return JSON.stringify(documents)
}
