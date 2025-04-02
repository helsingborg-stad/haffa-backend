import type { EventSummaries } from './types'

export const normalizeEventSummaries = (
  summaries?: Partial<EventSummaries>
): EventSummaries => ({
  totalCo2: 0,
  totalValue: 0,
  totalCollects: 0,
  ...summaries,
})
