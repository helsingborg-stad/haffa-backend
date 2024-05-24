import { exceptValues } from './except-values'

describe('exceptValues', () => {
  it('just works', () => {
    expect(
      [1, 2, 3, 4, 5, 6].filter(exceptValues([1, 2, 3, 100, 200], v => v))
    ).toMatchObject([4, 5, 6])
  })
})
