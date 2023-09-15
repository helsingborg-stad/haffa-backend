import { expireReservations } from './expire-reservations'
import { Task } from './types'

export const tasks = new Map<string, Task[]>([
  ['TASK_PING', [async () => ({ message: 'pong' })]],
  ['TASK_EXPIRE_RESERVATIONS', [expireReservations]],
])
