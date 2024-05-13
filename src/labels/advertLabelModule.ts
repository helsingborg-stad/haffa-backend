import HttpStatusCodes from 'http-status-codes'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import type { Services } from '../types'
import { makeGuestUser, normalizeRoles } from '../login'
import type { Advert } from '../adverts/types'
import { optionsAdapter } from '../options'
import { createLabelFooter, transformLabelOptions } from './mappers'
import { requireHaffaUser } from '../login/require-haffa-user'

export const advertLabelModule =
  ({ adverts, settings, userMapper }: Services): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      advertLabels: requireHaffaUser(userMapper, async (ctx, next) => {
        const { advertIds }: { advertIds: string } = ctx.params

        if (!normalizeRoles(ctx.user?.roles).canEditOwnAdverts) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }

        // Split advert ids
        const advertIdList = advertIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length === 36)
          .filter((id, idx, arr) => arr.indexOf(id) === idx)

        // Retreive adverts
        const advertList = await Promise.all(
          advertIdList.map(advertId =>
            adverts.getAdvert(makeGuestUser(), advertId)
          )
        ).then(items => items.filter(value => value) as Advert[])

        // Invalid adverts
        if (advertList.length === 0) {
          return next()
        }

        // Get display options
        const labelOptions = await optionsAdapter(settings)
          .getOptions('label')
          .then(options => transformLabelOptions(options))

        // Set response type
        ctx.response.type = 'application/pdf'
        ctx.res.setHeader(
          'Content-disposition',
          'inline; filename="labels.pdf"'
        )
        ctx.status = 200
        // Create document
        const doc = new PDFDocument({
          size: [250, 250],
          autoFirstPage: false,
        })
        doc.fontSize(18)
        doc.pipe(ctx.res)

        await Promise.all(
          advertList.map(async advert =>
            QRCode.toBuffer(
              `https://${ctx.host}/advert/${advert.id}?intent=advert&s=${btoa(
                advert.id
              )}`,
              {
                margin: 0,
                width: 170,
              }
            ).then(qr => {
              doc
                .addPage()
                .text(labelOptions.headline, 10, 25, {
                  align: 'center',
                  height: 0,
                  width: 230,
                  lineBreak: false,
                })
                .image(qr, 40, 45, {
                  width: 170,
                })
                .text(createLabelFooter(labelOptions, advert), 10, 220, {
                  align: 'center',
                  width: 230,
                  height: 0,
                  lineBreak: false,
                })
            })
          )
        )
        doc.end()
        // eslint-disable-next-line no-promise-executor-return
        return new Promise(resolve => ctx.res.on('finish', resolve))
      }),
    })
