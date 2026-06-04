import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '../../../lib/gdi-api-node'
import { normalizeRoles } from '../../../login'
import type { Services } from '../../../types'
import { smsTemplateMapper } from './sms-template-mapper'
import { smsTemplatesGqlSchema } from './sms-templates.gql.schema'

export const createSmsTemplatesGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: smsTemplatesGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      smsTemplates: async ({ ctx }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canManageNotifications) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return smsTemplateMapper(settings).getSmsTemplates()
      },
    },
    Mutation: {
      previewSmsTemplates: async ({
        ctx,
        args: { input, jsonEncodedData },
      }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canManageNotifications) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return smsTemplateMapper(settings).previewTemplates(
          input,
          JSON.parse(jsonEncodedData)
        )
      },
      updateSmsTemplates: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canManageNotifications) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return smsTemplateMapper(settings).updateSmsTemplates(input)
      },
    },
  },
})
