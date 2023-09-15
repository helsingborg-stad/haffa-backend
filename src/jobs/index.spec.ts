import { createJobExecutorService } from '.'
import { Task } from './types'
import { setTimeout } from 'timers/promises'

const successfulJob: Task = async () => {
  await setTimeout(1000)
  return {
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
])
const service = createJobExecutorService(tasks)
const user = { id: 'admin@haffa.se', roles: [] }

describe('JobsService', () => {
  it('should run asynchronously successfully', async () => {
    const [job] = service.runAs(user, 'SUCCESSFUL_JOB', {}, 'param')
    expect(job.owner).toEqual('admin@haffa.se')
    expect(job.status).toEqual('Pending')
    expect(job.result).toBeNull()
    expect(job.endDate).toBeNull()

    await setTimeout(1000)

    expect(job.status).toEqual('Succeeded')
    expect(job.endDate).toBeDefined()
    expect(job.result).toEqual({
      message: 'test-result',
    })
  })
  it('should handle errors gracefully', async () => {
    const [job] = service.runAs(user, 'FAILING_JOB', {}, 'param')
    expect(job.owner).toEqual('admin@haffa.se')
    expect(job.status).toEqual('Pending')
    expect(job.result).toBeNull()
    expect(job.endDate).toBeNull()

    await setTimeout(1000)

    expect(job.status).toEqual('Failed')
    expect(job.endDate).toBeDefined()
    expect(job.result).toEqual({
      message: 'error-occured',
    })
  })
  it('should keep jobs and statuses in memory', async () => {
    expect(service.find().length).toEqual(2)
  })
  it('should return job definition when requested', async () => {
    const [job] = service.find()
    expect(job?.status).toEqual('Succeeded')
  })

  it('should prune list when requested', async () => {
    service.prune()
    expect(service.find().length).toEqual(0)
  })
})
