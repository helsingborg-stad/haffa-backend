import { createJobExecutorService } from '.'
import { JobParameters, Task } from './types'
import { setTimeout } from 'timers/promises'

const parameters: JobParameters = {
  maxReservationDays: 10,
}

const successfulJob: Task = async () => {
  await setTimeout(1000)
  return {
    action: '-',
    message: 'test-result',
  }
}
const failingJob: Task = async () => {
  await setTimeout(1000)
  throw Error('error-occured')
}

const tasks = new Map([
  ['SUCCESSFUL_JOB', [successfulJob]],
  ['FAILING_JOB', [failingJob]],
  ['MULTIPLE_TASKS', [successfulJob, failingJob]],
])
const service = createJobExecutorService(tasks, parameters)
const user = { id: 'admin@haffa.se', roles: [] }

describe('JobsService', () => {
  it('should run asynchronously successfully', async () => {
    const [job] = service.runAs(user, 'SUCCESSFUL_JOB', {})
    expect(job.owner).toEqual('admin@haffa.se')
    expect(job.status).toEqual('Pending')
    expect(job.result).toBeNull()
    expect(job.endDate).toBeNull()

    await setTimeout(1000)

    expect(job.status).toEqual('Succeeded')
    expect(job.endDate).toBeDefined()
    expect(job.result?.message).toEqual('test-result')
  })
  it('should handle errors gracefully', async () => {
    const [job] = service.runAs(user, 'FAILING_JOB', {})
    expect(job.owner).toEqual('admin@haffa.se')
    expect(job.status).toEqual('Pending')
    expect(job.result).toBeNull()
    expect(job.endDate).toBeNull()

    await setTimeout(1000)

    expect(job.status).toEqual('Failed')
    expect(job.endDate).toBeDefined()
    expect(job.result?.message).toEqual('error-occured')
  })
  it('should run multiple tasks', async () => {
    const jobs = service.runAs(user, 'MULTIPLE_TASKS', {})
    expect(jobs.length).toEqual(2)
  })
  it('should keep jobs and statuses in memory', async () => {
    expect(service.find().length).toEqual(4)
  })
  it('should return job definition when requested', async () => {
    const [job] = service.find()
    expect(job?.status).toEqual('Succeeded')
  })

  it('should prune list when requested', async () => {
    service.prune()
    expect(service.find().length).toEqual(0)
  })
  it('should handle invalid job name gracefully', async () => {
    const jobs = service.runAs(user, 'DUMMY', {})
    expect(jobs.length).toEqual(0)
  })
})
