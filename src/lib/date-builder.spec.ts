import { dateBuilder } from './date-builder'

describe('date-builder', () => {
  it('addDays', () => {
    expect(dateBuilder('2024-06-10').addDays(0).toDate()).toStrictEqual(
      new Date('2024-06-10')
    )
    expect(dateBuilder('2024-06-10').addDays(14).toDate()).toStrictEqual(
      new Date('2024-06-24')
    )
    expect(dateBuilder('2024-06-10').addDays(364).toDate()).toStrictEqual(
      new Date('2025-06-09')
    )
    expect(dateBuilder('2024-06-10').addDays(-364).toDate()).toStrictEqual(
      new Date('2023-06-12')
    )
  })
})
