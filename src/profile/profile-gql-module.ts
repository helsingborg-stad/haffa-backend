import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { profileGqlSchema } from './profile.gql.schema'
import type { Services } from '../types'

export const createProfileGqlModule = ({
  profiles,
}: Pick<Services, 'profiles'>): GraphQLModule => ({
  schema: profileGqlSchema,
  resolvers: {
    Query: {
      profile: async ({ ctx }) => {
        const { user } = ctx
        if (user.guest) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return profiles.getProfile(user)
      },
    },
    Mutation: {
      updateProfile: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (user.guest) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return profiles.updateProfile(user, input)
      },
    },
  },
})
