import type { EventFigures } from './types'

export const normalizeEventFigures = (
  figures?: Partial<EventFigures>
): EventFigures => ({
  totalCo2: 0,
  totalValue: 0,
  totalCollects: 0,
  ...figures,
})
