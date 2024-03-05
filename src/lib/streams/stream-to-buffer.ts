import type { Readable } from 'stream'
import { Writable } from 'stream'

export const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.pipe(
      new Writable({
        write(chunk, encoding, cb) {
          try {
            chunks.push(
              Buffer.isBuffer(chunk)
                ? chunk
                : Buffer.from(chunk.toString(), 'utf-8')
            )
            cb()
          } catch (e) {
            cb(new Error())
            reject(e)
          }
        },
        final(cb) {
          try {
            resolve(Buffer.concat(chunks))
            cb()
          } catch {
            cb(new Error())
          }
        },
      })
    )
  })
