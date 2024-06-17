import type { Services } from '../types'
import { makeGuestUser } from '../login'
import { optionsAdapter } from '../options'
import type { ApplicationModule } from '../lib/gdi-api-node'

export const socialPreviewModule =
  ({ adverts, settings }: Services): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      advertSocialPreview: async (ctx, next) => {
        const {
          params: { advertId },
        } = ctx
        const advert = await adverts.getAdvert(makeGuestUser(), advertId)
        if (!advert) {
          return next()
        }
        const allowSocialMediaPreview = await optionsAdapter(settings)
          .getOptions('branding-html')
          .then(options =>
            options.some(
              ({ key, value }) => key === 'allowSocialMediaPreview' && value
            )
          )

        if (!allowSocialMediaPreview) {
          return next()
        }

        ctx.body = {
          title: advert.title,
          description: advert.description,
          imageUrl: advert.images.map(({ url }) => url)[0] || undefined,
        }
        return 0
      },
    })
