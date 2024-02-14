import { sanitizeSyslogEntry, sanitizeSyslogFilter } from './mappers'
import { Severity } from './types'

describe('SyslogService', () => {
  it('should sanitize empty log entry', async () => {
    const entry = sanitizeSyslogEntry({})

    expect(entry.by).toBe('N/A')
    expect(entry.message).toBe('N/A')
    expect(entry.severity).toBe(Severity.info)
    expect(entry.type).toBe('N/A')
    expect(entry.id).toBeDefined()
    expect(entry.at).toBeDefined()
  })
  it('should sanitize empty filter', async () => {
    const filter = sanitizeSyslogFilter({})

    expect(filter.skip).toBe(0)
    expect(filter.limit).toBe(50)
  })
  it('should sanitize invalid filter values', async () => {
    const filter = sanitizeSyslogFilter({
      skip: -1,
      limit: -1,
    })

    expect(filter.skip).toBe(0)
    expect(filter.limit).toBe(50)
  })
})
