import type { Advert, AdvertContact } from '../adverts/types'

export type Fields = Pick<
  Advert & AdvertContact,
  | 'description'
  | 'unit'
  | 'width'
  | 'height'
  | 'depth'
  | 'weight'
  | 'size'
  | 'material'
  | 'condition'
  | 'usage'
  | 'category'
  | 'reference'
  | 'organization'
  | 'tags'
>

export const ConfigurableFields: Array<keyof Fields> = [
  'description',
  'unit',
  'width',
  'height',
  'depth',
  'weight',
  'size',
  'material',
  'condition',
  'usage',
  'category',
  'reference',
  'organization',
  'tags',
]

export interface FieldConfig {
  name: keyof Fields
  visible: boolean
  mandatory: boolean
}
export type AdvertFieldConfig = FieldConfig[]
