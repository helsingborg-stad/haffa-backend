import { generateFileId, splitBase64DataUri } from './file-utils'

describe('file-utils', () => {
  it('splits data uri into components', () => {
    const mockDataUri = 'data:application/x-test-type;base64,aGVsbG8gd29ybGQK'

    const result = splitBase64DataUri(mockDataUri)

    expect(result.mimeType).toBe('application/x-test-type')
    expect(result.dataBuffer).not.toBeNull()
    expect(result.dataBuffer?.toString('utf-8').trim()).toBe('hello world')
  })

  it('generates a file id', () => {
    const result = generateFileId('image/png')

    expect(result.endsWith('.png')).toBe(true)
  })
})
