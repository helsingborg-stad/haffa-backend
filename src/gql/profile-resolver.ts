import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'
import { ProfileRepository } from '../profile/types'

export const profileResolver = (profiles: ProfileRepository): EntityResolverMap => ({
	Query: {
		profile: async ({ ctx: { user } }) => profiles.getProfile(user),
	},
	Mutation: {
		updateProfile: async ({ ctx: { user }, args: { input } }) => profiles.updateProfile(user, input),
	},
})