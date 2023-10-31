import { clearExpiredReservations } from './runners/clear-expired-reservations'
import { notifySubscribedAdverts } from './runners/notify-subscribed-adverts'
import { sendReservationReminder } from './runners/send-reservation-reminder'
import type { TaskList } from './types'

export const tasks: TaskList = {
  TASK_DAILY_MAINTENANCE: [
    {
      taskId: 'CLEAR_EXPIRED_RESERVATIONS',
      runner: clearExpiredReservations,
    },
    {
      taskId: 'SEND_RESERVATION_REMINDER',
      runner: sendReservationReminder,
    },
    {
      taskId: 'NOTIFY_SUBSCRIBED_ADVERTS',
      runner: notifySubscribedAdverts,
    },
  ],
}
