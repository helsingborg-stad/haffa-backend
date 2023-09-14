import { HaffaUser } from '../login/types'
import { Services } from '../types'

export interface JobExecutionResult {
  param?: string
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

export type Task = (
  services: Partial<Services>,
  param?: string
) => Promise<JobExecutionResult>

export interface JobExcecutorService {
  runAs: (
    user: HaffaUser,
    task: string,
    services: Partial<Services>,
    param?: string
  ) => JobDefinition
  list: () => string[]
  find: (jobId?: string) => JobDefinition[]
  prune: () => number
}
