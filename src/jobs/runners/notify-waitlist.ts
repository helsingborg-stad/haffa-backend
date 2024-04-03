import { createAdvertMutations } from '../../adverts/advert-mutations'
import { waitForAll } from '../../lib'
import type { TaskRunnerSignature } from '../types'

export const notifyWaitlist: TaskRunnerSignature = async (
  services,
  _,
  user
) => {
  const mutations = createAdvertMutations(services)
  const adverts = await services.adverts?.getReservableAdvertsWithWaitlist()
  await waitForAll(adverts, async advertId =>
    mutations.notifyAdvertWaitlist(user, advertId)
  )
  return `${adverts.length} advert(s) affected`
}
