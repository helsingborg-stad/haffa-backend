import type {
  ApplicationContext,
  ApplicationModule,
} from '@helsingborg-stad/gdi-api-node'
import xlsx from 'xlsx'
import type { EventLogService } from '../types'
import {
  requireHaffaUser,
  requireHaffaUserRole,
} from '../../login/require-haffa-user'
import type { Services } from '../../types'

export const downloadEventsModule =
  ({
    eventLog,
    userMapper,
  }: Pick<Services, 'eventLog' | 'userMapper'>): ApplicationModule =>
  ({ registerKoaApi }: ApplicationContext) =>
    registerKoaApi({
      eventsAsXlsx: requireHaffaUserRole(
        userMapper,
        user => user.roles?.canRunSystemJobs || false,
        async ctx => {
          const {
            query: { from, to },
          } = ctx

          const makeDate = (d: any): Date => new Date((d || '').toString())

          const rows: any[][] = [
            ['Tid', 'Händelse', 'Antal', 'Organisation', 'Kategori', 'CO2'],
          ]
          await eventLog.enumerate(
            {
              from: makeDate(from),
              to: makeDate(to),
            },
            async e => {
              rows.push([
                e.at,
                e.event,
                e.quantity || 0,
                e.organization,
                e.category,
                e.co2kg,
              ])
              return true
            }
          )
          const sheet = xlsx.utils.aoa_to_sheet(rows)
          const book = xlsx.utils.book_new()
          xlsx.utils.book_append_sheet(book, sheet, 'Händelser')

          ctx.type = 'application/vnd.ms-excel'
          ctx.set('content-disposition', 'attachment; filename="events.xlsx"')
          const buffer = xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })
          ctx.body = buffer
        }
      ),
    })
