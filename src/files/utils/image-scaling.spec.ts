import sharp from 'sharp'
import { tryConvertDataUriToImageBuffer } from '.'

const imageWithDimension = (width: number, height: number) =>
  sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
  })
const jpg = (width: number, height: number) =>
  imageWithDimension(width, height).jpeg().toBuffer()
const png = (width: number, height: number) =>
  imageWithDimension(width, height).png().toBuffer()
const webp = (width: number, height: number) =>
  imageWithDimension(width, height).webp().toBuffer()

const BOX_SIZE = 1920

describe('tryConvertDataUriToImageBuffer scales large images', () => {
  interface Dimensions {
    width: number
    height: number
  }
  const dim = (width: number, height: number): Dimensions => ({ width, height })

  type TestFormat = 'jpg' | 'png' | 'webp'
  const TestFormatFactories: Record<TestFormat, typeof jpg> = {
    jpg,
    png,
    webp,
  }

  const createTestImage = (format: TestFormat, { width, height }: Dimensions) =>
    TestFormatFactories[format](width, height)

  const makeTestCases = (
    format: TestFormat
  ): [TestFormat, Dimensions, Dimensions][] => [
    [format, dim(1600, 1200), dim(1600, 1200)],
    [format, dim(1200, 1600), dim(1200, 1600)],

    [format, dim(2 * BOX_SIZE, BOX_SIZE), dim(BOX_SIZE, BOX_SIZE / 2)],
    [format, dim(BOX_SIZE, 2 * BOX_SIZE), dim(BOX_SIZE / 2, BOX_SIZE)],
  ]

  const scalingTestCases: [TestFormat, Dimensions, Dimensions][] = [
    ...makeTestCases('jpg'),
    ...makeTestCases('png'),
    ...makeTestCases('webp'),
  ]
  it.each(scalingTestCases)(
    '%s (%j) => %j',
    async (format: TestFormat, initial: Dimensions, expected: Dimensions) => {
      const buffer = await createTestImage(format, initial)
      const uri = `data:image;base64,${buffer!.toString('base64')}`

      const converted = await tryConvertDataUriToImageBuffer(uri)
      expect(converted).not.toBeNull()
      expect(converted!.buffer).not.toBeNull()
      expect(converted!.mimeType).toBe('image/webp')

      const { width, height } = await sharp(converted!.buffer).metadata()
      expect(width).toBe(expected.width)
      expect(height).toBe(expected.height)
    }
  )
})
