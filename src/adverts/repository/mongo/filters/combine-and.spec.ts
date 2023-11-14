import { combineAnd } from './filter-utils'

const range = (n: number): any[] => [...new Array(n)]

describe('combineAnd', () => {
  it('combineAnd() => null', () => expect(combineAnd()).toBeNull())

  it('combineAnd(null, false, undefined) => null', () =>
    expect(combineAnd(null, false, undefined)).toBeNull())

  it('combineAnd(single) => single', () =>
    expect(combineAnd({ f: 'v' })).toMatchObject({ f: 'v' }))

  it('combineAnd(first, second) => {$and: [first, second]}', () =>
    expect(combineAnd({ f: 'v' }, { s: 'u' })).toMatchObject({
      $and: [{ f: 'v' }, { s: 'u' }],
    }))

  it('combineAnd(many) => {$and: many}', () => {
    for (let i = 3; i < 10; i += 1) {
      const filters = range(i).map((_v, index) => ({
        [`f${index}`]: index,
      }))
      expect(combineAnd(...filters)).toMatchObject({ $and: filters })
    }
  })
})
