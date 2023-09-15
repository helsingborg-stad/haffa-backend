import { clearExpiredReservations } from './clear-expired-reservations'
import { Task } from './types'

export const tasks = new Map<string, Task[]>([
  ['TASK_DAILY_MAINTENANCE', [clearExpiredReservations]],
])
