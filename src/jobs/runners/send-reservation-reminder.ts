import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { AdvertClaim, AdvertMutationStatus } from '../../adverts/types'
import type { Services } from '../../types'
import type { TaskRunnerSignature } from '../types'

interface ReservationReminderResult {
  id: string
  advert?: {
    claims?: AdvertClaim[]
  }
  status: AdvertMutationStatus | null
}

export const sendReservationReminder: TaskRunnerSignature = async (
  services,
  { reminderFrequency }
): Promise<string> => {
  const before = new Date()
  before.setDate(before.getDate() - reminderFrequency)

  const mutations = createAdvertMutations(services as Services)

  const docs = await services.adverts?.getAggregatedClaims({
    before,
    type: AdvertClaimType.reserved,
  })

  const result: ReservationReminderResult[] = []

  docs?.forEach(async doc => {
    const { claims } = doc.advert
    claims.forEach(async reservation => {
      // Send notification
      const ver = await mutations.notifyAdvertClaim(
        {
          id: reservation.by,
          roles: {},
        },
        doc.id,
        AdvertClaimType.reserved,
        reminderFrequency
      )
      result.push({
        id: doc.id,
        advert: {
          claims: ver.advert?.claims,
        },
        status: ver.status,
      })
    })
  })
  return JSON.stringify(result)
}
