import {
  JobDefinition,
  JobExcecutorService,
  JobParameters,
  Task,
} from './types'
import { randomUUID } from 'crypto'
import { tasks } from './tasks'
import { getEnv } from '@helsingborg-stad/gdi-api-node'

export const createJobExecutorService = (
  taskRepository: Map<string, Task[]>,
  parameters: JobParameters
): JobExcecutorService => {
  const pendingJobs: JobDefinition[] = []

  return {
    runAs: (user, jobName, services = {}) => {
      const jobList =
        taskRepository.get(jobName)?.map(task => {
          const job: JobDefinition = {
            jobId: randomUUID(),
            jobName,
            owner: user.id,
            startDate: new Date().toISOString(),
            endDate: null,
            status: 'Pending',
            parameters,
            result: null,
          }
          task(services, parameters)
            .then(result => {
              job.status = 'Succeeded'
              job.result = result
            })
            .catch(ex => {
              job.status = 'Failed'
              job.result = { action: 'Exception caught', message: ex.message }
            })
            .finally(() => {
              job.endDate = new Date().toISOString()
            }) ?? invalidTask(job)
          return job
        }) ?? []
      pendingJobs.push(...jobList)
      return jobList
    },
    list: () => Array.from(tasks.keys()),
    find: jobId => {
      const job = pendingJobs.find(job => job.jobId === jobId)
      return job ? [job] : pendingJobs
    },
    prune: () => (pendingJobs.length = 0),
  }
}

export const createJobExecutorServiceFromEnv = (): JobExcecutorService => {
  const parameters: JobParameters = {
    maxReservationDays: Number(
      getEnv('MAX_RESERVATION_DAYS', { fallback: '10' })
    ),
  }
  return createJobExecutorService(tasks, parameters)
}

const invalidTask = (job: JobDefinition) => {
  job.endDate = new Date().toISOString()
  job.status = 'Failed'
  job.result = {
    action: '-',
    message: `Invalid task in ${job.jobName}`,
  }
}