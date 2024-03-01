import { jsonStream, objectStream, streamToBuffer } from '.'

describe('jsonStream', () => {
  it('works', async () => {
    const buffer = await streamToBuffer(
      objectStream(
        async () => [1, 2, 3, 4, 5].map(n => ({ value: n })),
        async o => o
      ).pipe(
        jsonStream({
          prefix: '[',
          separator: ',',
          terminator: ']',
        })
      )
    )
    const json = JSON.parse(buffer.toString())
    expect(json).toMatchObject([1, 2, 3, 4, 5].map(n => ({ value: n })))
  })
})
