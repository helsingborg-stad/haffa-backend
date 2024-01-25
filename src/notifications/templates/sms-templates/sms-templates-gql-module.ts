import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import { smsTemplatesGqlSchema } from './sms-templates.gql.schema'
import type { Services } from '../../../types'
import { normalizeRoles } from '../../../login'
import { smsTemplateMapper } from './sms-template-mapper'

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
