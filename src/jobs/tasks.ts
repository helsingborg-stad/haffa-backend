import { clearExpiredReservations } from './runners/clear-expired-reservations'
import { sendOverdueReminder } from './runners/notify-overdue-claims'
import { notifySubscribedAdverts } from './runners/notify-subscribed-adverts'
import { runSyslogRetention } from './runners/run-syslog-retention'
import { sendReservationReminder } from './runners/send-reservation-reminder'
import type { TaskList } from './types'

export const tasks: TaskList = {
  TASK_DAILY_MAINTENANCE: [
    {
      taskId: 'JOB_RESERVATION_EXPIRED',
      runner: clearExpiredReservations,
    },
    {
      taskId: 'JOB_RESERVATION_OVERDUE',
      runner: sendReservationReminder,
    },
    {
      taskId: 'JOB_COLLECTION_OVERDUE',
      runner: sendOverdueReminder,
    },
    {
      taskId: 'JOB_SUBSCRIBED_ADVERTS',
      runner: notifySubscribedAdverts,
    },
    {
      taskId: 'JOB_SYSLOG_RETENTION',
      runner: runSyslogRetention,
    },
  ],
}
