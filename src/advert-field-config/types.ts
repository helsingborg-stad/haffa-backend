import type {
  AdvertContact,
  AdvertInput,
  AdvertLocation,
} from '../adverts/types'

export type FieldName = keyof (Omit<
  AdvertInput,
  'images' | 'externalId' | 'location' | 'contact'
> &
  AdvertContact &
  AdvertLocation)

export const ConfigurableFields: Array<FieldName> = [
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
  'name',
  'adress',
  'zipCode',
  'city',
  'email',
  'phone',
  'country',
]

export const FieldLabels: Record<FieldName, string> = {
  title: 'Titel',
  description: 'Beskrivning',
  quantity: 'Antal',
  unit: 'Enhet',
  width: 'Bredd',
  height: 'Höjd',
  depth: 'Djup',
  weight: 'Vikt',
  size: 'Storlek',
  material: 'Material',
  condition: 'Skick',
  usage: 'Användningsområde',
  category: 'Kategori',
  reference: 'Egen referens',
  tags: 'Taggar',
  organization: 'Organisation',
  name: 'Namn',
  adress: 'Adress',
  zipCode: 'Postnummer',
  city: 'Stad',
  email: 'Email',
  phone: 'Telefon',
  country: 'Land',
}

export interface FieldConfig {
  name: FieldName
  label: string
  visible: boolean
  mandatory: boolean
  initial: string
  adornment: string
}
export type AdvertFieldConfig = FieldConfig[]
