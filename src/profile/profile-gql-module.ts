import { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { ProfileRepository } from './types'
import { profileGqlSchema } from './profile.gql.schema'

export const createProfileGqlModule = (profiles: ProfileRepository): GraphQLModule => ({
	schema: profileGqlSchema,
	resolvers: {
		Query: {
			profile: async ({ ctx: { user } }) => profiles.getProfile(user),
		},
		Mutation: {
			updateProfile: async ({ ctx: { user }, args: { input } }) => profiles.updateProfile(user, input),
		},
	},
})