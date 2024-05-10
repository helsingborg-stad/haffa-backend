import type { LabelOptions } from './types'
import type { Option } from '../options/types'
import type { Advert } from '../adverts/types'

export const getDefaultLabelOptions = (): LabelOptions => ({
  headline: 'HAFFA',
  displayReference: 'true',
  displayTitle: 'true',
})

export const transformLabelOptions = (options: Option[]): LabelOptions =>
  options.reduce<LabelOptions>(
    (p, c) => ({
      ...p,
      [c.key]: c.value,
    }),
    getDefaultLabelOptions()
  )

export const createLabelFooter = (
  options: LabelOptions,
  advert: Advert
): string =>
  [
    options.displayReference === 'true' ? advert.reference : undefined,
    options.displayTitle === 'true' ? advert.title : undefined,
  ]
    .filter(s => s)
    .map(s => (s || '').trim())
    .join(' - ')
