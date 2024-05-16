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
          'inline; filename="etiketter.pdf"'
        )
        ctx.status = 200

        const labelSize = 144 // 72 points/inch
        const margin = labelSize / 12
        const rowHeight = labelSize / 6
        const codeGap = 3
        const codeHeight = rowHeight * 4 - codeGap
        const codeCenter = labelSize / 2 - codeHeight / 2

        // Text Positioning
        const textOptions: PDFKit.Mixins.TextOptions = {
          align: 'center',
          width: Math.max(labelSize - margin * 2, 0),
          height: Math.max(rowHeight - margin, 0),
          lineBreak: false,
        }
        // Create document
        const doc = new PDFDocument({
          size: [labelSize, labelSize],
          autoFirstPage: false,
          margin,
        })
        doc.fontSize(textOptions.height ?? 0)
        doc.pipe(ctx.res)

        await Promise.all(
          advertList.map(async advert =>
            QRCode.toBuffer(
              `https://${ctx.host}/advert/${advert.id}?intent=advert&s=${btoa(
                advert.id
              )}`,
              {
                margin: 0,
                width: codeHeight * 2,
              }
            ).then(qr => {
              doc
                .addPage()
                .text(labelOptions.headline, margin, margin, textOptions)
                .image(qr, codeCenter, rowHeight, {
                  cover: [codeHeight, codeHeight],
                })
                .text(
                  createLabelFooter(labelOptions, advert),
                  margin,
                  5 * rowHeight,
                  textOptions
                )
            })
          )
        )
        doc.end()
        // eslint-disable-next-line no-promise-executor-return
        return new Promise(resolve => ctx.res.on('finish', resolve))
      }),
    })
