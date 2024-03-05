import { convertObjectStream, objectStream, streamToArray } from '.'

describe('convertObjectStream', () => {
  it('works', async () => {
    interface Value {
      value: number
    }
    const objects = await streamToArray(
      objectStream<number, Value>(
        async () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        async n => ({ value: n })
      ).pipe(convertObjectStream<Value, number>(async ({ value }) => value * 2))
    )
    expect(objects).toMatchObject([2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
  })
})
