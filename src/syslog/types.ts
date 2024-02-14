export enum Severity {
  error,
  warning,
  info,
}
export interface SyslogFilter {
  from?: string
  to?: string
  severity?: Severity
  type?: string
  limit?: number
  skip?: number
}
export interface SyslogEntry extends SyslogUserData {
  id: string
  at: string
}

export interface SyslogUserData {
  by: string
  severity: Severity
  type: string
  message: string
  data?: Record<string, any>
}

export interface SyslogService {
  write: (data: SyslogUserData) => Promise<SyslogEntry>
  read: (filter: SyslogFilter) => Promise<SyslogEntry[]>
  prune: (filter: SyslogFilter) => Promise<number>
}
