import type { HaffaUser } from '../login/types'
import type { Services } from '../types'

export interface JobExecutionResult {
  action: string
  message: string
}
export type JobStatus = 'Failed' | 'Succeeded' | 'Pending'

export interface JobParameters {
  maxReservationDays: number
  reminderFrequency: number
}
export interface JobDefinition {
  jobId: string
  jobName: string
  owner: string
  status: JobStatus
  startDate: string
  endDate: string | null
  parameters: JobParameters
  result: JobExecutionResult | null
}

export type Task = (
  services: Partial<Services>,
  parameters: JobParameters
) => Promise<JobExecutionResult>

export interface JobExcecutorService {
  runAs: (
    user: HaffaUser,
    jobName: string,
    services: Partial<Services>
  ) => JobDefinition[]
  list: () => string[]
  find: (jobId?: string) => JobDefinition[]
  prune: () => void
}
