import sharp from 'sharp'
import mime from 'mime-types'
import type { Readable } from 'stream'
import { splitBase64DataUri } from './file-utils'
import type { Func } from '../../lib/types'
import { streamToBuffer } from '../../lib/streams'

export async function tryConvertStreamToDataUri(
  stream: Readable
): Promise<string | null> {
  if (stream) {
    const buffer = await streamToBuffer(stream)
    return `data:image/webp;base64,${buffer.toString('base64')}`
  }
  return null
}

export const tryConvertUrlToDataUrlForLocalUrlsHelper: Func<
  {
    url: string
    baseUrl: string
    mimeType: string
    getData: (id: string) => Promise<Readable | Buffer>
  },
  Promise<string | null>
> = async ({ url, baseUrl, mimeType, getData }) => {
  const id =
    baseUrl &&
    url.startsWith(`${baseUrl}/`) &&
    url.substring(baseUrl.length + 1)
  if (!id) {
    return null
  }
  const streamOrBuffer = await getData(id)
  if (!streamOrBuffer) {
    return null
  }
  const buffer = Buffer.isBuffer(streamOrBuffer)
    ? streamOrBuffer
    : await streamToBuffer(streamOrBuffer)

  return buffer ? `data:${mimeType};base64,${buffer.toString('base64')}` : null
}

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
