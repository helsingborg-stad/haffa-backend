import { createAdvertMutations } from '../../adverts/advert-mutations'
import { AdvertClaimType } from '../../adverts/types'
import type { Services } from '../../types'
import type { JobExecutionResult, Task } from '../types'

export const sendReservationReminder: Task = async (
  services,
  { reminderFrequency }
): Promise<JobExecutionResult> => {
  const before = new Date()
  before.setDate(before.getDate() - reminderFrequency)

  const mutations = createAdvertMutations(services as Services)

  const documents = await services.adverts?.getAggregatedClaims({
    before,
    type: AdvertClaimType.reserved,
  })

  documents?.forEach(async document => {
    document.advert.claims.forEach(async reservation => {
      await mutations.notifyAdvertClaim(
        {
          id: reservation.by,
          roles: [],
        },
        document.id,
        AdvertClaimType.reserved,
        reminderFrequency
      )
    })
  })
  return {
    action: 'Send reservation reminders',
    message: JSON.stringify(documents),
  }
}
