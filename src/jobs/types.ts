import type { HaffaUser } from '../login/types'
import type { Services } from '../types'

export type TaskRunnerSignature = (
  services: Partial<Services>,
  parameters: JobParameters
) => Promise<string>

export type Status = 'Failed' | 'Succeeded' | 'Pending'

export interface JobParameters {
  maxReservationDays: number
  reminderFrequency: number
}
export interface Task {
  taskId: string
  jobName: string
  owner: string
  parameters: JobParameters
  status: Status
  startDate: string
  endDate: string | null
  result: string | null
}

export type TaskList = { [key: string]: TaskListItem[] }

export type TaskListItem = {
  taskId: string
  runner: TaskRunnerSignature
}

export interface JobExcecutorService {
  runAs: (
    user: HaffaUser,
    jobName: string,
    services: Partial<Services>
  ) => Promise<Task[]>
  list: () => string[]
  find: (jobId?: string) => Task[]
  prune: () => void
}
