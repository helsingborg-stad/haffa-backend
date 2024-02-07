import { setTimeout } from 'timers/promises'
import { createJobExecutorService } from '.'
import type { JobParameters, TaskRunnerSignature } from './types'
import { createTestServices } from '../test-utils'
import type { HaffaUser } from '../login/types'

const parameters: JobParameters = {
  maxReservationDays: 10,
  reminderFrequency: 5,
}

const successfulJob: TaskRunnerSignature = async () => {
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
      runner: successfulJob,
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
      runner: successfulJob,
    },
    {
      taskId: '1',
      runner: failingJob,
    },
  ],
}

const service = createJobExecutorService(tasks, parameters)
describe('JobsService', () => {
  it('should run synchronously successfully', async () => {
    const [job] = await service.runAs(
      user,
      'SUCCESSFUL_JOB',
      createTestServices({})
    )
    expect(job.owner).toBe('jane@doe.se')
    expect(job.status).toBe('Succeeded')
    expect(job.endDate).toBeDefined()
    expect(job.result).toBe('test-result')
  })
  it('should handle errors gracefully', async () => {
    const [job] = await service.runAs(
      user,
      'FAILING_JOB',
      createTestServices({})
    )
    expect(job.owner).toBe('jane@doe.se')
    expect(job.status).toBe('Failed')
    expect(job.endDate).toBeDefined()
    expect(job.result).toBe('error-occured')
  })
  it('should run multiple tasks', async () => {
    const jobs = await service.runAs(
      user,
      'MULTIPLE_TASKS',
      createTestServices({})
    )
    expect(jobs).toHaveLength(2)
    expect(jobs[0].taskId).toBe('0')
  })
  it('should keep jobs and statuses in memory', async () => {
    expect(service.find()).toHaveLength(4)
  })
  it('should return job definition when requested', async () => {
    const [job] = service.find()
    expect(job?.status).toBe('Succeeded')
  })

  it('should prune list when requested', async () => {
    service.prune()
    expect(service.find()).toHaveLength(0)
  })
  it('should handle invalid job name gracefully', async () => {
    const jobs = await service.runAs(user, 'DUMMY', createTestServices({}))
    expect(jobs).toHaveLength(0)
  })
})
