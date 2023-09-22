import { clearExpiredReservations } from './clear-expired-reservations'
import { sendReservationReminder } from './send-reservation-reminder'
import type { Task } from './types'

export const tasks = new Map<string, Task[]>([
  [
    'TASK_DAILY_MAINTENANCE',
    [clearExpiredReservations, sendReservationReminder],
  ],
])
