import { createAdvertMutations } from '../../adverts/advert-mutations'
import type { Services } from '../../types'
import type { JobExecutionResult, Task } from '../types'

export const clearExpiredReservations: Task = async (
  services,
  { maxReservationDays }
): Promise<JobExecutionResult> => {
  const now = new Date()
  now.setDate(now.getDate() - maxReservationDays)

  const mutations = createAdvertMutations(services as Services)

  const documents = await services.adverts?.getReservationList({
    olderThan: now,
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
  return {
    action: 'Clear expired reservations',
    message: JSON.stringify(documents),
  }
}
