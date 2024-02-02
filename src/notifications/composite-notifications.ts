import type { NotificationService } from './types'

export const createCompositeNotifications = (
  ...notifications: (NotificationService | null | undefined)[]
): NotificationService => {
  const inners = notifications.filter(n => n).map(n => n!)
  const all = (map: (inner: NotificationService) => Promise<void>) =>
    Promise.all(inners.map(map)).then(() => undefined)
  return {
    subscriptionsHasNewAdverts: (...args) =>
      all(inner => inner.subscriptionsHasNewAdverts(...args)),
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
    advertWasReservedOwner: (...args) =>
      all(inner => inner.advertWasReservedOwner(...args)),
    advertReservationWasCancelled: (...args) =>
      all(inner => inner.advertReservationWasCancelled(...args)),
    advertReservationWasCancelledOwner: (...args) =>
      all(inner => inner.advertReservationWasCancelledOwner(...args)),
    advertWasCollected: (...args) =>
      all(inner => inner.advertWasCollected(...args)),
    advertWasCollectedOwner: (...args) =>
      all(inner => inner.advertWasCollectedOwner(...args)),
    advertCollectWasCancelled: (...args) =>
      all(inner => inner.advertCollectWasCancelled(...args)),
    advertCollectWasCancelledOwner: (...args) =>
      all(inner => inner.advertCollectWasCancelledOwner(...args)),
    advertNotCollected: (...args) =>
      all(inner => inner.advertNotCollected(...args)),
    advertNotReturned: (...args) =>
      all(inner => inner.advertNotReturned(...args)),
    advertWasReturned: (...args) =>
      all(inner => inner.advertWasReturned(...args)),
    advertWasReturnedOwner: (...args) =>
      all(inner => inner.advertWasReturnedOwner(...args)),
  }
}
