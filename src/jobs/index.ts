import { JobDefinition, JobExcecutorService, Task } from './types'
import { randomUUID } from 'crypto'
import { tasks } from './tasks'

export const createJobExecutorService = (
  taskRepository: Map<string, Task[]>
): JobExcecutorService => {
  const pendingJobs: JobDefinition[] = []

  return {
    runAs: (user, jobName, services, param) => {
      const jobList =
        taskRepository.get(jobName)?.map(task => {
          const job: JobDefinition = {
            jobId: randomUUID(),
            owner: user.id,
            startDate: new Date().toISOString(),
            endDate: null,
            status: 'Pending',
            result: null,
          }
          task(services, param)
            .then(result => {
              job.status = 'Succeeded'
              job.result = result
            })
            .catch(ex => {
              job.status = 'Failed'
              job.result = { message: ex.message }
            })
            .finally(() => {
              job.endDate = new Date().toISOString()
            }) ?? invalidTask(jobName, job)
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

export const createJobExecutorServiceFromEnv = (): JobExcecutorService =>
  createJobExecutorService(tasks)

const invalidTask = (taskName: string, job: JobDefinition) => {
  job.endDate = new Date().toISOString()
  job.status = 'Failed'
  job.result = {
    message: `Invalid task ${taskName}`,
  }
}
