import { randomUUID } from 'crypto'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type {
  JobDefinition,
  JobExcecutorService,
  JobExecutionResult,
  JobParameters,
  Task,
} from './types'
import { tasks } from './tasks'

export const createJobExecutorService = (
  taskRepository: Map<string, Task[]>,
  parameters: JobParameters
): JobExcecutorService => {
  const pendingJobs: JobDefinition[] = []

  return {
    runAs: (user, jobName, services = {}) => {
      const jobId = randomUUID()
      const taskList = taskRepository.get(jobName) ?? []

      const jobs: JobDefinition[] = new Array(taskList?.length).fill({
        jobId,
        jobName,
        owner: user.id,
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'Pending',
        parameters,
        result: null,
      })
      // Run synchronously to avoid race conditions
      void taskList.reduce<Promise<JobExecutionResult>>(
        async (acc, task, i) =>
          acc
            .then(result => {
              jobs[i].status = 'Succeeded'
              jobs[i].result = result
              return task(services, parameters)
            })
            .catch(ex => {
              jobs[i].status = 'Failed'
              jobs[i].result = {
                action: 'Exception caught',
                message: ex.message,
              }
              return task(services, parameters)
            })
            .finally(() => {
              jobs[i].endDate = new Date().toISOString()
            }),
        taskList[0](services, parameters)
      )
      pendingJobs.push(...jobs)
      return jobs
    },
    list: () => Array.from(tasks.keys()),
    find: jobId => pendingJobs.filter(job => job.jobId === jobId || !jobId),
    prune: () => {
      pendingJobs.length = 0
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
