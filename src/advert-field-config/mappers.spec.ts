import { normalizeFieldConfig } from './mappers'
import type { FieldName } from './types'
import { FieldLabels } from './types'

const getFieldConfig = (name: FieldName) => ({
  name,
  label: FieldLabels[name],
  visible: true,
  mandatory: false,
  initial: '',
  adornment: '',
})

it('should override default values with input', () => {
  const output = normalizeFieldConfig([
    { ...getFieldConfig('tags'), visible: false, mandatory: true },
    { ...getFieldConfig('material'), visible: false },
    { ...getFieldConfig('width'), mandatory: true },
  ])
  expect(output).toEqual([
    { ...getFieldConfig('title') },
    { ...getFieldConfig('description') },
    { ...getFieldConfig('quantity') },
    { ...getFieldConfig('unit') },
    { ...getFieldConfig('width'), mandatory: true },
    { ...getFieldConfig('height') },
    { ...getFieldConfig('depth') },
    { ...getFieldConfig('weight') },
    { ...getFieldConfig('size') },
    { ...getFieldConfig('material'), visible: false },
    { ...getFieldConfig('condition') },
    { ...getFieldConfig('usage') },
    { ...getFieldConfig('category') },
    { ...getFieldConfig('reference') },
    { ...getFieldConfig('tags'), visible: false, mandatory: true },
    { ...getFieldConfig('organization') },
    { ...getFieldConfig('name') },
    { ...getFieldConfig('adress') },
    { ...getFieldConfig('zipCode') },
    { ...getFieldConfig('city') },
    { ...getFieldConfig('email') },
    { ...getFieldConfig('phone') },
    { ...getFieldConfig('country') },
  ])
})

it('should handle null document', () => {
  const output = normalizeFieldConfig(null)
  expect(output).toEqual([
    { ...getFieldConfig('title') },
    { ...getFieldConfig('description') },
    { ...getFieldConfig('quantity') },
    { ...getFieldConfig('unit') },
    { ...getFieldConfig('width') },
    { ...getFieldConfig('height') },
    { ...getFieldConfig('depth') },
    { ...getFieldConfig('weight') },
    { ...getFieldConfig('size') },
    { ...getFieldConfig('material') },
    { ...getFieldConfig('condition') },
    { ...getFieldConfig('usage') },
    { ...getFieldConfig('category') },
    { ...getFieldConfig('reference') },
    { ...getFieldConfig('tags') },
    { ...getFieldConfig('organization') },
    { ...getFieldConfig('name') },
    { ...getFieldConfig('adress') },
    { ...getFieldConfig('zipCode') },
    { ...getFieldConfig('city') },
    { ...getFieldConfig('email') },
    { ...getFieldConfig('phone') },
    { ...getFieldConfig('country') },
  ])
})
