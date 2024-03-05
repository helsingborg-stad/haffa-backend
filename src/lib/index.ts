import { mapValues } from './map-values'
import { obfuscate } from './obfuscate'
import { sortBy } from './sort-by'
import { toLookup } from './to-lookup'
import { toMap } from './to-map'
import { mapTree } from './tree'
import { uniqueBy } from './unique-by'
import { waitForAll } from './wait'

export {
  mapTree,
  mapValues,
  toLookup,
  toMap,
  obfuscate,
  waitForAll,
  uniqueBy,
  sortBy,
}

export const echo = <T>(value: T): T => {
  console.log(JSON.stringify(value, null, 2))
  return value
}
