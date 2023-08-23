import type { GraphQLModule } from "@helsingborg-stad/gdi-api-node"
import HttpStatusCodes from 'http-status-codes'
import type { Services } from "../types"
import { settingsGqlSchema } from "./settings.gql.schema"

export const createSettingsGqlModule = ({settings}: Pick<Services, 'settings'>): GraphQLModule => ({
	schema: settingsGqlSchema,
	resolvers:{
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			loginPolicies: async ({ctx}) => {
				const {user} = ctx
				if (!user.roles.includes('admin')) {
					ctx.throw(HttpStatusCodes.UNAUTHORIZED)	
				}
				return settings.getLoginPolicies()
			}
		},
		Mutation: {
			updateLoginPolicies: async ({ ctx, args: { input } }) => {
				const {user} = ctx
				if (!user.roles.includes('admin')) {
					ctx.throw(HttpStatusCodes.UNAUTHORIZED)	
				}
				return settings.updateLoginPolicies(input)
			}
		}
	}
})
