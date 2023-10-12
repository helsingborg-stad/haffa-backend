import type { NotificationService } from './types'

export const createCompositeNotifications = (
  ...notifications: (NotificationService | null | undefined)[]
): NotificationService => {
  const inners = notifications.filter(n => n).map(n => n!)
  const all = (map: (inner: NotificationService) => Promise<void>) =>
    Promise.all(inners.map(map)).then(() => undefined)
  return {
    pincodeRequested: (...args) =>
      all(inner => inner.pincodeRequested(...args)),
    advertWasCreated: (...args) =>
      all(inner => inner.advertWasCreated(...args)),
    advertWasRemoved: (...args) =>
      all(inner => inner.advertWasRemoved(...args)),
    advertWasArchived: (...args) =>
      all(inner => inner.advertWasArchived(...args)),
    advertWasUnarchived: (...args) =>
      all(inner => inner.advertWasUnarchived(...args)),

    advertWasReserved: (...args) =>
      all(inner => inner.advertWasReserved(...args)),
    advertReservationWasCancelled: (...args) =>
      all(inner => inner.advertReservationWasCancelled(...args)),

    advertWasCollected: (...args) =>
      all(inner => inner.advertWasCollected(...args)),
    advertCollectWasCancelled: (...args) =>
      all(inner => inner.advertCollectWasCancelled(...args)),
    advertNotCollected: (...args) =>
      all(inner => inner.advertNotCollected(...args)),
  }
}
