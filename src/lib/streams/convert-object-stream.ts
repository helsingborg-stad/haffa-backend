import { Transform } from 'stream'

export const convertObjectStream = <S, T>(
  convert: (item: S) => Promise<T>
): Transform =>
  new Transform({
    objectMode: true,
    transform(item, encoding, callback) {
      convert(item as S)
        .then(converted => callback(null, converted))
        .catch(error => callback(error, null))
    },
  })
