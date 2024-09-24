import { setTimeout } from 'timers/promises'
import { createJobExecutorService } from '.'
import type { JobParameters, TaskRunnerSignature } from './types'
import { createTestServices } from '../test-utils'
import type { HaffaUser } from '../login/types'
import { Severity } from '../syslog/types'

const parameters: JobParameters = {
  maxReservationDays: 10,
  reminderFrequency: 5,
  reminderSnoozeUntilPicked: 0,
  syslogRetentionDays: 2,
}

const successfulJob1: TaskRunnerSignature = async () => {
  await setTimeout(1000)
  return 'test-result'
}
const successfulJob2: TaskRunnerSignature = async () => {
  await setTimeout(500)
  return 'test-result'
}
const failingJob: TaskRunnerSignature = async () => {
  throw Error('error-occured')
}

const user: HaffaUser = {
  roles: {},
  id: 'jane@doe.se',
}
const tasks = {
  SUCCESSFUL_JOB: [
    {
      taskId: '0',
      runner: successfulJob1,
    },
  ],
  FAILING_JOB: [
    {
      taskId: '1',
      runner: failingJob,
    },
  ],
  MULTIPLE_TASKS: [
    {
      taskId: '0',
      runner: successfulJob1,
    },
    {
      taskId: '1',
      runner: failingJob,
    },
    {
      taskId: '2',
      runner: successfulJob2,
    },
  ],
}

const services = createTestServices({})

services.jobs = createJobExecutorService(tasks, parameters, services)

describe('JobsService', () => {
  it('should run synchronously successfully', async () => {
    const [job] = await services.jobs.runAs(user, 'SUCCESSFUL_JOB')
    expect(job.by).toBe('jane@doe.se')
    expect(job.severity).toBe(Severity.info)
    expect(job.data?.end).toBeDefined()
    expect(job.message).toBe('test-result')
  })

  it('should handle errors gracefully', async () => {
    const [job] = await services.jobs.runAs(user, 'FAILING_JOB')
    expect(job.by).toBe('jane@doe.se')
    expect(job.severity).toBe(Severity.error)
    expect(job.data?.end).toBeDefined()
    expect(job.message).toBe('error-occured')
  })
  it('should handle invalid job name gracefully', async () => {
    const jobs = await services.jobs.runAs(user, 'DUMMY')
    expect(jobs).toHaveLength(0)
  })

  it('should run multiple tasks sequentially', async () => {
    const jobs = await services.jobs.runAs(user, 'MULTIPLE_TASKS')
    expect(jobs).toHaveLength(3)
    expect(jobs.map(j => j.type)).toStrictEqual(['0', '1', '2'])
  })
})
