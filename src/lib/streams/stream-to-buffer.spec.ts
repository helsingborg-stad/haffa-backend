import { objectStream, streamToBuffer } from '.'

describe('streamToBuffer', () => {
  it('works', async () => {
    const buffer = await streamToBuffer(
      objectStream(
        async () => ['abc', 'def', 'ghi'],
        async s => Buffer.from(s)
      )
    )
    expect(buffer.toString()).toBe('abcdefghi')
  })
})
