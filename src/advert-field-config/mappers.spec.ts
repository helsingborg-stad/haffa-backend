import { getFieldConfig, normalizeFieldConfig } from './mappers'

it('should override default values with input', () => {
  const output = normalizeFieldConfig([
    { ...getFieldConfig('tags'), visible: false, mandatory: true },
    { ...getFieldConfig('material'), visible: false },
    { ...getFieldConfig('width'), mandatory: true },
    { ...getFieldConfig('weight'), label: 'dummy' }, // Retain labels
    { ...getFieldConfig('phone'), adornment: 'dummy' }, // Retain adornment
  ])
  expect(output).toEqual([
    { ...getFieldConfig('title') },
    { ...getFieldConfig('description') },
    { ...getFieldConfig('quantity') },
    { ...getFieldConfig('lendingPeriod') },
    { ...getFieldConfig('unit') },
    { ...getFieldConfig('width'), mandatory: true },
    { ...getFieldConfig('height') },
    { ...getFieldConfig('depth') },
    { ...getFieldConfig('weight'), label: 'dummy' },
    { ...getFieldConfig('size') },
    { ...getFieldConfig('material'), visible: false },
    { ...getFieldConfig('condition') },
    { ...getFieldConfig('usage') },
    { ...getFieldConfig('category') },
    { ...getFieldConfig('reference') },
    { ...getFieldConfig('notes') },
    { ...getFieldConfig('tags'), visible: false, mandatory: true },
    { ...getFieldConfig('organization') },
    { ...getFieldConfig('name') },
    { ...getFieldConfig('adress') },
    { ...getFieldConfig('zipCode') },
    { ...getFieldConfig('city') },
    { ...getFieldConfig('email') },
    { ...getFieldConfig('phone'), adornment: 'dummy' },
    { ...getFieldConfig('country') },
    { ...getFieldConfig('place') },
  ])
})

it('should handle null document', () => {
  const output = normalizeFieldConfig(null)
  expect(output).toEqual([
    { ...getFieldConfig('title') },
    { ...getFieldConfig('description') },
    { ...getFieldConfig('quantity') },
    { ...getFieldConfig('lendingPeriod') },
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
    { ...getFieldConfig('notes') },
    { ...getFieldConfig('tags') },
    { ...getFieldConfig('organization') },
    { ...getFieldConfig('name') },
    { ...getFieldConfig('adress') },
    { ...getFieldConfig('zipCode') },
    { ...getFieldConfig('city') },
    { ...getFieldConfig('email') },
    { ...getFieldConfig('phone') },
    { ...getFieldConfig('country') },
    { ...getFieldConfig('place') },
  ])
})

it('should remove duplicates (Keep last)', () => {
  const output = normalizeFieldConfig([
    getFieldConfig('name'),
    { ...getFieldConfig('name'), visible: false },
  ])
  expect(output).toEqual([
    { ...getFieldConfig('title') },
    { ...getFieldConfig('description') },
    { ...getFieldConfig('quantity') },
    { ...getFieldConfig('lendingPeriod') },
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
    { ...getFieldConfig('notes') },
    { ...getFieldConfig('tags') },
    { ...getFieldConfig('organization') },
    { ...getFieldConfig('name'), visible: false },
    { ...getFieldConfig('adress') },
    { ...getFieldConfig('zipCode') },
    { ...getFieldConfig('city') },
    { ...getFieldConfig('email') },
    { ...getFieldConfig('phone') },
    { ...getFieldConfig('country') },
    { ...getFieldConfig('place') },
  ])
})

it('should provide labels', () => {
  const output = normalizeFieldConfig(null)

  expect(output).toHaveLength(
    output.filter(
      field => typeof field.label === 'string' && field.label.length > 0
    ).length
  )
})
