import { normalizeFieldConfig } from './mappers'

const fieldConfig = {
  name: '',
  visible: true,
  mandatory: false,
  initial: '',
}

it('should override default values with input', () => {
  const output = normalizeFieldConfig([
    { ...fieldConfig, name: 'tags', visible: false, mandatory: true },
    { ...fieldConfig, name: 'material', visible: false },
    { ...fieldConfig, name: 'width', mandatory: true },
  ])
  expect(output).toEqual([
    { ...fieldConfig, name: 'title' },
    { ...fieldConfig, name: 'description' },
    { ...fieldConfig, name: 'quantity' },
    { ...fieldConfig, name: 'unit' },
    { ...fieldConfig, name: 'width', mandatory: true },
    { ...fieldConfig, name: 'height' },
    { ...fieldConfig, name: 'depth' },
    { ...fieldConfig, name: 'weight' },
    { ...fieldConfig, name: 'size' },
    { ...fieldConfig, name: 'material', visible: false },
    { ...fieldConfig, name: 'condition' },
    { ...fieldConfig, name: 'usage' },
    { ...fieldConfig, name: 'category' },
    { ...fieldConfig, name: 'reference' },
    { ...fieldConfig, name: 'tags', visible: false, mandatory: true },
    { ...fieldConfig, name: 'organization' },
    { ...fieldConfig, name: 'name' },
    { ...fieldConfig, name: 'adress' },
    { ...fieldConfig, name: 'zipCode' },
    { ...fieldConfig, name: 'city' },
    { ...fieldConfig, name: 'email' },
    { ...fieldConfig, name: 'phone' },
  ])
})

it('should handle null document', () => {
  const output = normalizeFieldConfig(null)
  expect(output).toEqual([
    { ...fieldConfig, name: 'title' },
    { ...fieldConfig, name: 'description' },
    { ...fieldConfig, name: 'quantity' },
    { ...fieldConfig, name: 'unit' },
    { ...fieldConfig, name: 'width' },
    { ...fieldConfig, name: 'height' },
    { ...fieldConfig, name: 'depth' },
    { ...fieldConfig, name: 'weight' },
    { ...fieldConfig, name: 'size' },
    { ...fieldConfig, name: 'material' },
    { ...fieldConfig, name: 'condition' },
    { ...fieldConfig, name: 'usage' },
    { ...fieldConfig, name: 'category' },
    { ...fieldConfig, name: 'reference' },
    { ...fieldConfig, name: 'tags' },
    { ...fieldConfig, name: 'organization' },
    { ...fieldConfig, name: 'name' },
    { ...fieldConfig, name: 'adress' },
    { ...fieldConfig, name: 'zipCode' },
    { ...fieldConfig, name: 'city' },
    { ...fieldConfig, name: 'email' },
    { ...fieldConfig, name: 'phone' },
  ])
})
