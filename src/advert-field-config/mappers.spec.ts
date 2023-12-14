import { normalizeFieldConfig } from './mappers'
import type { FieldConfig } from './types'

it('should override default values with input', () => {
  const output = normalizeFieldConfig([
    { name: 'tags', visible: false, mandatory: true },
    { name: 'material', visible: false, mandatory: false },
    { name: 'width', visible: true, mandatory: true },
  ])
  expect(output).toEqual([
    { name: 'title', visible: true, mandatory: false },
    { name: 'description', visible: true, mandatory: false },
    { name: 'quantity', visible: true, mandatory: false },
    { name: 'unit', visible: true, mandatory: false },
    { name: 'width', visible: true, mandatory: true },
    { name: 'height', visible: true, mandatory: false },
    { name: 'depth', visible: true, mandatory: false },
    { name: 'weight', visible: true, mandatory: false },
    { name: 'size', visible: true, mandatory: false },
    { name: 'material', visible: false, mandatory: false },
    { name: 'condition', visible: true, mandatory: false },
    { name: 'usage', visible: true, mandatory: false },
    { name: 'category', visible: true, mandatory: false },
    { name: 'reference', visible: true, mandatory: false },
    { name: 'tags', visible: false, mandatory: true },
    { name: 'organization', visible: true, mandatory: false },
    { name: 'adress', visible: true, mandatory: false },
    { name: 'zipCode', visible: true, mandatory: false },
    { name: 'city', visible: true, mandatory: false },
    { name: 'email', visible: true, mandatory: false },
    { name: 'phone', visible: true, mandatory: false },
  ])
})

it('should handle null document', () => {
  const output = normalizeFieldConfig(null)
  expect(output).toEqual([
    { name: 'title', visible: true, mandatory: false },
    { name: 'description', visible: true, mandatory: false },
    { name: 'quantity', visible: true, mandatory: false },
    { name: 'unit', visible: true, mandatory: false },
    { name: 'width', visible: true, mandatory: false },
    { name: 'height', visible: true, mandatory: false },
    { name: 'depth', visible: true, mandatory: false },
    { name: 'weight', visible: true, mandatory: false },
    { name: 'size', visible: true, mandatory: false },
    { name: 'material', visible: true, mandatory: false },
    { name: 'condition', visible: true, mandatory: false },
    { name: 'usage', visible: true, mandatory: false },
    { name: 'category', visible: true, mandatory: false },
    { name: 'reference', visible: true, mandatory: false },
    { name: 'tags', visible: true, mandatory: false },
    { name: 'organization', visible: true, mandatory: false },
    { name: 'adress', visible: true, mandatory: false },
    { name: 'zipCode', visible: true, mandatory: false },
    { name: 'city', visible: true, mandatory: false },
    { name: 'email', visible: true, mandatory: false },
    { name: 'phone', visible: true, mandatory: false },
  ])
})

it('should remove unsupported keys', () => {
  const output = normalizeFieldConfig([
    { name: 'tags', visible: false, mandatory: true },
    { name: 'material', visible: false, mandatory: true },
    {
      name: 'BOGUS1',
      visible: false,
      mandatory: true,
    } as unknown as FieldConfig,
    { name: 'width', visible: false, mandatory: true },
    {
      name: 'BOGUS2',
      visible: false,
      mandatory: true,
    } as unknown as FieldConfig,
  ])
  expect(output).toEqual([
    { name: 'title', visible: true, mandatory: false },
    { name: 'description', visible: true, mandatory: false },
    { name: 'quantity', visible: true, mandatory: false },
    { name: 'unit', visible: true, mandatory: false },
    { name: 'width', visible: false, mandatory: true },
    { name: 'height', visible: true, mandatory: false },
    { name: 'depth', visible: true, mandatory: false },
    { name: 'weight', visible: true, mandatory: false },
    { name: 'size', visible: true, mandatory: false },
    { name: 'material', visible: false, mandatory: true },
    { name: 'condition', visible: true, mandatory: false },
    { name: 'usage', visible: true, mandatory: false },
    { name: 'category', visible: true, mandatory: false },
    { name: 'reference', visible: true, mandatory: false },
    { name: 'tags', visible: false, mandatory: true },
    { name: 'organization', visible: true, mandatory: false },
    { name: 'adress', visible: true, mandatory: false },
    { name: 'zipCode', visible: true, mandatory: false },
    { name: 'city', visible: true, mandatory: false },
    { name: 'email', visible: true, mandatory: false },
    { name: 'phone', visible: true, mandatory: false },
  ])
})
