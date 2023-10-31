import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { profileGqlSchema } from './profile.gql.schema'
import type { Services } from '../types'

export const createProfileGqlModule = ({
  profiles,
}: Pick<Services, 'profiles'>): GraphQLModule => ({
  schema: profileGqlSchema,
  resolvers: {
    Query: {
      profile: async ({ ctx: { user } }) => profiles.getProfile(user),
    },
    Mutation: {
      updateProfile: async ({ ctx: { user }, args: { input } }) =>
        profiles.updateProfile(user, input),
    },
  },
})
