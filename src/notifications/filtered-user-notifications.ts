import { isValidPhoneNumber } from 'libphonenumber-js'
import type { HaffaUser } from '../login/types'
import { isValidEmail } from '../users'
import type { NotificationService } from './types'

export const tryCreateUserFilteredNotifications = (
  inner: NotificationService | undefined | null,
  isValidUserId: (id: string) => boolean
): NotificationService | null => {
  const whenId = (id: string, then: () => Promise<void>): Promise<void> =>
    isValidUserId(id) ? then() : Promise.resolve()
  const whenUser = (
    { id }: HaffaUser,
    then: () => Promise<void>
  ): Promise<void> => whenId(id, then)

  return inner
    ? {
        subscriptionsHasNewAdverts: (...args) =>
          whenUser(args[0], () => inner.subscriptionsHasNewAdverts(...args)),
        pincodeRequested: (...args) =>
          whenId(args[0], () => inner.pincodeRequested(...args)),
        advertWasCreated: (...args) =>
          whenUser(args[0], () => inner.advertWasCreated(...args)),
        advertWasRemoved: (...args) =>
          whenUser(args[0], () => inner.advertWasRemoved(...args)),
        advertWasArchived: (...args) =>
          whenUser(args[0], () => inner.advertWasArchived(...args)),
        advertWasUnarchived: (...args) =>
          whenUser(args[0], () => inner.advertWasUnarchived(...args)),
        advertWasReserved: (...args) =>
          whenUser(args[0], () => inner.advertWasReserved(...args)),
        advertReservationWasCancelled: (...args) =>
          whenUser(args[0], () => inner.advertReservationWasCancelled(...args)),
        advertWasCollected: (...args) =>
          whenUser(args[0], () => inner.advertWasCollected(...args)),
        advertCollectWasCancelled: (...args) =>
          whenUser(args[0], () => inner.advertCollectWasCancelled(...args)),
        advertNotCollected: (...args) =>
          whenUser(args[0], () => inner.advertNotCollected(...args)),
        advertNotReturned: (...args) =>
          whenUser(args[0], () => inner.advertNotReturned(...args)),
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
