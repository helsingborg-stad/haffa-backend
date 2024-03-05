import { Transform } from 'stream'
import type { Func } from '../types'

export const jsonStream: Func<
  {
    prefix: string
    separator: string
    terminator: string
  },
  Transform
> = ({ prefix, separator, terminator }) => {
  let headerSent = false
  const headerIfMissingOr = (or: string) => {
    if (headerSent) {
      return or
    }
    headerSent = true
    return prefix
  }

  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        callback(
          null,
          headerIfMissingOr(separator) + Buffer.from(JSON.stringify(chunk))
        )
      } catch (err) {
        callback(new Error('stringify failed'), null)
      }
    },
    flush(callback) {
      callback(null, Buffer.from(headerIfMissingOr('') + terminator))
    },
  })
}
