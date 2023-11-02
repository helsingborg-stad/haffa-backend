import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import { eventsGqlSchema } from './events.gql.schema'

export const createEventsGqlModule = ({
  eventLog,
}: Pick<Services, 'eventLog'>): GraphQLModule => ({
  schema: eventsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      events: async ({ ctx, args: { from, to } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canSeeSystemStatistics) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return eventLog.getEvents({
          from: from ? new Date(from) : null,
          to: to ? new Date(to) : null,
        })
      },
    },
  },
})
