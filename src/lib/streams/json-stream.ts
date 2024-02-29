import { Transform } from 'stream'
import type { Func } from '../types'

export const jsonStream: Func<
  {
    prefix: string
    separator: string
    terminator: string
  },
  Transform
> = ({ prefix, separator, terminator }) =>
  new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const self = this as any
        this.push(Buffer.from(self.json_header_emitted ? separator : prefix))
        self.json_header_emitted = true
        callback(null, Buffer.from(JSON.stringify(chunk)))
      } catch (err) {
        callback(new Error('stringify failed'), null)
      }
    },
    flush(callback) {
      callback(null, Buffer.from(terminator))
    },
  })
