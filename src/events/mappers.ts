import type { LogEventFigures } from './types'

export const normalizeEventFigures = (
  figures?: Partial<LogEventFigures>
): LogEventFigures => ({
  co2Totals: 0,
  valueTotals: 0,
  collectTotals: 0,
  ...figures,
})
