import { extension } from 'mime-types'
import * as uuid from 'uuid'

export function splitBase64DataUri(dataUri: string): {
  mimeType: string
  buffer: Buffer
} | null {
  const [, mimeType = null, content = null] =
    /^data:([^;]*);base64,(.+$)$/m.exec(dataUri || '') || []

  return mimeType && content
    ? {
        mimeType,
        buffer: Buffer.from(content, 'base64'),
      }
    : null
}

export function generateFileId(mimeType: string): string {
  const id = uuid.v4().split('-').join('')
  const ext = extension(mimeType)
  return ext ? `${id}.${ext}` : id
}
