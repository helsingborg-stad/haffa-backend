import { mapValues } from './map-values'
import { obfuscate } from './obfuscate'
import { toLookup } from './to-lookup'
import { toMap } from './to-map'

export { mapValues, toLookup, toMap, obfuscate }

export const echo = <T>(value: T): T => {
  console.log(JSON.stringify(value, null, 2))
  return value
}
