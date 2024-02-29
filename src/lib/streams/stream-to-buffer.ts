import type { Readable } from 'stream'
import { Writable } from 'stream'

export const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.pipe(
      new Writable({
        write(chunk, encoding, cb) {
          try {
            if (typeof chunk === 'string') {
              chunks.push(Buffer.from(chunk, 'utf-8'))
            } else if (chunk instanceof Buffer) {
              chunks.push(chunk)
            } else {
              const jsonData = JSON.stringify(chunk)
              chunks.push(Buffer.from(jsonData, 'utf-8'))
            }
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
