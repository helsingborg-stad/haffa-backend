import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import { syslogGqlSchema } from './syslog.gql.schema'

export const createSyslogGqlModule = (services: Services): GraphQLModule => ({
  schema: syslogGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      syslog: async ({ ctx, args: { filter } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.syslog.read(filter)
      },
    },
    Mutation: {
      pruneSyslog: async ({ ctx, args: { filter } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.syslog.prune(filter)
      },
    },
  },
})
