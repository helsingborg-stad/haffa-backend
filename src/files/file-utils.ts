import * as uuid from 'uuid'
import { extension } from 'mime-types'

export function splitBase64DataUri(dataUri: string): {
  mimeType: string | null
  dataBuffer: Buffer | null
} {
  const [, mimeType = null, content = null] =
    /^data:([^;]*);base64,(.+$)$/m.exec(dataUri) || []

  return {
    mimeType,
    dataBuffer: content ? Buffer.from(content, 'base64') : null,
  }
}

export function generateFileId(mimeType: string): string {
  const id = uuid.v4().split('-').join('')
  const ext = extension(mimeType)
  return ext ? `${id}.${ext}` : id
}
