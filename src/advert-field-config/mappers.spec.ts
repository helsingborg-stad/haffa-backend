import { normalizeFieldConfig } from './mappers'

it('should override default values with input', () => {
  const output = normalizeFieldConfig([
    { name: 'tags', visible: false, mandatory: true },
    { name: 'material', visible: false, mandatory: false },
    { name: 'width', visible: true, mandatory: true },
  ])
  expect(output).toEqual([
    { name: 'description', visible: true, mandatory: false },
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
    { name: 'organization', visible: true, mandatory: false },
    { name: 'tags', visible: false, mandatory: true },
  ])
})

it('should handle null document', () => {
  const output = normalizeFieldConfig(null)
  expect(output).toEqual([
    { name: 'description', visible: true, mandatory: false },
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
    { name: 'organization', visible: true, mandatory: false },
    { name: 'tags', visible: true, mandatory: false },
  ])
})
