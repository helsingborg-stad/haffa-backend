import { mapValues } from '..'

describe('mapValues', () => {
  it('maps property values', () => {
    expect(
      mapValues(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        v => v * 3
      )
    ).toMatchObject({
      a: 3,
      b: 6,
      c: 9,
    })
  })
})
