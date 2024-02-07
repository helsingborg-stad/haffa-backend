import type { HaffaUser } from '../login/types'
import type { Services } from '../types'

export type TaskRunnerSignature = (
  services: Services,
  parameters: JobParameters,
  user: HaffaUser
) => Promise<string>

export type Status = 'Failed' | 'Succeeded'

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
    services: Services
  ) => Promise<Task[]>
  list: () => string[]
  find: (jobId?: string) => Task[]
  prune: () => void
}
