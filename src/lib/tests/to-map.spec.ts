import { toMap } from '..'

describe('toMap', () => {
  it('maps lists to objects', () => {
    expect(
      toMap(
        [1, 2, 3],
        i => `k${i}`,
        i => `v${i}`
      )
    ).toMatchObject({
      k1: 'v1',
      k2: 'v2',
      k3: 'v3',
    })
  })
})
