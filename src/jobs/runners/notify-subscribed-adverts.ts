import type { TaskRunnerSignature } from '../types'

export const notifySubscribedAdverts: TaskRunnerSignature = async services => {
  await services.subscriptions?.notifyAllSubscriptions()
  return ''
}
