import type { HaffaUser } from '../login/types'
import type { SyslogEntry } from '../syslog/types'
import type { Services } from '../types'

export type TaskRunnerSignature = (
  services: Partial<Services>,
  parameters: JobParameters,
  user: HaffaUser
) => Promise<string>

export interface JobParameters {
  maxReservationDays: number
  reminderFrequency: number
  syslogRetentionDays: number
}
export type TaskList = { [key: string]: TaskListItem[] }

export type TaskListItem = {
  taskId: string
  runner: TaskRunnerSignature
}

export interface JobExcecutorService {
  runAs: (user: HaffaUser, jobName: string) => Promise<SyslogEntry[]>
}
