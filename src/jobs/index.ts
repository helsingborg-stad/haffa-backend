import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { JobExcecutorService, JobParameters, TaskList } from './types'
import { tasks } from './tasks'
import type { SyslogEntry, SyslogUserData } from '../syslog/types'
import { Severity } from '../syslog/types'
import type { Services } from '../types'

export const createJobExecutorService = (
  taskRepository: TaskList,
  parameters: JobParameters,
  services: Pick<
    Services,
    'syslog' | 'notifications' | 'adverts' | 'files' | 'subscriptions'
  >
): JobExcecutorService => ({
  runAs: async (user, jobName) =>
    (taskRepository[jobName] ?? []).reduce<Promise<SyslogEntry[]>>(
      async (p, c) =>
        p.then(log => {
          const job: SyslogUserData = {
            by: user.id,
            type: c.taskId,
            severity: Severity.info,
            message: '',
            data: {
              start: new Date().toISOString(),
              end: null,
              parameters,
            },
          }
          return c
            .runner(services, parameters, user)
            .then(result => {
              job.message = result
            })
            .catch(ex => {
              job.severity = Severity.error
              job.message = (ex as Error).message
            })
            .then(async () => {
              if (job.data) {
                job.data.end = new Date().toISOString()
              }
              return [...log, await services.syslog.write(job)]
            })
        }),
      Promise.resolve([])
    ),
})

export const createJobExecutorServiceFromEnv = (
  services: Pick<
    Services,
    'syslog' | 'notifications' | 'adverts' | 'files' | 'subscriptions'
  >
): JobExcecutorService => {
  const parameters: JobParameters = {
    maxReservationDays: Number(
      getEnv('MAX_RESERVATION_DAYS', { fallback: '14' })
    ),
    reminderFrequency: Number(
      getEnv('REMINDER_FREQUENCY_DAYS', { fallback: '3' })
    ),
    syslogRetentionDays: Number(
      getEnv('SYSLOG_RETENTION_DAYS', { fallback: '10' })
    ),
  }
  return createJobExecutorService(tasks, parameters, services)
}
