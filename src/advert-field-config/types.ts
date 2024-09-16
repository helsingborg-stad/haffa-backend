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
  'lendingPeriod',
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
  'notes',
  'tags',
  'organization',
  'name',
  'adress',
  'zipCode',
  'city',
  'email',
  'phone',
  'country',
  'stockItem',
]

export const FieldLabels: Record<FieldName, string> = {
  title: 'Titel',
  description: 'Beskrivning',
  quantity: 'Antal',
  lendingPeriod: 'Utlåningsperiod',
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
  notes: 'Egna noteringar',
  tags: 'Taggar',
  organization: 'Organisation',
  name: 'Namn',
  adress: 'Adress',
  zipCode: 'Postnummer',
  city: 'Stad',
  email: 'Email',
  phone: 'Telefon',
  country: 'Land',
  stockItem: 'Lagervara',
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
