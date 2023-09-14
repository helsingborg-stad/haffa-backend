import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createAdvertMutations } from '../../adverts/advert-mutations'
import { Services } from '../../types'
import { JobExecutionResult, Task } from '../types'

export const expireReservations: Task = async (
  services,
  param = getEnv('TASK_EXPIRE_RESERVATIONS', { fallback: '10' })
): Promise<JobExecutionResult> => {
  const now = new Date()
  now.setDate(now.getDate() - Number.parseInt(param))

  const mutations = createAdvertMutations(services as Services)

  const documents = await services.adverts?.getReservationList({
    olderThan: now,
  })

  documents?.forEach(async document => {
    document.advert.claims.forEach(async reservation => {
      await mutations.cancelAdvertReservation(
        {
          id: reservation.by,
          roles: [],
        },
        document.id
      )
    })
  })
  return {
    message: JSON.stringify(documents),
    param,
  }
}
