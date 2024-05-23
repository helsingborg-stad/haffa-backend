import { isValidPhoneNumber } from 'libphonenumber-js'
import { isValidEmail } from '../users'
import type { NotificationService } from './types'

export const tryCreateUserFilteredNotifications = (
  inner: NotificationService | undefined | null,
  isValidUserId: (id: string) => boolean
): NotificationService | null => {
  const guard = (id: string, then: () => Promise<void>): Promise<void> =>
    isValidUserId(id) ? then() : Promise.resolve()
  return inner
    ? {
        subscriptionsHasNewAdverts: (to, ...args) =>
          guard(to, () => inner.subscriptionsHasNewAdverts(to, ...args)),
        pincodeRequested: (to, ...args) =>
          guard(to, () => inner.pincodeRequested(to, ...args)),
        advertWasCreated: (to, ...args) =>
          guard(to, () => inner.advertWasCreated(to, ...args)),
        advertWasRemoved: (to, ...args) =>
          guard(to, () => inner.advertWasRemoved(to, ...args)),
        advertWasArchived: (to, ...args) =>
          guard(to, () => inner.advertWasArchived(to, ...args)),
        advertWasUnarchived: (to, ...args) =>
          guard(to, () => inner.advertWasUnarchived(to, ...args)),
        advertWasReserved: (to, ...args) =>
          guard(to, () => inner.advertWasReserved(to, ...args)),
        advertWasReservedOwner: (to, ...args) =>
          guard(to, () => inner.advertWasReservedOwner(to, ...args)),
        advertReservationWasCancelled: (to, ...args) =>
          guard(to, () => inner.advertReservationWasCancelled(to, ...args)),
        advertReservationWasCancelledOwner: (to, ...args) =>
          guard(to, () =>
            inner.advertReservationWasCancelledOwner(to, ...args)
          ),
        advertWasCollected: (to, ...args) =>
          guard(to, () => inner.advertWasCollected(to, ...args)),
        advertWasCollectedOwner: (to, ...args) =>
          guard(to, () => inner.advertWasCollectedOwner(to, ...args)),
        advertCollectWasCancelled: (to, ...args) =>
          guard(to, () => inner.advertCollectWasCancelled(to, ...args)),
        advertCollectWasCancelledOwner: (to, ...args) =>
          guard(to, () => inner.advertCollectWasCancelledOwner(to, ...args)),
        advertNotCollected: (to, ...args) =>
          guard(to, () => inner.advertNotCollected(to, ...args)),
        advertNotReturned: (to, ...args) =>
          guard(to, () => inner.advertNotReturned(to, ...args)),
        advertWasReturned: (to, ...args) =>
          guard(to, () => inner.advertWasReturned(to, ...args)),
        advertWasReturnedOwner: (to, ...args) =>
          guard(to, () => inner.advertWasReturnedOwner(to, ...args)),
        advertWaitlistAvailable: (to, ...args) =>
          guard(to, () => inner.advertWaitlistAvailable(to, ...args)),
        advertWasPicked: (to, ...args) =>
          guard(to, () => inner.advertWasPicked(to, ...args)),
        advertWasPickedOwner: (to, ...args) =>
          guard(to, () => inner.advertWasPickedOwner(to, ...args)),
        advertWasUnpickedOwner: (to, ...args) =>
          guard(to, () => inner.advertWasUnpickedOwner(to, ...args)),
      }
    : null
}

export const tryCreateEmailUserNotifications = (
  inner: NotificationService | undefined | null
): NotificationService | null =>
  tryCreateUserFilteredNotifications(inner, isValidEmail)

export const tryCreatePhoneUserNotifications = (
  inner: NotificationService | undefined | null
): NotificationService | null =>
  tryCreateUserFilteredNotifications(inner, isValidPhoneNumber)
