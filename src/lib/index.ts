import { mapValues } from './map-values'
import { toLookup } from './to-lookup'
import { toMap } from './to-map'

export { mapValues, toLookup, toMap }

export const echo = <T>(value: T): T => {
  console.log(JSON.stringify(value, null, 2))
  return value
}
