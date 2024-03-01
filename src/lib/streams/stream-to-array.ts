import type { Readable } from 'stream'

export const streamToArray = (stream: Readable) =>
  new Promise((resolve, reject) => {
    const result: any[] = []
    stream
      .on('data', data => result.push(data))
      .on('end', () => resolve(result))
      .on('error', e => reject(e))
  })
