import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { optionsGqlSchema } from './options.gql.schema'
import { normalizeRoles } from '../login'
import { optionsAdapter } from './options-adapter'

export const createOptionsGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: optionsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      options: async ({ ctx, args: { name } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return optionsAdapter(settings).getOptions(name)
      },
    },
    Mutation: {
      updateOptions: async ({ ctx, args: { input, name } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return optionsAdapter(settings).updateOptions(name, input)
      },
    },
  },
})
