import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { subscriptionsGqlSchema } from './subscriptions.gql.schema'
import { normalizeRoles } from '../login'
import type { Services } from '../types'

export const createSubscriptionsGqlModule = ({
  subscriptions,
}: Pick<Services, 'subscriptions'>): GraphQLModule => ({
  schema: subscriptionsGqlSchema,
  resolvers: {
    Query: {
      advertSubscriptions: async ({ ctx: { user } }) =>
        subscriptions.getAdvertSubscriptions(user),
    },
    Mutation: {
      addAdvertSubscription: async ({ ctx, args: { filter } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canSubscribe) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return subscriptions.addAdvertSubscription(user, filter)
      },
      removeAdvertSubscription: async ({ ctx, args: { subscriptionId } }) => {
        const { user } = ctx
        // if (!normalizeRoles(user?.roles).canSubscribe) {
        //  ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        // }
        return subscriptions.removeAdvertSubscription(user, subscriptionId)
      },
    },
  },
})
