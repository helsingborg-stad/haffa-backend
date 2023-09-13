import { generateFileId, splitBase64DataUri } from './file-utils'

describe('splitBase64DataUri', () => {
  it('splits data uri into components', () => {
    const mockDataUri = 'data:application/x-test-type;base64,aGVsbG8gd29ybGQK'

    const { mimeType, buffer } = splitBase64DataUri(mockDataUri) || {
      mimeType: null,
      buffer: null,
    }

    expect(mimeType).toBe('application/x-test-type')
    expect(buffer).not.toBeNull()
    expect(buffer?.toString('utf-8').trim()).toBe('hello world')
  })

  it('null => null', () => {
    expect(splitBase64DataUri(null as unknown as string)).toBeNull()
  })
  it('"" => null', () => {
    expect(splitBase64DataUri('')).toBeNull()
  })

  it('bogus => null', () => {
    expect(splitBase64DataUri('bogus')).toBeNull()
  })
})
describe('file-utils', () => {
  /*
  it('splits data uri into components', () => {
    const mockDataUri = 'data:application/x-test-type;base64,aGVsbG8gd29ybGQK'

    const result = splitBase64DataUri(mockDataUri)

    expect(result.mimeType).toBe('application/x-test-type')
    expect(result.dataBuffer).not.toBeNull()
    expect(result.dataBuffer?.toString('utf-8').trim()).toBe('hello world')
  })
*/
  it('generates a file id', () => {
    const result = generateFileId('image/png')

    expect(result.endsWith('.png')).toBe(true)
  })
})
