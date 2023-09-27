import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type {
  JobExcecutorService,
  JobParameters,
  TaskList,
  Task,
} from './types'
import { tasks } from './tasks'

export const createJobExecutorService = (
  taskRepository: TaskList,
  parameters: JobParameters
): JobExcecutorService => {
  const history: Task[] = []

  return {
    runAs: async (user, jobName, services = {}) => {
      const taskList = taskRepository[jobName] ?? []

      const jobs: Task[] = []
      // Run synchronously to avoid race conditions
      // eslint-disable-next-line no-restricted-syntax
      for (const task of taskList) {
        const job: Task = {
          jobName,
          taskId: task.taskId,
          owner: user.id,
          parameters,
          status: 'Succeeded',
          startDate: new Date().toISOString(),
          endDate: null,
          result: null,
        }
        jobs.push(job)
        try {
          // eslint-disable-next-line no-await-in-loop
          job.result = await task.runner(services, parameters)
        } catch (ex) {
          job.status = 'Failed'
          job.result = (ex as Error).message
        } finally {
          job.endDate = new Date().toISOString()
        }
      }
      history.push(...jobs)
      return jobs
    },
    list: () => Array.from(Object.keys(taskRepository)),
    find: taskId => history.filter(job => job.taskId === taskId || !taskId),
    prune: () => {
      history.length = 0
    },
  }
}

export const createJobExecutorServiceFromEnv = (): JobExcecutorService => {
  const parameters: JobParameters = {
    maxReservationDays: Number(
      getEnv('MAX_RESERVATION_DAYS', { fallback: '10' })
    ),
    reminderFrequency: Number(
      getEnv('REMINDER_FREQUENCY_DAYS', { fallback: '3' })
    ),
  }
  return createJobExecutorService(tasks, parameters)
}
