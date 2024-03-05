import { objectStream } from '.'
import { streamToArray } from './stream-to-array'

describe('objectStream', () => {
  it('works', async () => {
    const objects = await streamToArray(
      objectStream(
        async () => [1, 2, 3],
        async value => ({ value })
      )
    )
    expect(objects).toMatchObject([
      {
        value: 1,
      },
      {
        value: 2,
      },
      {
        value: 3,
      },
    ])
  })
})
