import sharp from 'sharp'
import mime from 'mime-types'
import { splitBase64DataUri } from './file-utils'

export async function tryConvertDataUriToImageBuffer(dataUri: string): Promise<{
  buffer: Buffer
  mimeType: string
} | null> {
  const { buffer } = splitBase64DataUri(dataUri) || { buffer: null }

  if (!buffer) {
    return null
  }

  return sharp(buffer)
    .resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate() // to preserve EXIF rotation
    .webp()
    .toBuffer()
    .then(webp => ({
      buffer: webp,
      mimeType: mime.lookup('webp') || 'image/webp',
    }))
    .catch(() => null)
}
