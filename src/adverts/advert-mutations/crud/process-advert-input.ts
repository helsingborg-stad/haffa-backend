// Images uploaded ad dataurls are converted to images in configured storage and

import type { FilesService } from '../../../files/types'
import type { AdvertInput } from '../../types'

// a new url is returned
export const processAdvertInput = async (
  input: AdvertInput,
  files: FilesService
): Promise<AdvertInput> => ({
  ...input,
  images: await Promise.all(
    input.images
      ?.filter(v => v)
      .filter(({ url }) => url)
      .map(image =>
        files.tryConvertDataUrlToUrl(image.url).then(url => ({
          ...image,
          url: url || image.url,
        }))
      ) ?? []
  ),
})
