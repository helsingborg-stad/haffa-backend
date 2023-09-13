import { HaffaUser } from '../login/types'
import { Services } from '../types'

export interface JobExecutionResult {
  message: string
}
export type JOB_STATUS = 'Failed' | 'Succeeded' | 'Pending'

export interface JobDefinition {
  jobId: string
  owner: string
  status: JOB_STATUS
  startDate: string
  endDate: string | null
  result: JobExecutionResult | null
}

export type Task = (services: Partial<Services>) => Promise<JobExecutionResult>

export interface JobExcecutorService {
  runAs: (
    user: HaffaUser,
    task: string,
    services: Partial<Services>
  ) => JobDefinition
  list: () => JobDefinition[]
  find: (jobId: string) => JobDefinition | undefined
  prune: () => number
}
