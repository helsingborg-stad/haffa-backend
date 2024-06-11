export interface DateBuilder {
  addDays: (days: number) => DateBuilder
  toDate: () => Date
  toISOString: () => string
}

const deriveDate = (d: Date, derive: (d: Date) => void): Date => {
  const d2 = new Date(d)
  derive(d2)
  return d2
}

export const dateBuilder = (at: string | Date): DateBuilder =>
  typeof at === 'string'
    ? dateBuilder(new Date(at))
    : {
        addDays: days =>
          dateBuilder(deriveDate(at, d => d.setDate(d.getDate() + days))),
        toDate: () => new Date(at),
        toISOString: () => at.toISOString(),
      }
