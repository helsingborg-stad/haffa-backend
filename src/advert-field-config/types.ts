import type {
  AdvertContact,
  AdvertInput,
  AdvertLocation,
} from '../adverts/types'

type Fields = keyof (Omit<
  AdvertInput,
  'images' | 'externalId' | 'location' | 'contact'
> &
  AdvertContact &
  AdvertLocation)

export const ConfigurableFields: Array<Fields> = [
  'title',
  'description',
  'quantity',
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
  'tags',
  'organization',
  'adress',
  'zipCode',
  'city',
  'email',
  'phone',
]

export interface FieldConfig {
  name: Fields
  visible: boolean
  mandatory: boolean
}
export type AdvertFieldConfig = FieldConfig[]
