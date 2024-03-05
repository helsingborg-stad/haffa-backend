import type { Transform } from 'stream'
import { PassThrough } from 'stream'
import { waitForAll } from '..'

/**
 * Create a readabale stream in objectmode consisting of each source item converted to another object
 * Handles backpressure - hence the complexity
 *
 * @param items
 * @param getObject
 * @returns
 */

export const objectStream = <S, T>(
  getItems: () => Promise<S[]>,
  convert: (item: S) => Promise<T | null>
): Transform => {
  const stream = new PassThrough({ objectMode: true })

  getItems()
    .then(items =>
      waitForAll(
        items,
        item =>
          new Promise((resolve, reject) => {
            convert(item)
              .then(result => {
                if (result === null) {
                  // skip this item, it is a signal that it couldnt be generated but should continue
                  resolve(null)
                }
                if (stream.push(result)) {
                  return resolve(result)
                }
                return stream.on('resume', () => {
                  stream.push(result)
                  return resolve(result)
                })
              })
              .catch(e => reject(stream.emit('error', e)))
          })
      )
    )
    .then(() => stream.push(null))
    .catch(e => stream.emit('error', e))

  return stream
}
