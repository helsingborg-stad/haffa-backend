import { Task } from './types'

export const tasks = new Map<string, Task>([
  ['PING', async () => ({ message: 'pong' })],
])
