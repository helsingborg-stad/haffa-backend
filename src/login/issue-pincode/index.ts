import { randomInt } from 'crypto'
import type { IssuePincode } from './types'

const randomDigits = (n: number) =>
  [...Array(n)]
    .map((_, index) => (index === 0 ? randomInt(1, 10) : randomInt(0, 10)))
    .join('')

export const createIssuePincode =
  (fixedCode?: string): IssuePincode =>
  () =>
    fixedCode || randomDigits(6)
