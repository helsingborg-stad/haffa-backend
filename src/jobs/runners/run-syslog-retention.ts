import type { TaskRunnerSignature } from '../types'

export const runSyslogRetention: TaskRunnerSignature = async (
  services,
  { syslogRetentionDays }
) => {
  const now = new Date()
  now.setDate(now.getDate() - syslogRetentionDays)

  const result = await services.syslog?.prune({
    to: now.toISOString(),
  })
  return `${result} logentry(s) removed`
}
