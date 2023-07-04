import { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { Services } from '../types'
import { createAdvertsGqlModule } from '../adverts/adverts-gql-module'
import { createProfileGqlModule } from '../profile/profile-gql-module'
import { createTermsGqlModule } from '../terms/terms-gql-module'
import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'

export const createHaffaGqlModule = ({ adverts, files, profiles, notifications }: Pick<Services, 'adverts'|'files'|'profiles'|'notifications'>): GraphQLModule => 
	mergeModules(
		createAdvertsGqlModule({ adverts, files, notifications }),
		createProfileGqlModule(profiles),
		createTermsGqlModule()
	)

const mergeModules = (...modules: GraphQLModule[]): GraphQLModule => ({
	schema: modules.map(({ schema }) => schema).join(''),
	resolvers: mergeResolvers(modules.map(({ resolvers }) => resolvers)),
})
const mergeResolvers = (resolvers: EntityResolverMap[]): EntityResolverMap => {
	const result: EntityResolverMap = {}
	resolvers.forEach(resolver => {
		Object.entries(resolver)
			.forEach(([ type, typeResolver ]) => {
				result[type] = {
					...result[type],
					...typeResolver,
				}
			})
	})
	return result
}
