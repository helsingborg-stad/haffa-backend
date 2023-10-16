import { createAdvertMutations } from '../../adverts/advert-mutations'
import type { AdvertClaim, AdvertMutationStatus } from '../../adverts/types'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

interface ExpireReservationsResult {
  id: string
  advert?: {
    title?: string
    claims?: AdvertClaim[]
  }
  status: AdvertMutationStatus | null
}

export const clearExpiredReservations: TaskRunnerSignature = async (
  services,
  { maxReservationDays }
): Promise<string> => {
  const before = new Date()
  before.setDate(before.getDate() - maxReservationDays)

  const mutations = createAdvertMutations(services as Services)

  const docs = await services.adverts?.getAggregatedClaims({
    before,
    type: AdvertClaimType.reserved,
  })
  const result: ExpireReservationsResult[] = []

  docs?.forEach(async doc => {
    const { claims } = doc.advert
    claims.forEach(async reservation => {
      // Cancel reservation
      const ver = await mutations.cancelAdvertReservation(
        {
          id: reservation.by,
        },
        doc.id
      )
      result.push({
        id: doc.id,
        advert: {
          title: ver.advert?.title,
          claims: ver.advert?.claims,
        },
        status: ver.status,
      })
    })
  })
  return JSON.stringify(result)
}
